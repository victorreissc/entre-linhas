import { useCallback, useEffect, useRef, useState } from 'react';

// Consulta periódica com:
// - pausa quando a aba fica oculta (economiza a cota do Google);
// - espera crescente após erros (5 s → 10 s → 20 s … até 60 s);
// - estados de carregamento e erro.
export function usePolling(buscar, { intervalo = 5000, ativo = true } = {}) {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(ativo);
  const [ultimaAtualizacao, setUltima] = useState(null);
  const falhas = useRef(0);
  const timer = useRef(null);
  const montado = useRef(true);
  const buscarRef = useRef(buscar);
  buscarRef.current = buscar;

  const executar = useCallback(async () => {
    clearTimeout(timer.current);
    try {
      const d = await buscarRef.current();
      if (!montado.current) return;
      setDados(d);
      setErro(null);
      setUltima(new Date());
      falhas.current = 0;
    } catch (e) {
      if (!montado.current) return;
      setErro(e);
      falhas.current += 1;
    } finally {
      if (montado.current) setCarregando(false);
    }
    if (!montado.current) return;
    // Integração não configurada: não adianta insistir rápido.
    const espera = falhas.current === 0
      ? intervalo
      : Math.min(60000, intervalo * 2 ** Math.min(falhas.current, 4));
    if (document.visibilityState === 'visible') timer.current = setTimeout(executar, espera);
  }, [intervalo]);

  useEffect(() => {
    montado.current = true;
    if (!ativo) { setCarregando(false); return () => { montado.current = false; }; }
    executar();
    const aoMudarVisibilidade = () => {
      if (document.visibilityState === 'visible') executar();
      else clearTimeout(timer.current);
    };
    document.addEventListener('visibilitychange', aoMudarVisibilidade);
    return () => {
      montado.current = false;
      clearTimeout(timer.current);
      document.removeEventListener('visibilitychange', aoMudarVisibilidade);
    };
  }, [executar, ativo]);

  return { dados, erro, carregando, ultimaAtualizacao, atualizar: executar };
}
