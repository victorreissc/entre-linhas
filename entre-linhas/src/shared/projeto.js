// Dados institucionais do trabalho — aparecem na abertura, no encerramento
// e no rodapé do site de participação.
export const PROJETO = {
  titulo: 'Entre Linhas',
  subtitulo: 'A Psicologia das Conversas Digitais',
  tema: 'Impacto das mídias sociais na comunicação interpessoal',
  disciplina: 'Psicologia aplicada à Comunicação',
  professor: 'Prof. Canuto Junior',
  grupo: ['Anny', 'Dirce', 'Douglas', 'Luiza', 'Sophia', 'Victor'],
  ano: 2026,
};

// Número mínimo de respostas para exibir qualquer recorte do questionário.
// Evita que alguém deduza a resposta individual de um colega.
export const MIN_RESPOSTAS_QUESTIONARIO = 5;
// Número mínimo de votos para revelar uma rodada ao vivo.
export const MIN_VOTOS_RODADA = 3;

// Endereço do site de participação. Em produção, usa o mesmo domínio.
export function urlParticipacao() {
  if (typeof window === 'undefined') return '/participar/';
  return `${window.location.origin}/participar/`;
}
