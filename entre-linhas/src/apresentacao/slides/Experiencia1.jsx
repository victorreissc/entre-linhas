import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, ArrowLeft, Lightbulb } from 'lucide-react';
import { Celular } from '../components/Celular.jsx';
import { RodadaAoVivo } from '../components/RodadaAoVivo.jsx';

export function SlideConversa({ conversa }) {
  const [explicando, setExplicando] = useState(false);
  return (
    <section className="slide">
      <div className="grade-2">
        <div className="coluna-celular">
          <p className="contexto-cena">{conversa.contexto}</p>
          <Celular contato={conversa.contato} mensagens={conversa.mensagens} />
        </div>
        <div className="coluna-conteudo">
          <p className="rotulo">{conversa.rotulo} · Experiência 1</p>
          <AnimatePresence mode="wait">
            {!explicando ? (
              <motion.div key="votacao" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                <h2 className="serifa titulo-slide titulo-slide--m">{conversa.pergunta}</h2>
                <RodadaAoVivo rodada={conversa} />
                <button className="botao botao--fantasma ver-explicacao" onClick={() => setExplicando(true)}>
                  <Lightbulb size={16} /> O que a Psicologia diz
                </button>
              </motion.div>
            ) : (
              <motion.div key="explicacao" className="explicacao" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                <span className="explicacao__conceito">{conversa.conceito}</span>
                {conversa.explicacao.map((p, i) => (
                  <motion.p key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.12 }}>{p}</motion.p>
                ))}
                <p className="referencia"><BookOpen size={14} /> {conversa.referencia}</p>
                <button className="botao botao--fantasma botao--p" onClick={() => setExplicando(false)}>
                  <ArrowLeft size={14} /> Voltar aos votos
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
