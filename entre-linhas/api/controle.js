// POST /api/controle — usado só pelo apresentador para mudar o que aparece
// nos celulares. Exige o cabeçalho X-Presenter-Key = PRESENTER_KEY.
import { integracaoConfigurada, responderNaoConfigurado, scriptPost, erroServidor, lerCorpo } from './_lib.js';
import { rodadaPorId } from '../src/shared/conteudo/rodadas.js';

const MODOS = ['aguardando', 'rodada', 'questionario', 'encerrado'];

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, erro: 'Método não permitido.' });
  if (!integracaoConfigurada()) return responderNaoConfigurado(res);

  const chaveEsperada = process.env.PRESENTER_KEY;
  if (!chaveEsperada) return res.status(503).json({ ok: false, codigo: 'sem-chave', erro: 'PRESENTER_KEY não configurada no Vercel.' });
  if (req.headers['x-presenter-key'] !== chaveEsperada) return res.status(401).json({ ok: false, codigo: 'chave-invalida', erro: 'Senha do apresentador incorreta.' });

  const { modo, rodada = null } = lerCorpo(req);
  if (!MODOS.includes(modo)) return res.status(400).json({ ok: false, erro: 'Modo inválido.' });
  if (modo === 'rodada' && !rodadaPorId(rodada)) return res.status(400).json({ ok: false, erro: 'Rodada inválida.' });

  try {
    const dados = await scriptPost({ acao: 'controle', modo, rodada: modo === 'rodada' ? rodada : null });
    res.setHeader('Cache-Control', 'no-store');
    return res.status(dados.ok ? 200 : 502).json(dados);
  } catch (e) {
    return erroServidor(res, e);
  }
}
