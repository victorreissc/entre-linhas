// POST /api/votar — registra um voto em uma rodada ao vivo.
import { integracaoConfigurada, responderNaoConfigurado, scriptPost, erroServidor, lerCorpo, sessaoValida } from './_lib.js';
import { rodadaPorId } from '../src/shared/conteudo/rodadas.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, erro: 'Método não permitido.' });
  if (!integracaoConfigurada()) return responderNaoConfigurado(res);

  const { rodada, opcao, sessao } = lerCorpo(req);
  const r = rodadaPorId(rodada);
  if (!r || !r.opcoes.some((o) => o.id === opcao)) return res.status(400).json({ ok: false, erro: 'Voto inválido.' });
  if (!sessaoValida(sessao)) return res.status(400).json({ ok: false, erro: 'Sessão inválida.' });

  try {
    const dados = await scriptPost({ acao: 'voto', rodada, opcao, sessao });
    res.setHeader('Cache-Control', 'no-store');
    return res.status(dados.ok ? 200 : 409).json(dados);
  } catch (e) {
    return erroServidor(res, e);
  }
}
