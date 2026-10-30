import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

// Barras horizontais de distribuição, com animação e destaque opcional.
// itens: [{ id, texto, valor, pct }]
export function Barras({ itens, destaque = null, cor = 'var(--roxo)', compacto = false }) {
  const max = Math.max(...itens.map((i) => i.pct), 1);
  return (
    <ul className={`barras ${compacto ? 'barras--compacto' : ''}`}>
      {itens.map((item, idx) => {
        const lider = item.pct === max && item.valor > 0;
        const certo = destaque && item.id === destaque;
        return (
          <li key={item.id} className="barras__item" title={`${item.texto}: ${item.valor} (${item.pct}%)`}>
            <div className="barras__cabecalho">
              <span className="barras__texto">
                {certo && <Check size={15} className="barras__check" aria-label="Intenção real" />}
                {item.texto}
              </span>
              <span className="barras__numero mono">
                {item.pct}%<small> · {item.valor}</small>
              </span>
            </div>
            <div className="barras__trilho">
              <motion.div
                className="barras__preenchimento"
                style={{ background: certo ? 'var(--verde)' : cor, opacity: lider || certo ? 1 : 0.55 }}
                initial={{ width: 0 }}
                animate={{ width: `${item.pct}%` }}
                transition={{ duration: 0.9, delay: idx * 0.08, ease: [0.2, 0.7, 0.2, 1] }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
