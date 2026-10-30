// localStorage protegido: em navegação privada ou com dados bloqueados,
// os acessos podem falhar — o site continua funcionando sem ele.

export function ler(chave, padrao = null) {
  try {
    const v = window.localStorage.getItem(chave);
    return v === null ? padrao : JSON.parse(v);
  } catch {
    return padrao;
  }
}

export function gravar(chave, valor) {
  try { window.localStorage.setItem(chave, JSON.stringify(valor)); } catch { /* ignora */ }
}

export function remover(chave) {
  try { window.localStorage.removeItem(chave); } catch { /* ignora */ }
}

// Identificador aleatório do aparelho. Não identifica a pessoa:
// serve só para impedir voto duplicado do mesmo celular.
export function idSessao() {
  let id = ler('el:sessao');
  if (!id) {
    id = (window.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`);
    gravar('el:sessao', id);
  }
  return id;
}
