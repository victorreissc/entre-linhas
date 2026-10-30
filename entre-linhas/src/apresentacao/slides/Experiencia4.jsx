import { useMemo, useState } from 'react';
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip,
  BarChart, Bar, XAxis, YAxis, Cell, CartesianGrid, Legend,
} from 'recharts';
import { RefreshCw, Users, Vote, Clock } from 'lucide-react';
import { ComResultados, SemDados } from '../components/EstadoDados.jsx';
import { Abas, Indicador } from '../components/Comuns.jsx';
import { BarraLikert, LegendaLikert } from '../components/Likert.jsx';
import { useDados } from '../hooks/DadosContexto.jsx';
import { EIXOS, perguntasDoEixo, perguntaPorId } from '../../shared/conteudo/questionario.js';
import { indicesPorEixo, distribuicaoEscolha, resumoLikert, ITENS_LIKERT } from '../../shared/estatistica.js';
import { MIN_RESPOSTAS_QUESTIONARIO } from '../../shared/projeto.js';
import { COR, COR_EIXO, ESTILO_TOOLTIP } from '../cores.js';

// Libera o conteúdo só quando há respostas suficientes do questionário.
export function ComQuestionario({ children }) {
  return (
    <ComResultados>
      {(res) => {
        const q = res.questionario || { total: 0 };
        if (!q.perguntas || q.total < MIN_RESPOSTAS_QUESTIONARIO) {
          return (
            <SemDados
              titulo={`Aguardando respostas — ${q.total} de no mínimo ${MIN_RESPOSTAS_QUESTIONARIO}`}
              texto="Os gráficos aparecem automaticamente quando houver respostas suficientes para preservar o anonimato."
            />
          );
        }
        return children(q, res);
      }}
    </ComResultados>
  );
}

function Atualizacao() {
  const { ultimaAtualizacao, atualizarAgora, demo } = useDados();
  if (demo) return null;
  return (
    <button className="botao botao--fantasma botao--p atualizacao" onClick={atualizarAgora} title="Atualizar agora">
      <RefreshCw size={13} />
      {ultimaAtualizacao ? `Atualizado às ${ultimaAtualizacao.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}` : 'Atualizando…'}
    </button>
  );
}

// --- Visão geral -----------------------------------------------------------
export function SlideVisaoGeral() {
  return (
    <section className="slide">
      <div className="cabecalho-dash">
        <div>
          <p className="rotulo">Experiência 4 · Dashboard</p>
          <h2 className="serifa titulo-slide titulo-slide--m">O que a turma respondeu</h2>
        </div>
        <Atualizacao />
      </div>
      <ComResultados>
        {(res) => {
          const total = res.questionario?.total || 0;
          const votos = Object.values(res.rodadas || {}).reduce((s, r) => s + (r.total || 0), 0);
          const liberado = res.questionario?.perguntas && total >= MIN_RESPOSTAS_QUESTIONARIO;
          const indices = liberado ? indicesPorEixo(res.questionario.perguntas) : [];
          const maior = liberado ? [...indices].sort((a, b) => b.indice - a.indice)[0] : null;
          return (
            <>
              <div className="indicadores">
                <Indicador rotulo={<><Users size={12} /> Participantes</>} valor={total} nota="questionários completos" cor={COR.verde} />
                <Indicador rotulo={<><Vote size={12} /> Votos ao vivo</>} valor={votos} nota="nas experiências 1 e 2" />
                <Indicador rotulo="Eixo de maior concordância" valor={maior ? maior.curto : '—'} nota={maior ? `${maior.indice}% de concordância média` : 'aguardando respostas'} cor={maior ? COR_EIXO[maior.id] : undefined} />
                <Indicador rotulo={<><Clock size={12} /> Atualização</>} valor="5 s" nota="consulta automática à planilha" />
              </div>
              {!liberado ? (
                <SemDados titulo={`Aguardando respostas — ${total} de no mínimo ${MIN_RESPOSTAS_QUESTIONARIO}`} texto="Os gráficos por eixo aparecem assim que houver respostas suficientes." />
              ) : (
                <div className="grade-dash">
                  <div className="cartao">
                    <span className="rotulo">Índice de concordância por eixo</span>
                    <ResponsiveContainer width="100%" height={250}>
                      <RadarChart data={indices} outerRadius="72%">
                        <PolarGrid stroke="rgba(201,184,255,0.15)" />
                        <PolarAngleAxis dataKey="curto" tick={{ fill: COR.texto, fontSize: 13 }} />
                        <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar dataKey="indice" name="Concordância" stroke={COR.lavanda} fill={COR.roxo} fillOpacity={0.35} strokeWidth={2} isAnimationActive />
                        <Tooltip {...ESTILO_TOOLTIP} formatter={(v) => `${v}%`} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="cartao">
                    <span className="rotulo">Detalhe por eixo</span>
                    <ul className="ranking">
                      {indices.map((e) => (
                        <li key={e.id}>
                          <div className="ranking__topo">
                            <span><i style={{ background: COR_EIXO[e.id] }} />{e.nome}</span>
                            <strong className="mono">{e.indice}%</strong>
                          </div>
                          <div className="ranking__trilho"><div style={{ width: `${e.indice}%`, background: COR_EIXO[e.id] }} /></div>
                        </li>
                      ))}
                    </ul>
                    <p className="nota-pequena">Índice = média, entre os itens de escala do eixo, do percentual de pessoas que marcaram "concordo" ou "concordo totalmente".</p>
                  </div>
                </div>
              )}
            </>
          );
        }}
      </ComResultados>
    </section>
  );
}

