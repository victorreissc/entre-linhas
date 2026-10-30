import { motion } from 'framer-motion';
import { Smartphone, ScanLine, BarChart3, ShieldCheck, Power } from 'lucide-react';
import { PROJETO } from '../../shared/projeto.js';
import { QR } from '../components/Comuns.jsx';
import { useDados } from '../hooks/DadosContexto.jsx';

const surgir = (atraso = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay: atraso, ease: [0.2, 0.7, 0.2, 1] },
});

// Linhas de "conversa" decorativas ao fundo da abertura.
function LinhasFundo() {
  const linhas = [62, 38, 80, 24, 55, 70, 30, 46];
  return (
    <div className="linhas-fundo" aria-hidden="true">
      {linhas.map((l, i) => (
        <motion.span
          key={i}
          style={{ width: `${l}%`, alignSelf: i % 2 ? 'flex-end' : 'flex-start' }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.4, delay: 0.2 + i * 0.12, ease: [0.2, 0.7, 0.2, 1] }}
        />
      ))}
    </div>
  );
}

export function Abertura() {
  return (
    <section className="slide slide--abertura">
      <LinhasFundo />
      <div className="abertura">
        <motion.p className="rotulo" {...surgir(0.1)}>{PROJETO.disciplina} · {PROJETO.professor}</motion.p>
        <motion.h1 className="serifa abertura__titulo" {...surgir(0.25)}>
          Entre <em>Linhas</em>
        </motion.h1>
        <motion.p className="abertura__subtitulo serifa" {...surgir(0.4)}>{PROJETO.subtitulo}</motion.p>
        <motion.p className="abertura__tema" {...surgir(0.55)}>
          Uma investigação sobre o <strong>impacto das mídias sociais na comunicação interpessoal</strong> — com a participação de vocês.
        </motion.p>
        <motion.div className="abertura__grupo" {...surgir(0.75)}>
          <span className="rotulo">Grupo</span>
          <ul>{PROJETO.grupo.map((n) => <li key={n}>{n}</li>)}</ul>
        </motion.div>
      </div>
    </section>
  );
}

export function ComoFunciona() {
  const { controlar, estado, demo, naoConfigurado } = useDados();
  const passos = [
    { icone: ScanLine, titulo: 'Aponte a câmera', texto: 'Leia o QR Code ou digite o endereço no navegador do celular.' },
    { icone: Smartphone, titulo: 'Deixe a página aberta', texto: 'As perguntas aparecem sozinhas quando abrirmos cada votação.' },
    { icone: BarChart3, titulo: 'Veja o resultado', texto: 'As respostas da turma viram gráficos aqui, ao vivo.' },
  ];
  return (
    <section className="slide">
      <div className="grade-2 grade-2--centro">
        <div>
          <p className="rotulo">Antes de começar</p>
          <h2 className="serifa titulo-slide">Peguem o celular.</h2>
          <ol className="passos">
            {passos.map(({ icone: I, titulo, texto }, i) => (
              <motion.li key={titulo} {...surgir(0.15 + i * 0.12)}>
                <span className="passos__icone"><I size={20} strokeWidth={1.6} /></span>
                <div><strong>{titulo}</strong><p>{texto}</p></div>
              </motion.li>
            ))}
          </ol>
          <div className="aviso aviso--info anonimato">
            <ShieldCheck size={18} />
            <span>Participação anônima e voluntária. Não pedimos nome, e-mail nem matrícula, e nenhuma resposta individual aparece na tela.</span>
          </div>
          {!naoConfigurado || demo ? (
            <button className="botao botao--fantasma botao--p" onClick={() => controlar({ modo: 'aguardando' })} disabled={estado.modo === 'aguardando'}>
              <Power size={14} /> {estado.modo === 'aguardando' ? 'Celulares em espera' : 'Colocar celulares em espera'}
            </button>
          ) : null}
        </div>
        <motion.div className="qr-destaque" {...surgir(0.3)}>
          <QR tamanho={260} />
        </motion.div>
      </div>
    </section>
  );
}

export function Capa({ numero, titulo, pergunta, descricao }) {
  return (
    <section className="slide slide--capa">
      <motion.span className="capa__numero serifa" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
        {String(numero).padStart(2, '0')}
      </motion.span>
      <div className="capa__texto">
        <motion.p className="rotulo" {...surgir(0.1)}>Experiência {numero}</motion.p>
        <motion.h2 className="serifa capa__titulo" {...surgir(0.2)}>{titulo}</motion.h2>
        {pergunta && <motion.p className="capa__pergunta serifa" {...surgir(0.35)}>{pergunta}</motion.p>}
        {descricao && <motion.p className="capa__descricao" {...surgir(0.5)}>{descricao}</motion.p>}
      </div>
    </section>
  );
}

export function Encerramento() {
  const { controlar, estado, demo, naoConfigurado } = useDados();
  return (
    <section className="slide slide--abertura">
      <LinhasFundo />
      <div className="abertura">
        <motion.p className="rotulo" {...surgir(0.1)}>Obrigado pela participação</motion.p>
        <motion.h2 className="serifa abertura__titulo abertura__titulo--menor" {...surgir(0.2)}>
          O que fica <em>entre as linhas</em> também comunica.
        </motion.h2>
        <motion.p className="abertura__tema" {...surgir(0.35)}>
          Antes de interpretar, pergunte. Antes de responder, respire. Quando importa, mude de canal.
        </motion.p>
        <motion.div className="abertura__grupo" {...surgir(0.5)}>
          <span className="rotulo">{PROJETO.disciplina} · {PROJETO.professor} · {PROJETO.ano}</span>
          <ul>{PROJETO.grupo.map((n) => <li key={n}>{n}</li>)}</ul>
        </motion.div>
        {(!naoConfigurado || demo) && (
          <motion.div {...surgir(0.65)}>
            <button className="botao botao--fantasma botao--p" onClick={() => controlar({ modo: 'encerrado' })} disabled={estado.modo === 'encerrado'}>
              <Power size={14} /> {estado.modo === 'encerrado' ? 'Participação encerrada nos celulares' : 'Encerrar participação nos celulares'}
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
