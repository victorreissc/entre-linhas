import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { api } from '../../shared/api.js';
import { usePolling } from '../../shared/usePolling.js';
import { modoDemoAtivo, resultadosDemo } from '../../shared/demo.js';
import { ler, gravar, remover } from '../../shared/armazenamento.js';

const Contexto = createContext(null);

export function DadosProvider({ children }) {
  const demo = useMemo(() => modoDemoAtivo(), []);
  const dadosDemo = useMemo(() => (demo ? resultadosDemo() : null), [demo]);

  const res = usePolling(api.resultados, { intervalo: 5000, ativo: !demo });
  const est = usePolling(api.estado, { intervalo: 4000, ativo: !demo });

  const [estadoDemo, setEstadoDemo] = useState({ modo: 'aguardando', rodada: null });
  const [pedidoChave, setPedidoChave] = useState(null); // { resolver, rejeitar, erro }
  const [enviando, setEnviando] = useState(false);
  const [erroControle, setErroControle] = useState(null);

  const pedirChave = useCallback((erroAnterior) => new Promise((resolver, rejeitar) => {
    setPedidoChave({ resolver, rejeitar, erro: erroAnterior || null });
  }), []);

  // Muda o que aparece nos celulares. Pede a senha do apresentador na primeira vez.
  const controlar = useCallback(async (novo) => {
    setErroControle(null);
    if (demo) { setEstadoDemo({ rodada: null, ...novo }); return true; }
    let chave = ler('el:chave-apresentador');
    if (!chave) {
      try { chave = await pedirChave(); } catch { return false; }
    }
    setEnviando(true);
    try {
      await api.controlar(novo, chave);
      gravar('el:chave-apresentador', chave);
      await est.atualizar();
      return true;
    } catch (e) {
      if (e.codigo === 'chave-invalida') {
        remover('el:chave-apresentador');
        setEnviando(false);
        try { chave = await pedirChave('Senha incorreta. Tente de novo.'); } catch { return false; }
        gravar('el:chave-apresentador', chave);
        return controlar(novo);
      }
      setErroControle(e.message);
      return false;
    } finally {
      setEnviando(false);
    }
  }, [demo, pedirChave, est]);

  const valor = useMemo(() => {
    const resultados = demo ? dadosDemo : res.dados;
    const estado = demo ? estadoDemo : est.dados;
    const erro = demo ? null : (res.erro || est.erro);
    return {
      demo,
      resultados,
      estado: estado || { modo: 'aguardando', rodada: null },
      carregando: !demo && res.carregando && !res.dados,
      erro,
      naoConfigurado: erro?.codigo === 'nao-configurado' || erro?.status === 503,
      ultimaAtualizacao: demo ? new Date() : res.ultimaAtualizacao,
      controlar,
      enviando,
      erroControle,
      limparErroControle: () => setErroControle(null),
      pedidoChave,
      responderChave: (chave) => { pedidoChave?.resolver(chave); setPedidoChave(null); },
      cancelarChave: () => { pedidoChave?.rejeitar(new Error('cancelado')); setPedidoChave(null); },
      atualizarAgora: () => { res.atualizar(); est.atualizar(); },
    };
  }, [demo, dadosDemo, res, est, estadoDemo, controlar, enviando, erroControle, pedidoChave]);

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useDados() {
  const v = useContext(Contexto);
  if (!v) throw new Error('useDados fora do DadosProvider');
  return v;
}
