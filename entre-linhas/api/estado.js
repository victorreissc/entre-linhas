// GET /api/estado — o que o celular deve mostrar agora
// (aguardando, rodada aberta ou questionário). Consultado a cada ~3 s.
import { integracaoConfigurada, responderNaoConfigurado, scriptGet, erroServidor } from './_lib.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ ok: false, erro: 'Método não permitido.' });
  if (!integracaoConfigurada()) return responderNaoConfigurado(res);
  try {
    const dados = await scriptGet('estado');
    // Cache curto na CDN do Vercel: 25 celulares consultando viram ~1 chamada a cada 2 s ao Google.
    res.setHeader('Cache-Control', 'public, s-maxage=2, stale-while-revalidate=2');
    return res.status(dados.ok ? 200 : 502).json(dados);
  } catch (e) {
    return erroServidor(res, e);
  }
}
