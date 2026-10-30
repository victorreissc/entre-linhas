import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, AlertCircle } from 'lucide-react';
import { Abas } from '../components/Comuns.jsx';
import { ComResultados } from '../components/EstadoDados.jsx';
import { EIXOS, perguntaPorId } from '../../shared/conteudo/questionario.js';
import { resumoLikert, distribuicaoEscolha, indiceEixo } from '../../shared/estatistica.js';
import { MIN_RESPOSTAS_QUESTIONARIO } from '../../shared/projeto.js';
import { COR_EIXO } from '../cores.js';

// Referencial teórico por eixo. Os números exibidos vêm só da planilha.
const ANALISE = {
  nv: {
    destaques: [{ id: 'nv1' }, { id: 'nv3', opcao: 'presencial', frase: 'preferem conversar pessoalmente quando o assunto é importante' }],
    teorias: [
      { nome: 'Teoria da Riqueza da Mídia', autores: 'Daft & Lengel, 1986', ideia: 'Canais diferem na capacidade de transmitir pistas: feedback imediato, tom de voz, expressões e linguagem natural. Quanto mais ambígua a mensagem, mais ela pede um canal rico — e o texto é um dos mais pobres.' },
      { nome: 'Teoria da Presença Social', autores: 'Short, Williams & Christie, 1976', ideia: 'Meios variam no quanto fazem o outro parecer "presente". Menos presença tende a tornar a interação mais impessoal e a dificultar a leitura de emoções.' },
    ],
    leitura: 'Emojis, figurinhas e pontuação funcionam como substitutos das expressões e da entonação que o texto não carrega. Compare a concordância com "sinto falta de rosto e voz" com o canal preferido para conversas importantes.',
    alerta: 'A famosa regra "7% palavras, 38% voz, 55% corpo" (Mehrabian) vem de estudos com situações muito específicas — palavras isoladas expressando sentimentos — e não deve ser generalizada para toda comunicação.',
  },
  ps: {
    destaques: [{ id: 'ps1' }, { id: 'ps2' }],
    teorias: [
      { nome: 'Egocentrismo na comunicação mediada', autores: 'Kruger, Epley, Parker & Ng, 2005', ideia: 'Quem escreve "ouve" o próprio tom e superestima o quanto o leitor vai captá-lo. Nos experimentos, o acerto sobre sarcasmo por e-mail ficou perto de 56%, contra a expectativa de 78% dos remetentes.' },
      { nome: 'Erro fundamental de atribuição', autores: 'Ross, 1977', ideia: 'Tendemos a explicar o comportamento dos outros por traços pessoais ("ele é grosso") e a subestimar a situação ("ele estava com pressa"). Mensagens curtas e sem contexto favorecem esse atalho.' },
      { nome: 'Pontuação como pista emocional', autores: 'Gunraj et al., 2016', ideia: 'Em mensagens de texto, respostas terminadas em ponto final foram avaliadas como menos sinceras; o mesmo não ocorreu em bilhetes escritos à mão.' },
    ],
    leitura: 'Se muitos já interpretaram mal uma mensagem, a turma vive na prática o que Kruger e colegas mediram em laboratório: a intenção de quem escreve nem sempre chega a quem lê.',
  },
  em: {
    destaques: [{ id: 'em2' }, { id: 'em1' }],
    teorias: [
      { nome: 'Empatia multidimensional', autores: 'Davis, 1983', ideia: 'Empatia envolve componentes distintos, como a tomada de perspectiva (entender o ponto de vista do outro) e a preocupação empática (sentir compaixão). Por mensagem, a tomada de perspectiva exige esforço extra, porque faltam sinais emocionais.' },
      { nome: 'Mudanças na empatia ao longo do tempo', autores: 'Konrath, O’Brien & Hsing, 2011', ideia: 'Meta-análise com universitários norte-americanos encontrou queda em medidas de empatia entre 1979 e 2009. O estudo é correlacional: o papel das mídias digitais é uma hipótese discutida, não uma causa comprovada.' },
    ],
    leitura: 'Compare "penso no outro antes de responder" com "percebo quando alguém está mal por mensagem": a intenção empática pode ser alta mesmo quando a percepção pelo texto é limitada.',
  },
  vi: {
    destaques: [{ id: 'vi1' }, { id: 'vi2' }],
    teorias: [
      { nome: 'Processamento da Informação Social', autores: 'Walther, 1992', ideia: 'Relações mediadas por computador podem alcançar a mesma intimidade das presenciais, mas tendem a precisar de mais tempo, porque as pistas sociais chegam em menor quantidade.' },
      { nome: 'Modelo hiperpessoal', autores: 'Walther, 1996', ideia: 'No ambiente digital, escolhemos com cuidado o que mostrar, e o outro tende a idealizar o que recebe. Isso pode tornar algumas relações online até mais intensas do que as presenciais.' },
      { nome: 'Redes sociais e capital social', autores: 'Ellison, Steinfield & Lampe, 2007', ideia: 'O uso de redes sociais por universitários apareceu associado à manutenção de laços, inclusive com pessoas de fases anteriores da vida.' },
    ],
    leitura: 'Redes sociais não substituem nem destroem vínculos por si só: elas mudam o ritmo e a forma como os vínculos são construídos e mantidos.',
  },
  cf: {
    destaques: [{ id: 'cf2' }, { id: 'cf3', opcao: 'mudar-canal', frase: 'propõem mudar para ligação ou encontro durante um conflito' }],
    teorias: [
      { nome: 'Efeito de desinibição online', autores: 'Suler, 2004', ideia: 'Fatores como invisibilidade, assincronia (responder depois, sem ver a reação imediata) e sensação de distância reduzem freios sociais. Isso pode gerar mais abertura — ou mais hostilidade.' },
      { nome: 'Emoção mal transmitida por e-mail', autores: 'Byron, 2008', ideia: 'Mensagens escritas tendem a ser percebidas como mais negativas do que o remetente pretendia, o que alimenta escaladas de conflito.' },
      { nome: 'Comunicação Não Violenta', autores: 'Rosenberg, 2003', ideia: 'Propõe expressar observações, sentimentos, necessidades e pedidos, no lugar de julgamentos — base de várias estratégias da próxima experiência.' },
    ],
    leitura: 'Quando a concordância com "já disse por mensagem o que não diria cara a cara" é alta, a turma descreve em primeira pessoa a desinibição que Suler identificou.',
  },
};

