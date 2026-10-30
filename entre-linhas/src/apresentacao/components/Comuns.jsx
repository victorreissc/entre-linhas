import { useEffect, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { KeyRound, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { urlParticipacao } from '../../shared/projeto.js';
import { useDados } from '../hooks/DadosContexto.jsx';

export function QR({ tamanho = 220 }) {
  const url = urlParticipacao();
  return (
    <figure className="qr">
      <div className="qr__codigo">
        <QRCodeSVG value={url} size={tamanho} bgColor="#f4f1ea" fgColor="#070b1f" level="M" marginSize={2} />
      </div>
      <figcaption className="mono">{url.replace(/^https?:\/\//, '')}</figcaption>
    </figure>
  );
}

export function Abas({ abas, ativa, aoMudar }) {
  return (
    <div className="abas" role="tablist">
      {abas.map((a) => (
        <button
          key={a.id}
          role="tab"
          aria-selected={ativa === a.id}
          className={`abas__aba ${ativa === a.id ? 'abas__aba--ativa' : ''}`}
          onClick={() => aoMudar(a.id)}
        >
          {a.cor && <span className="abas__ponto" style={{ background: a.cor }} />}
          {a.nome}
        </button>
      ))}
    </div>
  );
}

// Número que conta de 0 até o valor.
export function NumeroAnimado({ valor, sufixo = '' }) {
  const [atual, setAtual] = useState(0);
  const anterior = useRef(0);
  useEffect(() => {
    const inicio = anterior.current;
    const t0 = performance.now();
    let raf;
    const passo = (t) => {
      const p = Math.min(1, (t - t0) / 700);
      const e = 1 - (1 - p) ** 3;
      setAtual(Math.round(inicio + (valor - inicio) * e));
      if (p < 1) raf = requestAnimationFrame(passo);
      else anterior.current = valor;
    };
    raf = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(raf);
  }, [valor]);
  return <>{atual}{sufixo}</>;
}

export function Indicador({ rotulo, valor, sufixo = '', nota, cor = 'var(--texto)' }) {
  return (
    <div className="indicador">
      <span className="rotulo">{rotulo}</span>
      <strong className="indicador__valor serifa" style={{ color: cor }}>
        {typeof valor === 'number' ? <NumeroAnimado valor={valor} sufixo={sufixo} /> : valor}
      </strong>
      {nota && <span className="indicador__nota">{nota}</span>}
    </div>
  );
}

export function ModalChave() {
  const { pedidoChave, responderChave, cancelarChave } = useDados();
  const [valor, setValor] = useState('');
  const campo = useRef(null);
  useEffect(() => { if (pedidoChave) { setValor(''); setTimeout(() => campo.current?.focus(), 50); } }, [pedidoChave]);
  if (!pedidoChave) return null;
  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="titulo-chave" onKeyDown={(e) => e.stopPropagation()}>
      <motion.form
        className="modal__caixa cartao"
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        onSubmit={(e) => { e.preventDefault(); if (valor.trim()) responderChave(valor.trim()); }}
      >
        <button type="button" className="modal__fechar botao botao--fantasma botao--p" onClick={cancelarChave} aria-label="Cancelar"><X size={16} /></button>
        <KeyRound size={22} strokeWidth={1.5} color="var(--lavanda)" />
        <h3 id="titulo-chave" className="serifa">Senha do apresentador</h3>
        <p>Necessária para abrir e encerrar votações nos celulares. Fica salva neste navegador.</p>
        {pedidoChave.erro && <p className="aviso aviso--erro">{pedidoChave.erro}</p>}
        <input ref={campo} type="password" className="campo" value={valor} onChange={(e) => setValor(e.target.value)} placeholder="Senha definida em PRESENTER_KEY" autoComplete="off" />
        <button type="submit" className="botao botao--primario" disabled={!valor.trim()}>Confirmar</button>
      </motion.form>
    </div>
  );
}
