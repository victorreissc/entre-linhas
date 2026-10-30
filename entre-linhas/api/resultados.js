// GET /api/resultados — somente AGREGADOS (contagens por opção).
// O Apps Script nunca devolve linhas individuais.
import { integracaoConfigurada, responderNaoConfigurado, scriptGet, erroServidor } from './_lib.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ ok: false, erro: 'Método não permitido.' });
  if (!integracaoConfigurada()) return responderNaoConfigurado(res);
  try {
    const dados = await scriptGet('resultados');
    res.setHeader('Cache-Control', 'public, s-maxage=3, stale-while-revalidate=3');
    return res.status(dados.ok ? 200 : 502).json(dados);
  } catch (e) {
    return erroServidor(res, e);
  }
}
