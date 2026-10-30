import { useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, Eye, Hand, AudioLines, MapPin, Sparkles } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { LABORATORIO } from '../../shared/conteudo/rodadas.js';
import { RodadaAoVivo } from '../components/RodadaAoVivo.jsx';
import { Barras } from '../components/Barras.jsx';
import { ComResultados, SemDados } from '../components/EstadoDados.jsx';
import { distribuicaoRodada, consenso } from '../../shared/estatistica.js';
import { MIN_VOTOS_RODADA } from '../../shared/projeto.js';
import { COR, ESTILO_TOOLTIP } from '../cores.js';

// --- Estímulos -------------------------------------------------------------
function EstimuloTexto() {
  return (
    <div className="estimulo estimulo--texto">
      <div className="balao balao--outro balao--enorme">
        <span>{LABORATORIO.frase}</span>
        <span className="balao__hora mono">09:12</span>
      </div>
    </div>
  );
}

function EstimuloAudio({ prosodia }) {
  const W = 560, H = 190, padX = 40;
  const n = prosodia.palavras.length;
  const pontos = prosodia.palavras.map((p, i) => ({
    x: padX + (i * (W - padX * 2)) / (n - 1),
    y: H - 30 - p.altura * (H - 70),
    ...p,
  }));
  const caminho = pontos.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const a = pontos[i - 1];
    const cx = (a.x + p.x) / 2;
    return `${acc} C ${cx} ${a.y}, ${cx} ${p.y}, ${p.x} ${p.y}`;
  }, '');
  return (
    <div className="estimulo estimulo--audio">
      <div className="prosodia">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Curva de entonação ascendente com ênfase em fez">
          <defs>
            <linearGradient id="gradTom" x1="0" x2="1">
              <stop offset="0" stopColor={COR.lavanda} />
              <stop offset="1" stopColor={COR.verde} />
            </linearGradient>
          </defs>
          <motion.path d={caminho} fill="none" stroke="url(#gradTom)" strokeWidth="3" strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.6, ease: 'easeInOut' }} />
          {pontos.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={4 + p.enfase * 2} fill={COR.fundo} stroke={COR.lavanda} strokeWidth="2" />
              <text x={p.x} y={p.y - 18 - p.enfase * 3} textAnchor="middle" className="prosodia__palavra"
                style={{ fontSize: 15 + p.enfase * 5, fontWeight: 400 + p.enfase * 100 }}>{p.t}</text>
            </g>
          ))}
          <text x={W - 8} y={H - 6} textAnchor="end" className="prosodia__eixo">tempo →</text>
          <text x={8} y={18} className="prosodia__eixo">altura da voz</text>
        </svg>
      </div>
      <ul className="notas-tom">
        {prosodia.notas.map((nota) => <li key={nota}><AudioLines size={14} /> {nota}</li>)}
      </ul>
      {prosodia.audioSrc && (
        <audio className="audio" controls src={prosodia.audioSrc} preload="auto">
          Seu navegador não reproduz áudio.
        </audio>
      )}
    </div>
  );
}

function Rosto() {
  return (
    <svg viewBox="0 0 220 220" className="rosto" role="img" aria-label="Ilustração: rosto sorrindo, sobrancelhas erguidas, mãos abertas">
      <g fill="none" stroke={COR.lavanda} strokeWidth="3" strokeLinecap="round">
        <circle cx="110" cy="88" r="56" />
        <path d="M80 62 q12 -12 24 -4" />
        <path d="M116 58 q12 -8 24 4" />
        <circle cx="90" cy="82" r="7" />
        <circle cx="130" cy="82" r="7" />
        <path d="M84 108 q26 26 52 0" stroke={COR.verde} />
        <path d="M60 204 q50 -60 100 0" />
        <path d="M62 196 q-14 -24 -6 -46 m6 46 q-4 -26 6 -44 m-6 44 q8 -22 18 -34" stroke={COR.verde} />
        <path d="M158 196 q14 -24 6 -46 m-6 46 q4 -26 -6 -44 m6 44 q-8 -22 -18 -34" stroke={COR.verde} />
      </g>
    </svg>
  );
}

const ICONES_PISTA = { Rosto: Eye, Corpo: Hand, Voz: Volume2, Contexto: MapPin };

