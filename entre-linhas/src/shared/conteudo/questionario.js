// ============================================================================
// Questionário da Experiência 3 — cinco eixos, 3 perguntas por eixo.
// Itens criados pelo grupo para fins didáticos (não é um instrumento validado).
// Este arquivo é a fonte única: o celular, a validação do servidor
// e o dashboard leem daqui.
// ============================================================================

export const ESCALA_LIKERT = [
  { valor: 1, rotulo: 'Discordo totalmente', curto: 'DT' },
  { valor: 2, rotulo: 'Discordo', curto: 'D' },
  { valor: 3, rotulo: 'Neutro', curto: 'N' },
  { valor: 4, rotulo: 'Concordo', curto: 'C' },
  { valor: 5, rotulo: 'Concordo totalmente', curto: 'CT' },
];

export const EIXOS = [
  { id: 'nv', nome: 'Comunicação não verbal', curto: 'Não verbal', cor: 'var(--roxo)' },
  { id: 'ps', nome: 'Percepção social', curto: 'Percepção', cor: 'var(--lavanda)' },
  { id: 'em', nome: 'Empatia', curto: 'Empatia', cor: 'var(--verde)' },
  { id: 'vi', nome: 'Construção de vínculos', curto: 'Vínculos', cor: 'var(--azul)' },
  { id: 'cf', nome: 'Conflitos interpessoais', curto: 'Conflitos', cor: 'var(--rosa)' },
];

export const PERGUNTAS = [
  // Comunicação não verbal
  { id: 'nv1', eixo: 'nv', tipo: 'likert', texto: 'Sinto falta de expressões faciais e tom de voz para entender bem uma mensagem escrita.', curto: 'Sinto falta de rosto e voz no texto' },
  { id: 'nv2', eixo: 'nv', tipo: 'likert', texto: 'Uso emojis, figurinhas ou pontuação para deixar claro o tom do que escrevo.', curto: 'Uso emojis e pontuação para marcar o tom' },
  {
    id: 'nv3', eixo: 'nv', tipo: 'escolha', texto: 'Para ter uma conversa importante, qual canal você prefere?', curto: 'Canal preferido para conversas importantes',
    opcoes: [
      { id: 'texto', texto: 'Mensagem de texto' },
      { id: 'audio', texto: 'Áudio' },
      { id: 'video', texto: 'Chamada de vídeo ou ligação' },
      { id: 'presencial', texto: 'Pessoalmente' },
    ],
  },

  // Percepção social
  { id: 'ps1', eixo: 'ps', tipo: 'likert', texto: 'Já interpretei uma mensagem como grosseira e depois descobri que não era essa a intenção.', curto: 'Já interpretei mal uma mensagem como grosseira' },
  { id: 'ps2', eixo: 'ps', tipo: 'likert', texto: 'Respostas curtas, como "ok" ou "tá", me deixam em dúvida sobre o humor da pessoa.', curto: 'Respostas curtas me deixam em dúvida' },
  { id: 'ps3', eixo: 'ps', tipo: 'likert', texto: 'Fico ansioso(a) quando minha mensagem é visualizada e não respondida.', curto: 'Visualizado sem resposta me deixa ansioso(a)' },

  // Empatia
  { id: 'em1', eixo: 'em', tipo: 'likert', texto: 'Consigo perceber quando alguém está mal mesmo só por mensagens.', curto: 'Percebo quando alguém está mal por mensagem' },
  { id: 'em2', eixo: 'em', tipo: 'likert', texto: 'Antes de responder algo delicado por mensagem, penso em como a outra pessoa vai se sentir.', curto: 'Penso no outro antes de responder algo delicado' },
  { id: 'em3', eixo: 'em', tipo: 'likert', texto: 'Acho mais fácil demonstrar apoio pessoalmente do que pelas redes.', curto: 'Apoio é mais fácil pessoalmente' },

  // Construção de vínculos
  { id: 'vi1', eixo: 'vi', tipo: 'likert', texto: 'As redes sociais me ajudam a manter amizades que, sem elas, eu acabaria perdendo.', curto: 'Redes ajudam a manter amizades' },
  { id: 'vi2', eixo: 'vi', tipo: 'likert', texto: 'Tenho amizades próximas que começaram no ambiente digital.', curto: 'Tenho amizades que começaram online' },
  {
    id: 'vi3', eixo: 'vi', tipo: 'escolha', texto: 'Quanto tempo por dia, em média, você passa em apps de mensagem e redes sociais?', curto: 'Tempo diário em redes e mensagens',
    opcoes: [
      { id: 'ate1', texto: 'Até 1 hora' },
      { id: '1a3', texto: 'De 1 a 3 horas' },
      { id: '3a5', texto: 'De 3 a 5 horas' },
      { id: 'mais5', texto: 'Mais de 5 horas' },
    ],
  },

  // Conflitos interpessoais
  { id: 'cf1', eixo: 'cf', tipo: 'likert', texto: 'Discussões começam com mais facilidade por mensagem do que pessoalmente.', curto: 'Discussões começam mais fácil por mensagem' },
  { id: 'cf2', eixo: 'cf', tipo: 'likert', texto: 'Já disse algo por mensagem que não teria dito cara a cara.', curto: 'Já disse por mensagem o que não diria cara a cara' },
  {
    id: 'cf3', eixo: 'cf', tipo: 'escolha', texto: 'Quando surge um conflito por mensagem, o que você costuma fazer?', curto: 'O que faço num conflito por mensagem',
    opcoes: [
      { id: 'na-hora', texto: 'Respondo na hora' },
      { id: 'esperar', texto: 'Espero me acalmar antes de responder' },
      { id: 'mudar-canal', texto: 'Proponho conversar por ligação ou pessoalmente' },
      { id: 'evitar', texto: 'Evito o assunto' },
    ],
  },
];

export function perguntasDoEixo(eixoId) {
  return PERGUNTAS.filter((p) => p.eixo === eixoId);
}

export function perguntaPorId(id) {
  return PERGUNTAS.find((p) => p.id === id) || null;
}

// Valida um conjunto de respostas contra o questionário.
// Retorna { ok, erro, limpo } — "limpo" só contém campos conhecidos.
export function validarRespostas(respostas) {
  if (!respostas || typeof respostas !== 'object') return { ok: false, erro: 'Respostas ausentes.' };
  const limpo = {};
  for (const p of PERGUNTAS) {
    const v = respostas[p.id];
    if (v === undefined || v === null || v === '') return { ok: false, erro: `Pergunta sem resposta: ${p.id}` };
    if (p.tipo === 'likert') {
      const n = Number(v);
      if (!Number.isInteger(n) || n < 1 || n > 5) return { ok: false, erro: `Valor inválido em ${p.id}` };
      limpo[p.id] = n;
    } else {
      if (!p.opcoes.some((o) => o.id === v)) return { ok: false, erro: `Opção inválida em ${p.id}` };
      limpo[p.id] = v;
    }
  }
  return { ok: true, limpo };
}
