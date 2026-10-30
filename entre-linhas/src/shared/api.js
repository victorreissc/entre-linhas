// Cliente das funções serverless (/api/*). Usado pelos dois sites.

export class ApiErro extends Error {
  constructor(mensagem, { status, codigo } = {}) {
    super(mensagem);
    this.status = status;
    this.codigo = codigo;
  }
}

async function chamar(caminho, { metodo = 'GET', corpo, cabecalhos = {}, timeout = 15000 } = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(caminho, {
      method: metodo,
      headers: { ...(corpo ? { 'Content-Type': 'application/json' } : {}), ...cabecalhos },
      body: corpo ? JSON.stringify(corpo) : undefined,
      signal: ctrl.signal,
    });
    let dados = null;
    try { dados = await res.json(); } catch { /* resposta sem JSON */ }
    if (res.ok && dados === null) {
      throw new ApiErro('O servidor não devolveu dados. As funções /api foram publicadas? (Localmente, use "npm run dev:vercel".)', { status: res.status, codigo: 'sem-api' });
    }
    if (!res.ok || (dados && dados.ok === false)) {
      throw new ApiErro(dados?.erro || mensagemPorStatus(res.status), { status: res.status, codigo: dados?.codigo });
    }
    return dados;
  } catch (e) {
    if (e instanceof ApiErro) throw e;
    if (e.name === 'AbortError') throw new ApiErro('O servidor demorou para responder. Tente de novo.', { codigo: 'timeout' });
    throw new ApiErro('Sem conexão com o servidor. Verifique a internet.', { codigo: 'rede' });
  } finally {
    clearTimeout(timer);
  }
}

function mensagemPorStatus(status) {
  if (status === 404) return 'Serviço não encontrado. O projeto foi publicado com as funções /api?';
  if (status === 503) return 'Integração com o Google Sheets ainda não configurada.';
  if (status === 401 || status === 403) return 'Acesso negado.';
  return 'Erro inesperado no servidor.';
}

export const api = {
  estado: () => chamar('/api/estado'),
  resultados: () => chamar('/api/resultados'),
  votar: (rodada, opcao, sessao) => chamar('/api/votar', { metodo: 'POST', corpo: { rodada, opcao, sessao } }),
  responder: (respostas, sessao) => chamar('/api/responder', { metodo: 'POST', corpo: { respostas, sessao } }),
  controlar: (estado, chave) => chamar('/api/controle', { metodo: 'POST', corpo: estado, cabecalhos: { 'X-Presenter-Key': chave } }),
};
