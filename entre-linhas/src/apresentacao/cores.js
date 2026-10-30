// Cores em hexadecimal para gráficos e SVG (atributos SVG não leem variáveis CSS de forma confiável).
export const COR = {
  fundo: '#070b1f',
  fundo2: '#0b1130',
  roxo: '#8b6cff',
  lavanda: '#c9b8ff',
  verde: '#5ee6a8',
  azul: '#7fb2ff',
  rosa: '#f0a6ca',
  texto: '#f4f1ea',
  texto3: 'rgba(244,241,234,0.46)',
  grade: 'rgba(201,184,255,0.08)',
};

export const COR_EIXO = { nv: COR.roxo, ps: COR.lavanda, em: COR.verde, vi: COR.azul, cf: COR.rosa };

export const ESTILO_TOOLTIP = {
  contentStyle: { background: COR.fundo2, border: '1px solid rgba(201,184,255,0.3)', borderRadius: 10, color: COR.texto },
  labelStyle: { color: COR.lavanda, fontWeight: 600 },
  itemStyle: { color: COR.texto },
  cursor: { fill: 'rgba(201,184,255,0.06)' },
};
