import { CONVERSAS, LABORATORIO } from '../../shared/conteudo/rodadas.js';
import { Abertura, ComoFunciona, Capa, Encerramento } from './Abertura.jsx';
import { SlideConversa } from './Experiencia1.jsx';
import { SlideContexto, SlideComparacaoContextos } from './Experiencia2.jsx';
import { SlideQuestionario } from './Experiencia3.jsx';
import { SlideVisaoGeral, SlidePorEixo, SlideComparacoes } from './Experiencia4.jsx';
import { SlideAnalise, SlideReferencias } from './Experiencia5.jsx';
import { SlideComunicacaoSaudavel } from './Experiencia6.jsx';

// Ordem da apresentação. "secao" alimenta a barra de progresso e o índice.
export const SECOES = [
  { id: 'inicio', nome: 'Início' },
  { id: 'e1', nome: 'Interpretação' },
  { id: 'e2', nome: 'Laboratório' },
  { id: 'e3', nome: 'Pesquisa' },
  { id: 'e4', nome: 'Dashboard' },
  { id: 'e5', nome: 'Análise' },
  { id: 'e6', nome: 'Comunicação saudável' },
  { id: 'fim', nome: 'Encerramento' },
];

export const SLIDES = [
  { id: 'abertura', secao: 'inicio', titulo: 'Abertura', render: () => <Abertura /> },
  { id: 'como-funciona', secao: 'inicio', titulo: 'Como participar', render: () => <ComoFunciona /> },

  { id: 'capa-e1', secao: 'e1', titulo: 'Experiência 1', render: () => (
    <Capa numero={1} titulo="Interpretação de mensagens" pergunta="O que você leu foi o que a pessoa quis dizer?" descricao="Quatro conversas ambíguas. Vote pelo celular em como você interpretaria cada uma." />
  ) },
  ...CONVERSAS.map((c) => ({ id: c.id, secao: 'e1', titulo: c.titulo, render: () => <SlideConversa conversa={c} /> })),

  { id: 'capa-e2', secao: 'e2', titulo: 'Experiência 2', render: () => (
    <Capa numero={2} titulo="Laboratório da comunicação" pergunta={`“${LABORATORIO.frase}”`} descricao="Uma única frase, revelada em três camadas: texto, áudio e presença. A cada camada, vote de novo." />
  ) },
  ...LABORATORIO.contextos.map((c) => ({ id: c.id, secao: 'e2', titulo: `Laboratório · ${c.nome}`, render: () => <SlideContexto contexto={c} /> })),
  { id: 'e2-comparacao', secao: 'e2', titulo: 'Laboratório · Resultado', render: () => <SlideComparacaoContextos /> },

  { id: 'capa-e3', secao: 'e3', titulo: 'Experiência 3', render: () => (
    <Capa numero={3} titulo="Pesquisa com a turma" pergunta="Como vocês se comunicam nas redes?" descricao="Um questionário anônimo sobre os cinco eixos do projeto, respondido agora, pelo celular." />
  ) },
  { id: 'questionario', secao: 'e3', titulo: 'Questionário', render: () => <SlideQuestionario /> },

  { id: 'capa-e4', secao: 'e4', titulo: 'Experiência 4', render: () => (
    <Capa numero={4} titulo="Dashboard de resultados" pergunta="Os dados de vocês, ao vivo." descricao="Respostas agregadas direto da planilha. Nenhuma resposta individual é exibida." />
  ) },
  { id: 'dash-geral', secao: 'e4', titulo: 'Visão geral', render: () => <SlideVisaoGeral /> },
  { id: 'dash-eixos', secao: 'e4', titulo: 'Por eixo', render: () => <SlidePorEixo /> },
  { id: 'dash-comparacoes', secao: 'e4', titulo: 'Comparações', render: () => <SlideComparacoes /> },

  { id: 'capa-e5', secao: 'e5', titulo: 'Experiência 5', render: () => (
    <Capa numero={5} titulo="Análise psicológica" pergunta="O que a ciência diz sobre o que vocês responderam?" descricao="Cada eixo, conectado a teorias da Psicologia Social e da Comunicação." />
  ) },
  { id: 'analise', secao: 'e5', titulo: 'Análise por eixo', render: () => <SlideAnalise /> },

  { id: 'capa-e6', secao: 'e6', titulo: 'Experiência 6', render: () => (
    <Capa numero={6} titulo="Comunicação saudável" pergunta="E agora, como escrever melhor?" descricao="Estratégias práticas para conversar nas telas com mais clareza e menos ruído." />
  ) },
  { id: 'estrategias', secao: 'e6', titulo: 'Estratégias', render: () => <SlideComunicacaoSaudavel /> },

  { id: 'referencias', secao: 'fim', titulo: 'Referências', render: () => <SlideReferencias /> },
  { id: 'encerramento', secao: 'fim', titulo: 'Encerramento', render: () => <Encerramento /> },
];
