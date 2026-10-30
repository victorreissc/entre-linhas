// ============================================================================
// Rodadas de votação ao vivo (Experiências 1 e 2).
// Conteúdo fictício criado para fins didáticos. Os VOTOS, porém, são reais:
// vêm do celular da turma e ficam na planilha.
// ============================================================================

const OPCOES_INTENCAO = [
  { id: 'a', texto: 'Elogio ou admiração' },
  { id: 'b', texto: 'Crítica ou irritação' },
  { id: 'c', texto: 'Preocupação' },
  { id: 'd', texto: 'Ironia ou deboche' },
];

// ---------------------------------------------------------------------------
// Experiência 1 — Interpretação de mensagens
// ---------------------------------------------------------------------------
export const CONVERSAS = [
  {
    id: 'e1-ok',
    rotulo: 'Conversa 1',
    titulo: 'O "Ok." depois de um textão',
    contexto: 'Você mandou uma mensagem longa para uma amiga explicando por que não vai conseguir ir ao aniversário dela no sábado.',
    contato: 'Bruna',
    mensagens: [
      { de: 'eu', texto: 'Bru, queria muito ir, mas minha mãe precisa de ajuda com a mudança justo no sábado e não consigo fugir disso. Fiquei super chateada, de verdade. Vamos marcar algo só nós duas na semana que vem?', hora: '19:42' },
      { de: 'ela', texto: 'Ok.', hora: '20:15' },
    ],
    pergunta: 'Como você interpreta o "Ok." da Bruna?',
    opcoes: [
      { id: 'a', texto: 'Ela entendeu e está tudo bem' },
      { id: 'b', texto: 'Ela ficou chateada comigo' },
      { id: 'c', texto: 'Ela está ocupada e respondeu rápido' },
      { id: 'd', texto: 'Ela não se importou muito' },
    ],
    conceito: 'Ambiguidade e pistas ausentes',
    explicacao: [
      'Uma resposta curta carrega pouquíssima informação. Sem rosto, voz ou contexto, quem lê precisa preencher as lacunas — e preenche com as próprias expectativas, inseguranças e o histórico da relação.',
      'A pontuação vira pista emocional. Em um estudo da Universidade de Binghamton, mensagens de texto que terminavam com ponto final foram avaliadas como menos sinceras do que as mesmas mensagens sem ponto; em bilhetes escritos à mão, essa diferença não apareceu.',
      'A dispersão dos votos da turma é o próprio fenômeno: a mesma palavra, lida por pessoas diferentes, gera intenções diferentes.',
    ],
    referencia: 'Gunraj, D. N. et al. (2016). Texting insincerely: The role of the period in text messaging. Computers in Human Behavior, 55, 1067–1075.',
  },
  {
    id: 'e1-conversar',
    rotulo: 'Conversa 2',
    titulo: 'A mensagem de sexta à tarde',
    contexto: 'É sexta-feira, 17h48. Você está saindo do estágio quando chega uma mensagem da sua coordenadora.',
    contato: 'Coordenadora Márcia',
    mensagens: [
      { de: 'ela', texto: 'Oi! Segunda cedo você consegue passar na minha sala? Precisamos conversar.', hora: '17:48' },
    ],
    pergunta: 'Qual foi sua primeira reação?',
    opcoes: [
      { id: 'a', texto: 'Fiquei preocupado(a): fiz algo errado' },
      { id: 'b', texto: 'Deve ser uma notícia boa ou uma oportunidade' },
      { id: 'c', texto: 'É só um alinhamento de rotina' },
      { id: 'd', texto: 'Não dá para saber, então não pensaria nisso' },
    ],
    conceito: 'Viés de negatividade na comunicação escrita',
    explicacao: [
      'Diante de uma mensagem neutra e incompleta, tendemos a imaginar o pior cenário. Revisões sobre comunicação por e-mail apontam que mensagens escritas costumam ser percebidas como mais negativas do que o remetente pretendia.',
      'O horário, a falta de detalhes e a assimetria de poder (coordenadora → estagiário) ampliam a ansiedade antecipatória: o cérebro trata a incerteza como ameaça.',
      'Um detalhe a mais — "precisamos conversar sobre o novo projeto" — mudaria toda a leitura. Quem envia raramente percebe essa lacuna.',
    ],
    referencia: 'Byron, K. (2008). Carrying too heavy a load? The communication and miscommunication of emotion by email. Academy of Management Review, 33(2), 309–327.',
  },
  {
    id: 'e1-otimo',
    rotulo: 'Conversa 3',
    titulo: '"Nossa, que ótimo."',
    contexto: 'No grupo do trabalho da faculdade, você avisa que vai precisar remarcar a reunião combinada.',
    contato: 'Grupo — Trabalho Final',
    mensagens: [
      { de: 'eu', texto: 'Gente, surgiu um imprevisto. Dá para passar a reunião de hoje para amanhã às 7h?', hora: '14:03' },
      { de: 'ela', autor: 'Rafa', texto: 'Nossa, que ótimo.', hora: '14:05' },
    ],
    pergunta: 'O que o Rafa quis dizer?',
    opcoes: [
      { id: 'a', texto: 'Foi sincero: o novo horário é bom para ele' },
      { id: 'b', texto: 'Foi irônico: ele odiou a mudança' },
      { id: 'c', texto: 'Está irritado, mas tentando disfarçar' },
      { id: 'd', texto: 'Não tenho como saber' },
    ],
    conceito: 'Egocentrismo na comunicação mediada',
    explicacao: [
      'Quem escreve "ouve" mentalmente o próprio tom de voz — e supõe que o leitor também vai ouvir. O leitor, porém, só recebe as palavras.',
      'Em experimentos de Kruger e colegas (2005), remetentes esperavam que cerca de 78% dos leitores identificassem corretamente se uma frase era sarcástica ou séria. Por e-mail, o acerto foi de aproximadamente 56% — pouco acima do acaso. Por voz, chegou a cerca de 73%.',
      'Ironia é especialmente frágil no texto: depende quase toda da entonação.',
    ],
    referencia: 'Kruger, J., Epley, N., Parker, J., & Ng, Z.-W. (2005). Egocentrism over e-mail: Can we communicate as well as we think? Journal of Personality and Social Psychology, 89(6), 925–936.',
  },
  {
    id: 'e1-visualizado',
    rotulo: 'Conversa 4',
    titulo: 'Visualizado às 14:02',
    contexto: 'Você mandou uma mensagem importante para um amigo próximo. Ele visualizou, ficou online várias vezes, mas não respondeu. Já se passaram três horas.',
    contato: 'Léo',
    mensagens: [
      { de: 'eu', texto: 'Léo, preciso da sua opinião sinceramente: você acha que eu devo aceitar aquela proposta?', hora: '14:01' },
      { de: 'sistema', texto: 'Visualizada às 14:02' },
    ],
    pergunta: 'O que você pensaria?',
    opcoes: [
      { id: 'a', texto: 'Ele está me ignorando' },
      { id: 'b', texto: 'Ele quer responder com calma, depois' },
      { id: 'c', texto: 'Aconteceu alguma coisa com ele' },
      { id: 'd', texto: 'Ele não liga para o que eu sinto' },
    ],
    conceito: 'Erro fundamental de atribuição',
    explicacao: [
      'Quando alguém se comporta de um jeito que nos incomoda, tendemos a atribuir a causa à personalidade ou à intenção da pessoa ("ele não liga"), subestimando fatores da situação ("ele está no trabalho", "quer pensar antes").',
      'Recursos como "visualizado" e "online" criam um novo tipo de pista — e um novo terreno para atribuições. Mostram que a pessoa viu, mas não por que não respondeu.',
      'Repare: respostas como "ele está me ignorando" e "ele não liga" são atribuições disposicionais; "quer responder com calma" e "aconteceu algo" são situacionais.',
    ],
    referencia: 'Ross, L. (1977). The intuitive psychologist and his shortcomings: Distortions in the attribution process. Advances in Experimental Social Psychology, 10, 173–220.',
  },
];

