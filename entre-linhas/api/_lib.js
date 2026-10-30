// Funções auxiliares das rotas /api. Arquivos que começam com "_" não viram rotas no Vercel.
// Toda comunicação com o Google acontece aqui, no servidor: a URL do Apps Script
// e a chave nunca chegam ao navegador.

const URL_SCRIPT = process.env.APPS_SCRIPT_URL;
const CHAVE_SCRIPT = process.env.APPS_SCRIPT_KEY;

export function integracaoConfigurada() {
  return Boolean(URL_SCRIPT && CHAVE_SCRIPT);
}

export function responderNaoConfigurado(res) {
  return res.status(503).json({
    ok: false,
    codigo: 'nao-configurado',
    erro: 'Integração com o Google Sheets ainda não configurada. Defina APPS_SCRIPT_URL e APPS_SCRIPT_KEY no Vercel.',
  });
}

async function comTempo(promessa, ms = 12000) {
  let timer;
  const limite = new Promise((_, rej) => { timer = setTimeout(() => rej(new Error('timeout')), ms); });
  try { return await Promise.race([promessa, limite]); } finally { clearTimeout(timer); }
}

async function lerResposta(r) {
  const texto = await r.text();
  try {
    return JSON.parse(texto);
  } catch {
    // O Apps Script devolve HTML quando o deploy não está público ou a URL está errada.
    throw new Error('O Apps Script não devolveu JSON. Confira se o Web App está publicado com acesso "Qualquer pessoa" e se a URL termina em /exec.');
  }
}

export async function scriptGet(acao) {
  const url = `${URL_SCRIPT}?acao=${encodeURIComponent(acao)}&chave=${encodeURIComponent(CHAVE_SCRIPT)}`;
  const r = await comTempo(fetch(url, { redirect: 'follow' }));
  return lerResposta(r);
}

export async function scriptPost(corpo) {
  const r = await comTempo(fetch(URL_SCRIPT, {
    method: 'POST',
    redirect: 'follow',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ ...corpo, chave: CHAVE_SCRIPT }),
  }));
  return lerResposta(r);
}

export function erroServidor(res, e) {
  const timeout = e?.message === 'timeout';
  return res.status(timeout ? 504 : 502).json({
    ok: false,
    codigo: timeout ? 'timeout' : 'falha-script',
    erro: timeout ? 'O Google demorou para responder. Tente de novo em instantes.' : (e?.message || 'Falha ao falar com o Google Apps Script.'),
  });
}

export function lerCorpo(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  try { return JSON.parse(req.body || '{}'); } catch { return {}; }
}

export function sessaoValida(s) {
  return typeof s === 'string' && /^[A-Za-z0-9-]{8,64}$/.test(s);
}
