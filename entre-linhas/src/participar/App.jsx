import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ShieldCheck, PlugZap, WifiOff, Loader2, CheckCircle2, MessagesSquare } from 'lucide-react';
import { api } from '../shared/api.js';
import { usePolling } from '../shared/usePolling.js';
import { ler, gravar } from '../shared/armazenamento.js';
import { PROJETO } from '../shared/projeto.js';
import { rodadaPorId } from '../shared/conteudo/rodadas.js';
import { Votacao } from './Votacao.jsx';
import { Questionario } from './Questionario.jsx';

// Modo de ensaio: /participar/?demo=1&modo=rodada&rodada=e1-ok
// Nada é enviado; uma faixa avisa na tela.
function lerDemo() {
  try {
    const p = new URLSearchParams(window.location.search);
    if (p.get('demo') !== '1') return null;
    return { modo: p.get('modo') || 'aguardando', rodada: p.get('rodada') || null };
  } catch { return null; }
}

function Cartao({ icone: I, titulo, children, destaque }) {
  return (
    <motion.div className="tela" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
      {I && <span className={`tela__icone ${destaque ? 'tela__icone--destaque' : ''}`}><I size={24} strokeWidth={1.5} /></span>}
      <h1 className="serifa">{titulo}</h1>
      {children}
    </motion.div>
  );
}

export default function App() {
  const demo = useMemo(lerDemo, []);
  const [consentiu, setConsentiu] = useState(() => ler('el:consentiu', false));
  const [questionarioEmAndamento, setQEmAndamento] = useState(false);
  const { dados, erro, carregando } = usePolling(api.estado, { intervalo: 3000, ativo: !demo && consentiu });

  const estado = demo || dados;
  const naoConfigurado = erro?.codigo === 'nao-configurado' || erro?.status === 503;

  let tela;
  if (!consentiu) {
    tela = (
      <Cartao key="consentimento" icone={ShieldCheck} titulo="Antes de participar">
        <p>Esta é uma atividade da disciplina <strong>{PROJETO.disciplina}</strong>, sobre o impacto das mídias sociais na comunicação.</p>
        <ul className="lista-check">
          <li>É <strong>anônima</strong>: não pedimos nome, e-mail, telefone ou matrícula.</li>
          <li>É <strong>voluntária</strong>: você pode parar quando quiser.</li>
          <li>Só aparecem <strong>resultados agregados</strong> da turma, nunca respostas individuais.</li>
        </ul>
        <button className="botao botao--primario botao--largo" onClick={() => { gravar('el:consentiu', true); setConsentiu(true); }}>
          Concordo em participar
        </button>
      </Cartao>
    );
  } else if (!estado && carregando) {
    tela = <Cartao key="carregando" icone={(p) => <Loader2 {...p} className="girando" />} titulo="Conectando…" />;
  } else if (!estado && naoConfigurado) {
    tela = (
      <Cartao key="nao-config" icone={PlugZap} titulo="Ainda não está no ar">
        <p>A conexão com a planilha da pesquisa não foi configurada. Avise o grupo que está apresentando.</p>
      </Cartao>
    );
  } else if (!estado && erro) {
    tela = (
      <Cartao key="erro" icone={WifiOff} titulo="Sem conexão">
        <p>{erro.message}</p>
        <p className="suave">Vamos tentar de novo automaticamente.</p>
      </Cartao>
    );
  } else if (questionarioEmAndamento || estado.modo === 'questionario') {
    tela = <Questionario key="questionario" demo={Boolean(demo)} aoMudarAndamento={setQEmAndamento} />;
  } else if (estado.modo === 'rodada' && rodadaPorId(estado.rodada)) {
    tela = <Votacao key={estado.rodada} rodada={rodadaPorId(estado.rodada)} demo={Boolean(demo)} />;
  } else if (estado.modo === 'encerrado') {
    tela = (
      <Cartao key="fim" icone={CheckCircle2} titulo="Obrigado por participar!" destaque>
        <p>A participação foi encerrada. Suas respostas ajudaram a construir a análise de hoje.</p>
      </Cartao>
    );
  } else {
    tela = (
      <Cartao key="espera" icone={MessagesSquare} titulo="Você está conectado">
        <p>Deixe esta página aberta. A próxima pergunta aparece aqui sozinha quando a votação for aberta.</p>
        <p className="aguardando"><span className="pulso" /> Aguardando o apresentador</p>
      </Cartao>
    );
  }

  return (
    <div className="participar">
      {demo && <div className="faixa-demo">Modo demonstração — nada é enviado</div>}
      <header className="participar__topo">
        <span className="serifa">Entre <em>Linhas</em></span>
        {consentiu && !demo && erro && estado && <span className="participar__alerta"><WifiOff size={13} /> reconectando</span>}
      </header>
      <main className="participar__conteudo">
        <AnimatePresence mode="wait">{tela}</AnimatePresence>
      </main>
      <footer className="participar__rodape">
        <span>{PROJETO.disciplina} · {PROJETO.professor}</span>
        <span>{PROJETO.grupo.join(', ')}</span>
      </footer>
    </div>
  );
}