function Destaque({ d, perguntas }) {
  const p = perguntaPorId(d.id);
  if (p.tipo === 'likert') {
    const r = resumoLikert(perguntas[d.id]);
    return (
      <div className="destaque">
        <strong className="serifa">{r.pConcorda}%</strong>
        <p>concordam: “{p.texto}”</p>
      </div>
    );
  }
  const op = distribuicaoEscolha(p, perguntas[d.id]).find((o) => o.id === d.opcao);
  return (
    <div className="destaque">
      <strong className="serifa">{op?.pct ?? 0}%</strong>
      <p>{d.frase}</p>
    </div>
  );
}

export function SlideAnalise() {
  const [eixo, setEixo] = useState(EIXOS[0].id);
  const a = ANALISE[eixo];
  const meta = EIXOS.find((e) => e.id === eixo);
  return (
    <section className="slide">
      <p className="rotulo">Experiência 5 · Análise psicológica</p>
      <Abas abas={EIXOS} ativa={eixo} aoMudar={setEixo} />
      <AnimatePresence mode="wait">
        <motion.div key={eixo} className="analise" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.35 }}>
          <div className="analise__dados" style={{ '--cor-eixo': COR_EIXO[eixo] }}>
            <span className="rotulo">O que a turma disse</span>
            <h3 className="serifa">{meta.nome}</h3>
            <ComResultados>
              {(res) => {
                const q = res.questionario;
                if (!q?.perguntas || q.total < MIN_RESPOSTAS_QUESTIONARIO) {
                  return <p className="nota-pequena">Aguardando ao menos {MIN_RESPOSTAS_QUESTIONARIO} respostas ({q?.total || 0} até agora).</p>;
                }
                const ind = indiceEixo(eixo, q.perguntas);
                return (
                  <>
                    {a.destaques.map((d) => <Destaque key={d.id} d={d} perguntas={q.perguntas} />)}
                    <p className="nota-pequena">Índice de concordância do eixo: <strong>{ind.indice}%</strong> · n = {q.total}</p>
                  </>
                );
              }}
            </ComResultados>
            <p className="analise__leitura">{a.leitura}</p>
          </div>
          <div className="analise__teorias">
            <span className="rotulo">O que a teoria diz</span>
            {a.teorias.map((t, i) => (
              <motion.article key={t.nome} className="teoria" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.1 }}>
                <header><h4>{t.nome}</h4><span className="mono"><BookOpen size={12} /> {t.autores}</span></header>
                <p>{t.ideia}</p>
              </motion.article>
            ))}
            {a.alerta && <p className="aviso aviso--alerta"><AlertCircle size={16} /> {a.alerta}</p>}
          </div>
        </motion.div>
      </AnimatePresence>
      <p className="ressalva">
        Limites: amostra pequena e por conveniência; questionário didático, não validado. Os resultados descrevem esta turma, hoje — ilustram as teorias, mas não as comprovam.
      </p>
    </section>
  );
}