// --- Por eixo --------------------------------------------------------------
function GraficoEscolha({ pergunta, dado, cor }) {
  const dist = distribuicaoEscolha(pergunta, dado);
  return (
    <div className="escolha">
      <p>{pergunta.texto}</p>
      <ResponsiveContainer width="100%" height={46 * dist.length + 10}>
        <BarChart data={dist} layout="vertical" margin={{ top: 0, right: 48, left: 0, bottom: 0 }}>
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis type="category" dataKey="texto" width={210} tick={{ fill: COR.texto, fontSize: 13 }} tickLine={false} axisLine={false} />
          <Tooltip {...ESTILO_TOOLTIP} formatter={(v, _n, p) => [`${v}% (${p.payload.valor})`, 'Respostas']} />
          <Bar dataKey="pct" radius={[0, 6, 6, 0]} barSize={22} label={{ position: 'right', fill: COR.texto, fontSize: 13, formatter: (v) => `${v}%` }}>
            {dist.map((d) => <Cell key={d.id} fill={cor} fillOpacity={d.pct === Math.max(...dist.map((x) => x.pct)) ? 1 : 0.5} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SlidePorEixo() {
  const [eixo, setEixo] = useState(EIXOS[0].id);
  return (
    <section className="slide">
      <div className="cabecalho-dash">
        <div>
          <p className="rotulo">Experiência 4 · Resultados por eixo</p>
          <Abas abas={EIXOS} ativa={eixo} aoMudar={setEixo} />
        </div>
        <Atualizacao />
      </div>
      <ComQuestionario>
        {(q) => {
          const perguntas = perguntasDoEixo(eixo);
          return (
            <div className="por-eixo" key={eixo}>
              <div className="por-eixo__likert">
                {perguntas.filter((p) => p.tipo === 'likert').map((p, i) => <BarraLikert key={p.id} pergunta={p} dado={q.perguntas[p.id]} indice={i} />)}
                <LegendaLikert />
              </div>
              {perguntas.filter((p) => p.tipo === 'escolha').map((p) => (
                <div className="cartao" key={p.id}><GraficoEscolha pergunta={p} dado={q.perguntas[p.id]} cor={COR_EIXO[eixo]} /></div>
              ))}
            </div>
          );
        }}
      </ComQuestionario>
    </section>
  );
}

// --- Comparações -----------------------------------------------------------
const PARES = [
  { a: 'nv1', b: 'em1', titulo: 'Sinto falta de pistas × percebo o outro' },
  { a: 'cf1', b: 'cf2', titulo: 'Conflito começa fácil × digo o que não diria' },
  { a: 'vi1', b: 'em3', titulo: 'Redes mantêm laços × apoio é melhor ao vivo' },
  { a: 'ps1', b: 'ps2', titulo: 'Já interpretei mal × respostas curtas confundem' },
];

export function SlideComparacoes() {
  const [par, setPar] = useState(0);
  const [a, setA] = useState(PARES[0].a);
  const [b, setB] = useState(PARES[0].b);
  const escolherPar = (i) => { setPar(i); setA(PARES[i].a); setB(PARES[i].b); };
  const pa = perguntaPorId(a), pb = perguntaPorId(b);
  return (
    <section className="slide">
      <div className="cabecalho-dash">
        <div>
          <p className="rotulo">Experiência 4 · Comparações</p>
          <h2 className="serifa titulo-slide titulo-slide--m">Coloque duas respostas lado a lado</h2>
        </div>
        <Atualizacao />
      </div>
      <div className="pares">
        {PARES.map((p, i) => (
          <button key={p.titulo} className={`chip ${par === i && a === p.a && b === p.b ? 'chip--ativo' : ''}`} onClick={() => escolherPar(i)}>{p.titulo}</button>
        ))}
      </div>
      <div className="seletores">
        <Seletor valor={a} aoMudar={setA} cor={COR.lavanda} rotulo="Item A" />
        <Seletor valor={b} aoMudar={setB} cor={COR.verde} rotulo="Item B" />
      </div>
      <ComQuestionario>
        {(q) => <GraficoComparacao pa={pa} pb={pb} q={q} />}
      </ComQuestionario>
    </section>
  );
}

function Seletor({ valor, aoMudar, cor, rotulo }) {
  return (
    <label className="seletor">
      <span className="rotulo" style={{ color: cor }}>{rotulo}</span>
      <select value={valor} onChange={(e) => aoMudar(e.target.value)}>
        {EIXOS.map((e) => (
          <optgroup key={e.id} label={e.nome}>
            {ITENS_LIKERT.filter((p) => p.eixo === e.id).map((p) => <option key={p.id} value={p.id}>{p.curto}</option>)}
          </optgroup>
        ))}
      </select>
    </label>
  );
}

function GraficoComparacao({ pa, pb, q }) {
  const ra = resumoLikert(q.perguntas[pa.id]);
  const rb = resumoLikert(q.perguntas[pb.id]);
  const dados = useMemo(() => [
    { nome: 'Discordam', A: ra.pDiscorda, B: rb.pDiscorda },
    { nome: 'Neutros', A: ra.pNeutro, B: rb.pNeutro },
    { nome: 'Concordam', A: ra.pConcorda, B: rb.pConcorda },
  ], [ra, rb]);
  return (
    <div className="grade-dash grade-dash--comparacao">
      <div className="cartao">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dados} margin={{ top: 20, right: 10, left: -10, bottom: 0 }} barGap={6}>
            <CartesianGrid stroke={COR.grade} vertical={false} />
            <XAxis dataKey="nome" tick={{ fill: COR.texto, fontSize: 14 }} tickLine={false} axisLine={false} />
            <YAxis domain={[0, 100]} unit="%" tick={{ fill: COR.texto3, fontSize: 12 }} tickLine={false} axisLine={false} />
            <Tooltip {...ESTILO_TOOLTIP} formatter={(v, n) => [`${v}%`, n === 'A' ? pa.curto : pb.curto]} />
            <Legend formatter={(v) => (v === 'A' ? pa.curto : pb.curto)} wrapperStyle={{ color: COR.texto, fontSize: 13 }} />
            <Bar dataKey="A" fill={COR.lavanda} radius={[6, 6, 0, 0]} label={{ position: 'top', fill: COR.texto, fontSize: 12, formatter: (v) => `${v}%` }} />
            <Bar dataKey="B" fill={COR.verde} radius={[6, 6, 0, 0]} label={{ position: 'top', fill: COR.texto, fontSize: 12, formatter: (v) => `${v}%` }} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="cartao comparacao-leitura">
        <div><span className="rotulo" style={{ color: COR.lavanda }}>A</span><p>{pa.texto}</p><strong className="serifa">{ra.pConcorda}% concordam</strong></div>
        <div><span className="rotulo" style={{ color: COR.verde }}>B</span><p>{pb.texto}</p><strong className="serifa">{rb.pConcorda}% concordam</strong></div>
        <p className="nota-pequena">Diferença de concordância: {Math.abs(ra.pConcorda - rb.pConcorda)} pontos percentuais. Comparação descritiva — com uma amostra pequena, diferenças não indicam relação de causa.</p>
      </div>
    </div>
  );
}
