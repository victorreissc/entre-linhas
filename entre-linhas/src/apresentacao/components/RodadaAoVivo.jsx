import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Play, Square } from 'lucide-react';
import { useDados } from '../hooks/DadosContexto.jsx';
import { Barras } from './Barras.jsx';
import { SemDados } from './EstadoDados.jsx';
import { distribuicaoRodada } from '../../shared/estatistica.js';
import { MIN_VOTOS_RODADA } from '../../shared/projeto.js';

// Controle + resultado de uma rodada de votação ao vivo.
// O apresentador abre a votação, os celulares recebem a pergunta,
// e o resultado só aparece quando ele decide revelar.
export function RodadaAoVivo({ rodada, destaque = null, aoRevelar }) {
  const { estado, resultados, controlar, enviando, erroControle, naoConfigurado, demo } = useDados();
  const [revelado, setRevelado] = useState(false);

  const aberta = estado.modo === 'rodada' && estado.rodada === rodada.id;
  const outraAberta = estado.modo === 'rodada' && estado.rodada && estado.rodada !== rodada.id;
  const dado = resultados?.rodadas?.[rodada.id];
  const total = dado?.total || 0;
  const podeRevelar = total >= MIN_VOTOS_RODADA && dado?.contagem;

  const alternarVotacao = () => controlar(aberta ? { modo: 'aguardando' } : { modo: 'rodada', rodada: rodada.id });
  const alternarRevelar = () => {
    const novo = !revelado;
    setRevelado(novo);
    if (novo && aoRevelar) aoRevelar();
  };

  return (
    <div className="rodada">
      <div className="rodada__barra">
        <div className="rodada__status">
          {aberta ? (
            <><span className="pulso" /> <span>Votação aberta</span></>
          ) : (
            <><Lock size={14} /> <span>{total ? 'Votação fechada' : 'Aguardando abertura'}</span></>
          )}
          <span className="rodada__contador mono">{total} {total === 1 ? 'voto' : 'votos'}</span>
        </div>
        <div className="rodada__acoes">
          <button className={`botao botao--p ${aberta ? '' : 'botao--verde'}`} onClick={alternarVotacao} disabled={enviando || (naoConfigurado && !demo)}>
            {aberta ? <><Square size={14} /> Encerrar</> : <><Play size={14} /> Abrir votação</>}
          </button>
          <button className="botao botao--p" onClick={alternarRevelar} disabled={!podeRevelar}>
            {revelado ? <><EyeOff size={14} /> Ocultar</> : <><Eye size={14} /> Revelar</>}
          </button>
        </div>
      </div>

      {outraAberta && <p className="rodada__nota">Outra votação está aberta. Ao abrir esta, a anterior é encerrada.</p>}
      {erroControle && <p className="rodada__nota rodada__nota--erro">{erroControle}</p>}

      <AnimatePresence mode="wait">
        {revelado && podeRevelar ? (
          <motion.div key="res" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Barras itens={distribuicaoRodada(rodada, dado)} destaque={destaque} />
          </motion.div>
        ) : (
          <motion.div key="esp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {naoConfigurado && !demo ? (
              <SemDados titulo="Votação indisponível" texto="Configure a integração com o Google Sheets para receber votos dos celulares." />
            ) : (
              <ul className="rodada__opcoes">
                {rodada.opcoes.map((o, i) => (
                  <li key={o.id}><span className="mono">{String.fromCharCode(65 + i)}</span>{o.texto}</li>
                ))}
              </ul>
            )}
            {!podeRevelar && total > 0 && (
              <p className="rodada__nota">O resultado pode ser revelado a partir de {MIN_VOTOS_RODADA} votos.</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