// ---------------------------------------------------------------------------
// Experiência 2 — Laboratório da comunicação
// A mesma frase em três camadas. A intenção real é revelada no fim.
// ---------------------------------------------------------------------------
export const LABORATORIO = {
  frase: 'Sério que você fez isso?',
  situacao: 'Você passou a madrugada sozinho(a) terminando os slides do trabalho em grupo. De manhã, uma colega abre o arquivo e diz:',
  intencaoReal: 'a',
  intencaoRealTexto: 'Admiração. A colega ficou impressionada e agradecida — não havia crítica alguma.',
  contextos: [
    {
      id: 'e2-texto',
      rotulo: 'Contexto 1',
      nome: 'Texto',
      descricao: 'Só as palavras, numa mensagem de WhatsApp.',
      pergunta: 'Lendo só o texto, qual é a intenção da colega?',
      opcoes: OPCOES_INTENCAO,
    },
    {
      id: 'e2-audio',
      rotulo: 'Contexto 2',
      nome: 'Áudio',
      descricao: 'A mesma frase, agora com a entonação indicada.',
      pergunta: 'Com a entonação, qual é a intenção?',
      opcoes: OPCOES_INTENCAO,
      // Notação de prosódia exibida no projetor.
      prosodia: {
        palavras: [
          { t: 'Sério', enfase: 2, altura: 0.55 },
          { t: 'que', enfase: 0, altura: 0.45 },
          { t: 'você', enfase: 1, altura: 0.5 },
          { t: 'FEZ', enfase: 3, altura: 0.9 },
          { t: 'isso?', enfase: 2, altura: 0.98 },
        ],
        notas: [
          'Tom ascendente do início ao fim',
          'Ênfase forte em "fez"',
          'Ritmo acelerado, voz mais aguda',
          'Termina com uma risada curta',
        ],
        // Se o grupo gravar um áudio, coloque o arquivo em /public/audio
        // e informe o caminho aqui, por exemplo: '/audio/laboratorio.mp3'
        audioSrc: null,
      },
    },
    {
      id: 'e2-presencial',
      rotulo: 'Contexto 3',
      nome: 'Presencial',
      descricao: 'A mesma frase, com rosto, corpo e voz.',
      pergunta: 'Vendo a pessoa, qual é a intenção?',
      opcoes: OPCOES_INTENCAO,
      pistas: [
        { tipo: 'Rosto', texto: 'Sobrancelhas erguidas, olhos arregalados, sorriso aberto' },
        { tipo: 'Corpo', texto: 'Inclina-se em sua direção, mãos abertas apontando para a tela' },
        { tipo: 'Voz', texto: 'Tom ascendente, termina rindo' },
        { tipo: 'Contexto', texto: 'Segura o notebook mostrando os slides para o resto do grupo' },
      ],
    },
  ],
};

export const TODAS_RODADAS = [
  ...CONVERSAS.map((c) => ({ id: c.id, rotulo: c.rotulo, pergunta: c.pergunta, opcoes: c.opcoes, experiencia: 1, mensagens: c.mensagens, contato: c.contato, contexto: c.contexto })),
  ...LABORATORIO.contextos.map((c) => ({ id: c.id, rotulo: `${c.rotulo} · ${c.nome}`, pergunta: c.pergunta, opcoes: c.opcoes, experiencia: 2, contexto: c.descricao })),
];

export function rodadaPorId(id) {
  return TODAS_RODADAS.find((r) => r.id === id) || null;
}
