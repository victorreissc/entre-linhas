import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Ear, HeartHandshake, MessageSquareQuote, Repeat, SunMedium, ArrowRight } from 'lucide-react';

const ESTRATEGIAS = [
  {
    id: 'escuta', icone: Ear, nome: 'Escuta ativa',
    principio: 'Antes de responder, mostre que entendeu: repita com suas palavras e pergunte.',
    antes: 'Tá, mas e aí? Vai ou não vai?',
    depois: 'Entendi que a semana tá bem pesada pra você. Prefere decidir isso amanhã, com mais calma?',
    base: 'Rogers & Farson, 1957',
  },
  {
    id: 'empatia', icone: HeartHandshake, nome: 'Perguntar antes de supor',
    principio: 'Troque a conclusão pela pergunta. O silêncio do outro tem mil explicações possíveis.',
    antes: 'Nossa, nem pra responder, né.',
    depois: 'Vi que você ainda não respondeu. Tá tudo bem por aí? Sem pressa.',
    base: 'Erro fundamental de atribuição',
  },
  {
    id: 'assertiva', icone: MessageSquareQuote, nome: 'Comunicação assertiva',
    principio: 'Observação + sentimento + necessidade + pedido. Fale do fato, não do caráter.',
    antes: 'Você nunca faz nada no grupo.',
    depois: 'Notei que as duas últimas partes ficaram comigo. Fiquei sobrecarregada e preciso que a gente divida melhor. Você pode ficar com a conclusão?',
    base: 'Comunicação Não Violenta',
  },
  {
    id: 'canal', icone: Repeat, nome: 'Mudar de canal no conflito',
    principio: 'Quando a conversa esquentar, troque o texto por voz ou encontro — e dê um tempo antes.',
    antes: '(23h47, quarto parágrafo seguido) …e outra coisa que eu não engoli foi…',
    depois: 'Acho que por mensagem a gente vai se desentender mais. Podemos conversar amanhã por ligação?',
    base: 'Riqueza da mídia · Desinibição online',
  },
  {
    id: 'clareza', icone: SunMedium, nome: 'Explicitar o tom',
    principio: 'Se o tom importa, escreva o tom. Contexto curto evita ansiedade longa.',
    antes: 'Precisamos conversar.',
    depois: 'Precisamos conversar sobre o cronograma do projeto — nada grave! Segunda às 9h funciona pra você?',
    base: 'Egocentrismo na comunicação escrita',
  },
];

function Estrategia({ e, indice }) {
  const [saudavel, setSaudavel] = useState(false);
  const I = e.icone;
  return (
    <motion.article className="estrategia" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 * indice }}>
      <header>
        <span className="estrategia__icone"><I size={18} strokeWidth={1.6} /></span>
        <h3>{e.nome}</h3>
      </header>
      <p className="estrategia__principio">{e.principio}</p>
      <div className="estrategia__exemplo">
        <AnimatePresence mode="wait">
          <motion.div
            key={saudavel ? 'depois' : 'antes'}
            className={`balao ${saudavel ? 'balao--saudavel' : 'balao--reativo'}`}
            initial={{ opacity: 0, rotateX: -40 }} animate={{ opacity: 1, rotateX: 0 }} exit={{ opacity: 0, rotateX: 40 }}
            transition={{ duration: 0.3 }}
          >
            <span className="rotulo">{saudavel ? 'Depois' : 'Antes'}</span>
            <span>{saudavel ? e.depois : e.antes}</span>
          </motion.div>
        </AnimatePresence>
      </div>
      <footer>
        <span className="mono">{e.base}</span>
        <button className="botao botao--fantasma botao--p" onClick={() => setSaudavel((s) => !s)}>
          {saudavel ? 'Ver antes' : 'Reescrever'} <ArrowRight size={14} />
        </button>
      </footer>
    </motion.article>
  );
}

export function SlideComunicacaoSaudavel() {
  return (
    <section className="slide">
      <p className="rotulo">Experiência 6 · Comunicação saudável</p>
      <h2 className="serifa titulo-slide titulo-slide--m">Cinco ajustes que mudam uma conversa</h2>
      <div className="estrategias">
        {ESTRATEGIAS.map((e, i) => <Estrategia key={e.id} e={e} indice={i} />)}
      </div>
    </section>
  );
}