function EstimuloPresencial({ pistas }) {
  return (
    <div className="estimulo estimulo--presencial">
      <Rosto />
      <ul className="pistas">
        {pistas.map((p, i) => {
          const I = ICONES_PISTA[p.tipo] || Sparkles;
          return (
            <motion.li key={p.tipo} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.15 }}>
              <I size={16} strokeWidth={1.6} />
              <div><span className="rotulo">{p.tipo}</span><p>{p.texto}</p></div>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}

// --- Slides ----------------------------------------------------------------
export function SlideContexto({ contexto }) {
  return (
    <section className="slide">
      <div className="lab-cabecalho">
        <p className="rotulo">Experiência 2 · {contexto.rotulo}</p>
        <div className="camadas" aria-label="Camadas de informação">
          {LABORATORIO.contextos.map((c) => (
            <span key={c.id} className={`camadas__item ${c.id === contexto.id ? 'camadas__item--ativa' : ''}`}>{c.nome}</span>
          ))}
        </div>
      </div>
      <div className="grade-2">
        <div className="coluna-estimulo">
          <p className="contexto-cena">{LABORATORIO.situacao}</p>
          {contexto.nome === 'Texto' && <EstimuloTexto />}
          {contexto.nome === 'Áudio' && <EstimuloAudio prosodia={contexto.prosodia} />}
          {contexto.nome === 'Presencial' && <EstimuloPresencial pistas={contexto.pistas} />}
        </div>
        <div className="coluna-conteudo">
          <h2 className="serifa titulo-slide titulo-slide--m">{contexto.pergunta}</h2>
          <RodadaAoVivo rodada={contexto} />
        </div>
      </div>
    </section>
  );
}

export function SlideComparacaoContextos() {
  const [revelar, setRevelar] = useState(false);
  return (
    <section className="slide">
      <p className="rotulo">Experiência 2 · Resultado</p>
      <h2 className="serifa titulo-slide titulo-slide--m">Mesma frase. Três leituras.</h2>
      <ComResultados>
        {(res) => {
          const series = LABORATORIO.contextos.map((c) => {
            const dado = res.rodadas?.[c.id];
            const ok = dado?.contagem && dado.total >= MIN_VOTOS_RODADA;
            const dist = ok ? distribuicaoRodada(c, dado) : null;
            return { c, dado, dist, consenso: dist ? consenso(dist) : null, acerto: dist ? dist.find((d) => d.id === LABORATORIO.intencaoReal).pct : null };
          });
          const algum = series.some((s) => s.dist);
          if (!algum) return <SemDados titulo="Ainda sem votos suficientes" texto={`Cada contexto precisa de ao menos ${MIN_VOTOS_RODADA} votos para aparecer aqui.`} />;
          const linha = series.map((s) => ({ nome: s.c.nome, consenso: s.consenso, acerto: s.acerto }));
          return (
            <div className="comparacao-lab">
              <div className="comparacao-lab__colunas">
                {series.map((s) => (
                  <div key={s.c.id} className="cartao">
                    <span className="rotulo">{s.c.nome}</span>
                    {s.dist ? <Barras itens={s.dist} compacto destaque={revelar ? LABORATORIO.intencaoReal : null} /> : <SemDados titulo="Poucos votos" />}
                  </div>
                ))}
              </div>
              <div className="cartao comparacao-lab__grafico">
                <div className="grafico-cabecalho">
                  <span className="rotulo">Como o contexto muda a leitura</span>
                  <div className="legenda">
                    <span><i style={{ background: 'var(--lavanda)' }} /> Consenso (opção mais votada)</span>
                    {revelar && <span><i style={{ background: 'var(--verde)' }} /> Acertaram a intenção real</span>}
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={linha} margin={{ top: 12, right: 24, left: 4, bottom: 0 }}>
                    <CartesianGrid stroke={COR.grade} vertical={false} />
                    <XAxis dataKey="nome" stroke={COR.texto3} tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 100]} unit="%" stroke={COR.texto3} tickLine={false} axisLine={false} width={48} />
                    <Tooltip {...ESTILO_TOOLTIP} cursor={false} formatter={(v) => (v === null ? '—' : `${v}%`)} />
                    <Line type="monotone" dataKey="consenso" name="Consenso" stroke={COR.lavanda} strokeWidth={3} dot={{ r: 5 }} connectNulls />
                    {revelar && <Line type="monotone" dataKey="acerto" name="Acertaram" stroke={COR.verde} strokeWidth={3} dot={{ r: 5 }} connectNulls />}
                  </LineChart>
                </ResponsiveContainer>
                {!revelar ? (
                  <button className="botao botao--verde botao--p" onClick={() => setRevelar(true)}><Sparkles size={14} /> Revelar a intenção real</button>
                ) : (
                  <motion.p className="intencao-real" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <strong>Intenção real:</strong> {LABORATORIO.intencaoRealTexto}
                  </motion.p>
                )}
              </div>
              <p className="nota-teoria">
                Pela <strong>Teoria da Riqueza da Mídia</strong> (Daft &amp; Lengel, 1986), canais variam na quantidade de pistas que transmitem —
                feedback imediato, tom de voz, expressões, linguagem corporal. Quanto mais ambígua a mensagem, mais ela depende de um canal rico.
              </p>
            </div>
          );
        }}
      </ComResultados>
    </section>
  );
}
