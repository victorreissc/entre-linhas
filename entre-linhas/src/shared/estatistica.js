// Cálculos feitos sobre AGREGADOS (contagens). Nenhuma resposta individual
// chega ao navegador.
import { PERGUNTAS, EIXOS, perguntasDoEixo } from './conteudo/questionario.js';

export function pct(parte, total) {
  if (!total) return 0;
  return Math.round((parte / total) * 100);
}

// Resumo de um item Likert a partir de { contagem: {1..5} }.
export function resumoLikert(dado) {
  const c = dado?.contagem || {};
  const n = [1, 2, 3, 4, 5].reduce((s, v) => s + (c[v] || 0), 0);
  const discorda = (c[1] || 0) + (c[2] || 0);
  const neutro = c[3] || 0;
  const concorda = (c[4] || 0) + (c[5] || 0);
  const media = n ? [1, 2, 3, 4, 5].reduce((s, v) => s + v * (c[v] || 0), 0) / n : 0;
  return {
    n,
    media,
    discorda, neutro, concorda,
    pDiscorda: pct(discorda, n), pNeutro: pct(neutro, n), pConcorda: pct(concorda, n),
  };
}

// Índice de concordância do eixo: média do % de "concordo/concordo totalmente"
// entre os itens Likert do eixo.
export function indiceEixo(eixoId, perguntas) {
  const itens = perguntasDoEixo(eixoId).filter((p) => p.tipo === 'likert');
  const resumos = itens.map((p) => resumoLikert(perguntas?.[p.id]));
  const validos = resumos.filter((r) => r.n > 0);
  if (!validos.length) return { indice: 0, media: 0 };
  return {
    indice: Math.round(validos.reduce((s, r) => s + r.pConcorda, 0) / validos.length),
    media: validos.reduce((s, r) => s + r.media, 0) / validos.length,
  };
}

export function indicesPorEixo(perguntas) {
  return EIXOS.map((e) => ({ ...e, ...indiceEixo(e.id, perguntas) }));
}

export function distribuicaoEscolha(pergunta, dado) {
  const c = dado?.contagem || {};
  const n = pergunta.opcoes.reduce((s, o) => s + (c[o.id] || 0), 0);
  return pergunta.opcoes.map((o) => ({ id: o.id, texto: o.texto, valor: c[o.id] || 0, pct: pct(c[o.id] || 0, n) }));
}

export function distribuicaoRodada(rodada, dado) {
  const c = dado?.contagem || {};
  const n = dado?.total || rodada.opcoes.reduce((s, o) => s + (c[o.id] || 0), 0);
  return rodada.opcoes.map((o) => ({ id: o.id, texto: o.texto, valor: c[o.id] || 0, pct: pct(c[o.id] || 0, n) }));
}

// Grau de consenso de uma rodada: % da opção mais votada.
export function consenso(dist) {
  const total = dist.reduce((s, d) => s + d.valor, 0);
  if (!total) return 0;
  return pct(Math.max(...dist.map((d) => d.valor)), total);
}

export const ITENS_LIKERT = PERGUNTAS.filter((p) => p.tipo === 'likert');
