// ============================================================================
// DADOS DEMONSTRATIVOS — somente para ensaio.
// Ativados apenas com ?demo=1 na URL da apresentação. Sempre exibidos com
// uma faixa de aviso. Nunca são enviados nem misturados aos dados reais.
// ============================================================================
import { PERGUNTAS } from './conteudo/questionario.js';
import { TODAS_RODADAS } from './conteudo/rodadas.js';

export function modoDemoAtivo() {
  try { return new URLSearchParams(window.location.search).get('demo') === '1'; } catch { return false; }
}

// Gerador pseudoaleatório determinístico (mesmos números a cada ensaio).
function gerador(semente) {
  let s = semente;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function sortear(pesos, aleatorio) {
  const total = pesos.reduce((a, b) => a + b, 0);
  let r = aleatorio() * total;
  for (let i = 0; i < pesos.length; i++) { r -= pesos[i]; if (r <= 0) return i; }
  return pesos.length - 1;
}

// Pesos inventados para o ensaio parecer plausível. NÃO são resultados.
const PESOS_RODADAS = {
  'e1-ok': [5, 9, 6, 3], 'e1-conversar': [13, 3, 5, 2], 'e1-otimo': [3, 12, 6, 2], 'e1-visualizado': [6, 9, 4, 4],
  'e2-texto': [4, 10, 3, 6], 'e2-audio': [13, 2, 2, 6], 'e2-presencial': [20, 0, 1, 2],
};

export function resultadosDemo(totalParticipantes = 23) {
  const al = gerador(42);
  const rodadas = {};
  for (const r of TODAS_RODADAS) {
    const pesos = PESOS_RODADAS[r.id] || [1, 1, 1, 1];
    const contagem = Object.fromEntries(r.opcoes.map((o) => [o.id, 0]));
    for (let i = 0; i < totalParticipantes; i++) contagem[r.opcoes[sortear(pesos, al)].id]++;
    rodadas[r.id] = { total: totalParticipantes, contagem };
  }
  const perguntas = {};
  for (const p of PERGUNTAS) {
    if (p.tipo === 'likert') {
      const inclinacao = { nv1: 4, nv2: 4, ps1: 4, ps2: 4, ps3: 3, em1: 3, em2: 4, em3: 4, vi1: 4, vi2: 2, cf1: 4, cf2: 3 }[p.id] || 3;
      const pesos = [1, 2, 3, 4, 5].map((v) => Math.max(0.4, 3 - Math.abs(v - inclinacao) * 1.2));
      const contagem = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      for (let i = 0; i < totalParticipantes; i++) contagem[sortear(pesos, al) + 1]++;
      perguntas[p.id] = { contagem };
    } else {
      const pesos = { nv3: [3, 2, 4, 9], vi3: [1, 6, 9, 5], cf3: [4, 8, 6, 5] }[p.id] || p.opcoes.map(() => 1);
      const contagem = Object.fromEntries(p.opcoes.map((o) => [o.id, 0]));
      for (let i = 0; i < totalParticipantes; i++) contagem[p.opcoes[sortear(pesos, al)].id]++;
      perguntas[p.id] = { contagem };
    }
  }
  return {
    demo: true,
    atualizadoEm: new Date().toISOString(),
    rodadas,
    questionario: { total: totalParticipantes, perguntas },
  };
}
