import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, Send, AlertTriangle } from 'lucide-react';
import { api } from '../shared/api.js';
import { ler, gravar, idSessao } from '../shared/armazenamento.js';

export function Votacao({ rodada, demo }) {
  const [escolha, setEscolha] = useState(null);
  const [status, setStatus] = useState(() => (ler('el:votos', {})[rodada.id] ? 'enviado' : 'livre'));
  const [erro, setErro] = useState(null);

  const marcarVotado = () => {
    const votos = ler('el:votos', {});
    votos[rodada.id] = true;
    gravar('el:votos', votos);
    setStatus('enviado');
  };

  const enviar = async () => {
    if (!escolha) return;
    setStatus('enviando');
    setErro(null);
    try {
      if (demo) await new Promise((r) => setTimeout(r, 600));
      else await api.votar(rodada.id, escolha, idSessao());
      marcarVotado();
    } catch (e) {
      if (e.codigo === 'duplicado') return marcarVotado();
      setErro(e.codigo === 'rodada-fechada' ? 'Esta votação já foi encerrada pelo apresentador.' : e.message);
      setStatus('livre');
    }
  };

  if (status === 'enviado') {
    return (
      <motion.div className="tela" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
        <span className="tela__icone tela__icone--destaque"><CheckCircle2 size={24} strokeWidth={1.5} /></span>
        <h1 className="serifa">Voto registrado</h1>
        <p>Olhe para a tela da sala. O resultado aparece quando a votação for revelada.</p>
        <p className="aguardando"><span className="pulso" /> Aguardando a próxima pergunta</p>
      </motion.div>
    );
  }

  return (
    <motion.div className="tela tela--votacao" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <span className="rotulo">Experiência {rodada.experiencia} · {rodada.rotulo}</span>
      {rodada.mensagens && (
        <div className="mini-conversa">
          {rodada.mensagens.filter((m) => m.de !== 'sistema').map((m, i) => (
            <div key={i} className={`mini-balao ${m.de === 'eu' ? 'mini-balao--eu' : ''}`}>
              {m.autor && <strong>{m.autor}: </strong>}{m.texto}
            </div>
          ))}
          {rodada.mensagens.filter((m) => m.de === 'sistema').map((m, i) => <span key={i} className="mini-sistema mono">{m.texto}</span>)}
        </div>
      )}
      <h1 className="serifa">{rodada.pergunta}</h1>
      <div className="opcoes" role="radiogroup" aria-label={rodada.pergunta}>
        {rodada.opcoes.map((o, i) => (
          <button
            key={o.id}
            role="radio"
            aria-checked={escolha === o.id}
            className={`opcao ${escolha === o.id ? 'opcao--marcada' : ''}`}
            onClick={() => setEscolha(o.id)}
            disabled={status === 'enviando'}
          >
            <span className="opcao__letra mono">{String.fromCharCode(65 + i)}</span>
            {o.texto}
          </button>
        ))}
      </div>
      {erro && <p className="aviso aviso--erro"><AlertTriangle size={16} /> {erro}</p>}
      <button className="botao botao--primario botao--largo" onClick={enviar} disabled={!escolha || status === 'enviando'}>
        {status === 'enviando' ? <><Loader2 size={16} className="girando" /> Enviando…</> : <><Send size={16} /> Enviar voto</>}
      </button>
    </motion.div>
  );
}
