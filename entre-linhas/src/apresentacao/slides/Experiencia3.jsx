import { motion } from 'framer-motion';
import { ClipboardList, Square, ShieldCheck } from 'lucide-react';
import { QR, NumeroAnimado } from '../components/Comuns.jsx';
import { useDados } from '../hooks/DadosContexto.jsx';
import { EIXOS, PERGUNTAS } from '../../shared/conteudo/questionario.js';
import { MIN_RODADA_TXT } from './textos.js';

export function SlideQuestionario() {
  const { estado, controlar, resultados, enviando, naoConfigurado, demo, erroControle } = useDados();
  const aberto = estado.modo === 'questionario';
  const total = resultados?.questionario?.total ?? 0;
  return (
    <section className="slide">
      <div className="grade-2 grade-2--centro">
        <div>
          <p className="rotulo">Experiência 3 · Pesquisa com a turma</p>
          <h2 className="serifa titulo-slide">{PERGUNTAS.length} perguntas. Cinco eixos. Uns 4 minutos.</h2>
          <ul className="eixos-lista">
            {EIXOS.map((e, i) => (
              <motion.li key={e.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.08 }}>
                <span className="eixos-lista__ponto" style={{ background: e.cor }} />{e.nome}
              </motion.li>
            ))}
          </ul>
          <div className="questionario-controle">
            <button className={`botao ${aberto ? '' : 'botao--verde'}`} disabled={enviando || (naoConfigurado && !demo)}
              onClick={() => controlar(aberto ? { modo: 'aguardando' } : { modo: 'questionario' })}>
              {aberto ? <><Square size={15} /> Fechar questionário nos celulares</> : <><ClipboardList size={15} /> Abrir questionário nos celulares</>}
            </button>
            <div className="contador-respostas">
              {aberto && <span className="pulso" />}
              <strong className="serifa"><NumeroAnimado valor={total} /></strong>
              <span>{total === 1 ? 'resposta recebida' : 'respostas recebidas'}</span>
            </div>
          </div>
          {erroControle && <p className="rodada__nota rodada__nota--erro">{erroControle}</p>}
          {naoConfigurado && !demo && <p className="rodada__nota rodada__nota--erro">Integração com o Google Sheets não configurada — o questionário não pode ser aberto.</p>}
          <p className="nota-pequena"><ShieldCheck size={14} /> {MIN_RODADA_TXT}</p>
        </div>
        <div className="qr-destaque"><QR tamanho={240} /></div>
      </div>
    </section>
  );
}
