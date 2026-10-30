// POST /api/responder — registra o questionário completo (anônimo).
import { integracaoConfigurada, responderNaoConfigurado, scriptPost, erroServidor, lerCorpo, sessaoValida } from './_lib.js';
import { validarRespostas } from '../src/shared/conteudo/questionario.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, erro: 'Método não permitido.' });
  if (!integracaoConfigurada()) return responderNaoConfigurado(res);

  const { respostas, sessao } = lerCorpo(req);
  if (!sessaoValida(sessao)) return res.status(400).json({ ok: false, erro: 'Sessão inválida.' });
  const v = validarRespostas(respostas);
  if (!v.ok) return res.status(400).json({ ok: false, erro: v.erro });

  try {
    const dados = await scriptPost({ acao: 'resposta', respostas: v.limpo, sessao });
    res.setHeader('Cache-Control', 'no-store');
    return res.status(dados.ok ? 200 : 409).json(dados);
  } catch (e) {
    return erroServidor(res, e);
  }
}
