import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Maximize, Minimize, LayoutGrid, X, AlertTriangle, PlugZap, QrCode } from 'lucide-react';
import { SLIDES, SECOES } from './slides/index.jsx';
import { useDados } from './hooks/DadosContexto.jsx';
import { ModalChave, QR } from './components/Comuns.jsx';
import { PROJETO } from '../shared/projeto.js';

function indiceDaUrl() {
  const id = window.location.hash.replace(/^#\/?/, '');
  const i = SLIDES.findIndex((s) => s.id === id);
  return i >= 0 ? i : 0;
}

function StatusConexao() {
  const { demo, erro, naoConfigurado, estado } = useDados();
  if (demo) return <span className="status status--demo">Modo demonstração</span>;
  if (naoConfigurado) return <span className="status status--erro"><PlugZap size={13} /> Sheets não configurado</span>;
  if (erro) return <span className="status status--erro" title={erro.message}><AlertTriangle size={13} /> Sem conexão</span>;
  const rotulos = { aguardando: 'Celulares em espera', rodada: 'Votação aberta', questionario: 'Questionário aberto', encerrado: 'Participação encerrada' };
  return <span className="status"><span className="pulso" /> {rotulos[estado.modo] || 'Conectado'}</span>;
}

export default function App() {
  const { demo } = useDados();
  const [indice, setIndice] = useState(indiceDaUrl);
  const [direcao, setDirecao] = useState(1);
  const [indiceAberto, setIndiceAberto] = useState(false);
  const [qrAberto, setQrAberto] = useState(false);
  const [telaCheia, setTelaCheia] = useState(false);

  const irPara = useCallback((i) => {
    const alvo = Math.max(0, Math.min(SLIDES.length - 1, i));
    setDirecao(alvo >= indice ? 1 : -1);
    setIndice(alvo);
    setIndiceAberto(false);
    window.history.replaceState(null, '', `${window.location.search}#/${SLIDES[alvo].id}`);
  }, [indice]);

  const alternarTelaCheia = useCallback(() => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {});
    else document.exitFullscreen?.();
  }, []);

  useEffect(() => {
    const aoMudarHash = () => setIndice(indiceDaUrl());
    window.addEventListener('hashchange', aoMudarHash);
    return () => window.removeEventListener('hashchange', aoMudarHash);
  }, []);

  useEffect(() => {
    const aoMudar = () => setTelaCheia(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', aoMudar);
    return () => document.removeEventListener('fullscreenchange', aoMudar);
  }, []);

  useEffect(() => {
    const tecla = (e) => {
      const alvo = e.target;
      if (alvo.closest?.('input, select, textarea, [role="dialog"]')) return;
      if (['ArrowRight', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); irPara(indice + 1); }
      else if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); irPara(indice - 1); }
      else if (e.key === 'Home') irPara(0);
      else if (e.key === 'End') irPara(SLIDES.length - 1);
      else if (e.key.toLowerCase() === 'f') alternarTelaCheia();
      else if (e.key.toLowerCase() === 'm') setIndiceAberto((v) => !v);
      else if (e.key.toLowerCase() === 'q') setQrAberto((v) => !v);
      else if (e.key === 'Escape') { setIndiceAberto(false); setQrAberto(false); }
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [indice, irPara, alternarTelaCheia]);

  const slide = SLIDES[indice];
  const secao = SECOES.find((s) => s.id === slide.secao);
  const posSecao = SECOES.findIndex((s) => s.id === slide.secao);

  return (
    <div className={`apresentacao ${demo ? 'apresentacao--demo' : ''}`}>
      {demo && <div className="faixa-demo">Dados demonstrativos — não são resultados reais da turma</div>}

      <header className="topo">
        <button className="topo__marca" onClick={() => irPara(0)}>
          <span className="serifa">Entre Linhas</span>
        </button>
        <span className="topo__secao mono">{posSecao > 0 && posSecao < SECOES.length - 1 ? `${String(posSecao).padStart(2, '0')} · ` : ''}{secao.nome}</span>
        <div className="topo__acoes">
          <StatusConexao />
          <button className="botao botao--fantasma botao--p" onClick={() => setQrAberto(true)} title="Mostrar QR Code (Q)" aria-label="Mostrar QR Code"><QrCode size={16} /></button>
          <button className="botao botao--fantasma botao--p" onClick={() => setIndiceAberto(true)} title="Índice (M)" aria-label="Abrir índice"><LayoutGrid size={16} /></button>
          <button className="botao botao--fantasma botao--p" onClick={alternarTelaCheia} title="Tela cheia (F)" aria-label="Tela cheia">
            {telaCheia ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>
        </div>
      </header>

      <main className="palco">
        <AnimatePresence mode="wait" custom={direcao}>
          <motion.div
            key={slide.id}
            className="palco__slide"
            custom={direcao}
            initial={{ opacity: 0, x: 40 * direcao }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 * direcao }}
            transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
          >
            {slide.render()}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="rodape">
        <span className="rodape__credito">{PROJETO.disciplina} · {PROJETO.professor}</span>
        <div className="progresso" aria-hidden="true">
          {SECOES.map((s) => {
            const doSecao = SLIDES.map((sl, i) => ({ ...sl, i })).filter((sl) => sl.secao === s.id);
            return (
              <div key={s.id} className="progresso__secao" style={{ flex: doSecao.length }}>
                {doSecao.map((sl) => (
                  <span key={sl.id} className={`progresso__ponto ${sl.i < indice ? 'feito' : ''} ${sl.i === indice ? 'atual' : ''}`} />
                ))}
              </div>
            );
          })}
        </div>
        <div className="rodape__nav">
          <span className="mono">{String(indice + 1).padStart(2, '0')} / {SLIDES.length}</span>
          <button className="botao botao--p" onClick={() => irPara(indice - 1)} disabled={indice === 0} aria-label="Anterior"><ChevronLeft size={16} /></button>
          <button className="botao botao--p botao--primario" onClick={() => irPara(indice + 1)} disabled={indice === SLIDES.length - 1} aria-label="Próximo"><ChevronRight size={16} /></button>
        </div>
      </footer>

      <AnimatePresence>
        {indiceAberto && (
          <motion.div className="indice" role="dialog" aria-label="Índice" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIndiceAberto(false)}>
            <motion.div className="indice__painel" initial={{ x: 40 }} animate={{ x: 0 }} exit={{ x: 40 }} onClick={(e) => e.stopPropagation()}>
              <div className="indice__topo"><span className="rotulo">Índice</span><button className="botao botao--fantasma botao--p" onClick={() => setIndiceAberto(false)} aria-label="Fechar"><X size={16} /></button></div>
              {SECOES.map((s) => (
                <div key={s.id} className="indice__secao">
                  <span className="rotulo">{s.nome}</span>
                  {SLIDES.map((sl, i) => sl.secao === s.id && (
                    <button key={sl.id} className={`indice__item ${i === indice ? 'indice__item--atual' : ''}`} onClick={() => irPara(i)}>
                      <span className="mono">{String(i + 1).padStart(2, '0')}</span> {sl.titulo}
                    </button>
                  ))}
                </div>
              ))}
              <p className="nota-pequena">Atalhos: ← → navegar · F tela cheia · Q QR Code · M índice</p>
            </motion.div>
          </motion.div>
        )}
        {qrAberto && (
          <motion.div className="modal" role="dialog" aria-label="QR Code" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setQrAberto(false)}>
            <motion.div className="modal__qr" initial={{ scale: 0.95 }} animate={{ scale: 1 }}>
              <p className="rotulo">Participe pelo celular</p>
              <QR tamanho={360} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ModalChave />
    </div>
  );
}