export const REFERENCIAS = [
  'Byron, K. (2008). Carrying too heavy a load? The communication and miscommunication of emotion by email. Academy of Management Review, 33(2), 309–327.',
  'Daft, R. L., & Lengel, R. H. (1986). Organizational information requirements, media richness and structural design. Management Science, 32(5), 554–571.',
  'Davis, M. H. (1983). Measuring individual differences in empathy: Evidence for a multidimensional approach. Journal of Personality and Social Psychology, 44(1), 113–126.',
  'Ellison, N. B., Steinfield, C., & Lampe, C. (2007). The benefits of Facebook “friends”: Social capital and college students’ use of online social network sites. Journal of Computer-Mediated Communication, 12(4), 1143–1168.',
  'Gunraj, D. N., Drumm-Hewitt, A. M., Dashow, E. M., Upadhyay, S. S. N., & Klin, C. M. (2016). Texting insincerely: The role of the period in text messaging. Computers in Human Behavior, 55, 1067–1075.',
  'Konrath, S. H., O’Brien, E. H., & Hsing, C. (2011). Changes in dispositional empathy in American college students over time: A meta-analysis. Personality and Social Psychology Review, 15(2), 180–198.',
  'Kruger, J., Epley, N., Parker, J., & Ng, Z.-W. (2005). Egocentrism over e-mail: Can we communicate as well as we think? Journal of Personality and Social Psychology, 89(6), 925–936.',
  'Rogers, C. R., & Farson, R. E. (1957). Active listening. Industrial Relations Center, University of Chicago.',
  'Rosenberg, M. B. (2003). Nonviolent communication: A language of life (2ª ed.). PuddleDancer Press. [Ed. brasileira: Comunicação Não Violenta, Ágora.]',
  'Ross, L. (1977). The intuitive psychologist and his shortcomings: Distortions in the attribution process. Advances in Experimental Social Psychology, 10, 173–220.',
  'Short, J., Williams, E., & Christie, B. (1976). The social psychology of telecommunications. Wiley.',
  'Suler, J. (2004). The online disinhibition effect. CyberPsychology & Behavior, 7(3), 321–326.',
  'Walther, J. B. (1992). Interpersonal effects in computer-mediated interaction: A relational perspective. Communication Research, 19(1), 52–90.',
  'Walther, J. B. (1996). Computer-mediated communication: Impersonal, interpersonal, and hyperpersonal interaction. Communication Research, 23(1), 3–43.',
];

export function SlideReferencias() {
  return (
    <section className="slide">
      <p className="rotulo">Referências</p>
      <h2 className="serifa titulo-slide titulo-slide--m">Onde nos apoiamos</h2>
      <ol className="referencias">
        {REFERENCIAS.map((r) => <li key={r}>{r}</li>)}
      </ol>
      <p className="nota-pequena">As conversas e os itens do questionário foram criados pelo grupo para fins didáticos. Os resultados exibidos vêm exclusivamente das respostas da turma.</p>
    </section>
  );
}
