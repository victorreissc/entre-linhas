import { useState } from 'react';
import { motion } from 'framer-motion';
import { ESCALA_LIKERT } from '../../shared/conteudo/questionario.js';
import { resumoLikert, pct } from '../../shared/estatistica.js';

const CORES_ESCALA = ['#3a2f73', '#5a4aa8', 'rgba(244,241,234,0.22)', '#9f86ff', '#5ee6a8'];

// Barra empilhada de um item Likert (1→5), com detalhe ao passar o mouse.
export function BarraLikert({ pergunta, dado, indice = 0 }) {
  const [foco, setFoco] = useState(null);
  const r = resumoLikert(dado);
  const c = dado?.contagem || {};
  return (
    <div className="likert">
      <div className="likert__cabecalho">
        <p>{pergunta.texto}</p>
        <div className="likert__resumo">
          <strong className="serifa">{r.pConcorda}%</strong>
          <span>concordam</span>
        </div>
      </div>
      <div className="likert__barra" onMouseLeave={() => setFoco(null)}>
        {ESCALA_LIKERT.map((e, i) => {
          const p = pct(c[e.valor] || 0, r.n);
          if (!p) return null;
          return (
            <motion.div
              key={e.valor}
              className={`likert__segmento likert__segmento--v${e.valor}`}
              style={{ background: CORES_ESCALA[i] }}
              initial={{ width: 0 }}
              animate={{ width: `${p}%` }}
              transition={{ duration: 0.8, delay: indice * 0.1 + i * 0.05 }}
              onMouseEnter={() => setFoco({ ...e, p, v: c[e.valor] || 0 })}
            >
              {p >= 9 && <span className="mono">{p}%</span>}
            </motion.div>
          );
        })}
      </div>
      <div className="likert__rodape mono">
        {foco ? <span>{foco.rotulo}: {foco.v} {foco.v === 1 ? 'pessoa' : 'pessoas'} ({foco.p}%)</span> : <span>média {r.media.toFixed(1).replace('.', ',')} de 5 · n = {r.n}</span>}
      </div>
    </div>
  );
}

export function LegendaLikert() {
  return (
    <div className="legenda legenda--likert">
      {ESCALA_LIKERT.map((e, i) => (
        <span key={e.valor}><i style={{ background: CORES_ESCALA[i] }} />{e.rotulo}</span>
      ))}
    </div>
  );
}
