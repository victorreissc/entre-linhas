import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Send, AlertTriangle, RotateCcw } from 'lucide-react';
import { api } from '../shared/api.js';
import { ler, gravar, remover, idSessao } from '../shared/armazenamento.js';
import { EIXOS, ESCALA_LIKERT, perguntasDoEixo, validarRespostas } from '../shared/conteudo/questionario.js';

export function Questionario({ demo, aoMudarAndamento }) {
  const [respostas, setRespostas] = useState(() => ler('el:rascunho', {}));
  const [passo, setPasso] = useState(0);
  const [status, setStatus] = useState(() => (ler('el:questionario-enviado', false) ? 'enviado' : 'respondendo'));
  const [erro, setErro] = useState(null);

  const eixo = EIXOS[passo];
  const perguntas = perguntasDoEixo(eixo.id);
  const passoCompleto = perguntas.every((p) => respostas[p.id] !== undefined);
  const ultimo = passo === EIXOS.length - 1;

  // Enquanto houver rascunho, a tela não é trocada se o apresentador mudar o modo.
  useEffect(() => {
    aoMudarAndamento(status !== 'enviado' && Object.keys(respostas).length > 0);
  }, [respostas, status, aoMudarAndamento]);

  const responder = (id, valor) => {
    const novo = { ...respostas, [id]: valor };
    setRespostas(novo);
    gravar('el:rascunho', novo);
  };

  const avancar = () => {
    setPasso((p) => p + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const enviar = async () => {
    const v = validarRespostas(respostas);
    if (!v.ok) { setErro('Ainda há perguntas sem resposta.'); return; }
    setStatus('enviando');
    setErro(null);
    try {
      if (demo) await new Promise((r) => setTimeout(r, 800));
      else await api.responder(v.limpo, idSessao());
      concluir();
    } catch (e) {
      if (e.codigo === 'duplicado') return concluir();
      setErro(e.message);
      setStatus('respondendo');
    }
  };

  const concluir = () => {
    gravar('el:questionario-enviado', true);
    remover('el:rascunho');
    setStatus('enviado');
    aoMudarAndamento(false);
  };

  if (status === 'enviado') {
    return (
      <motion.div className="tela" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
        <span className="tela__icone tela__icone--destaque"><CheckCircle2 size={24} strokeWidth={1.5} /></span>
        <h1 className="serifa">Respostas enviadas</h1>
        <p>Obrigado! Acompanhe na tela da sala como a turma respondeu.</p>
        <p className="aguardando"><span className="pulso" /> Deixe esta página aberta para as próximas votações</p>
      </motion.div>
    );
  }

  return (
    <motion.div className="tela tela--questionario" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div className="progresso-q" aria-label={`Etapa ${passo + 1} de ${EIXOS.length}`}>
        {EIXOS.map((e, i) => <span key={e.id} className={i < passo ? 'feito' : i === passo ? 'atual' : ''} />)}
      </div>
      <span className="rotulo">Etapa {passo + 1} de {EIXOS.length} · {eixo.nome}</span>

      <AnimatePresence mode="wait">
        <motion.div key={eixo.id} className="perguntas" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>
          {perguntas.map((p) => (
            <fieldset key={p.id} className="pergunta">
              <legend>{p.texto}</legend>
              {p.tipo === 'likert' ? (
                <>
                  <div className="escala" role="radiogroup">
                    {ESCALA_LIKERT.map((e) => (
                      <button key={e.valor} type="button" role="radio" aria-checked={respostas[p.id] === e.valor} aria-label={e.rotulo}
                        className={`escala__ponto ${respostas[p.id] === e.valor ? 'escala__ponto--marcado' : ''}`}
                        onClick={() => responder(p.id, e.valor)}>
                        {e.valor}
                      </button>
                    ))}
                  </div>
                  <div className="escala__extremos"><span>Discordo totalmente</span><span>Concordo totalmente</span></div>
                  {respostas[p.id] && <span className="escala__escolhido">{ESCALA_LIKERT.find((e) => e.valor === respostas[p.id]).rotulo}</span>}
                </>
              ) : (
                <div className="opcoes" role="radiogroup">
                  {p.opcoes.map((o) => (
                    <button key={o.id} type="button" role="radio" aria-checked={respostas[p.id] === o.id}
                      className={`opcao opcao--compacta ${respostas[p.id] === o.id ? 'opcao--marcada' : ''}`}
                      onClick={() => responder(p.id, o.id)}>
                      {o.texto}
                    </button>
                  ))}
                </div>
              )}
            </fieldset>
          ))}
        </motion.div>
      </AnimatePresence>

      {erro && (
        <div className="aviso aviso--erro">
          <AlertTriangle size={16} />
          <div>{erro}{status !== 'enviando' && <> Suas respostas continuam salvas neste aparelho.</>}</div>
        </div>
      )}

      <div className="navegacao-q">
        <button className="botao" onClick={() => setPasso((p) => p - 1)} disabled={passo === 0 || status === 'enviando'}>
          <ArrowLeft size={16} /> Voltar
        </button>
        {!ultimo ? (
          <button className="botao botao--primario" onClick={avancar} disabled={!passoCompleto}>
            Próxima <ArrowRight size={16} />
          </button>
        ) : (
          <button className="botao botao--verde" onClick={enviar} disabled={!passoCompleto || status === 'enviando'}>
            {status === 'enviando' ? <><Loader2 size={16} className="girando" /> Enviando…</> : erro ? <><RotateCcw size={16} /> Tentar de novo</> : <><Send size={16} /> Enviar respostas</>}
          </button>
        )}
      </div>
    </motion.div>
  );
}
