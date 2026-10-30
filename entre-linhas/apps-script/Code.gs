/**
 * ENTRE LINHAS — Google Apps Script (intermediário entre o site e a planilha)
 *
 * Como usar (detalhes no README):
 * 1. Crie uma planilha no Google Sheets (conta pessoal, não institucional).
 * 2. Extensões → Apps Script → apague o conteúdo e cole este arquivo.
 * 3. Configurações do projeto (engrenagem) → Propriedades do script →
 *    adicione API_KEY com o mesmo valor de APPS_SCRIPT_KEY do Vercel.
 * 4. Execute uma vez a função "configurar" (autorize quando pedir).
 * 5. Implantar → Nova implantação → Tipo: App da Web
 *      Executar como: Eu  |  Quem pode acessar: Qualquer pessoa
 *    Copie a URL que termina em /exec → APPS_SCRIPT_URL no Vercel.
 *
 * Privacidade:
 * - Nenhum dado pessoal é coletado. O identificador do aparelho é aleatório
 *   e ainda assim é gravado apenas como hash (SHA-256 truncado).
 * - A rota de leitura devolve SOMENTE contagens agregadas, e só quando há
 *   respostas suficientes para não permitir identificar ninguém.
 */

var ABA_VOTOS = 'votos';
var ABA_RESPOSTAS = 'respostas';
var MIN_QUESTIONARIO = 5;   // mínimo de questionários para liberar os agregados
var MIN_RODADA = 3;         // mínimo de votos para liberar a distribuição de uma rodada
var CACHE_RESULTADOS_SEG = 3;

// ---------------------------------------------------------------------------
// Configuração inicial — execute manualmente uma vez pelo editor.
// ---------------------------------------------------------------------------
function configurar() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  garantirAba_(ss, ABA_VOTOS, ['registrado_em', 'aparelho_hash', 'rodada', 'opcao']);
  garantirAba_(ss, ABA_RESPOSTAS, ['registrado_em', 'aparelho_hash']);
  salvarEstado_({ modo: 'aguardando', rodada: null });
  if (!PropertiesService.getScriptProperties().getProperty('API_KEY')) {
    throw new Error('Defina a propriedade de script API_KEY antes de publicar.');
  }
  Logger.log('Pronto. Agora publique como App da Web.');
}

// Apaga todas as respostas e votos (use depois do ensaio, antes da aula).
function zerarDados() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  [ABA_VOTOS, ABA_RESPOSTAS].forEach(function (nome) {
    var aba = ss.getSheetByName(nome);
    if (aba && aba.getLastRow() > 1) aba.deleteRows(2, aba.getLastRow() - 1);
  });
  salvarEstado_({ modo: 'aguardando', rodada: null });
  CacheService.getScriptCache().remove('resultados');
  // As marcas anti-duplicidade expiram sozinhas em até 6 h.
  // Para liberar novos votos dos mesmos aparelhos imediatamente, troque o SAL abaixo.
  PropertiesService.getScriptProperties().setProperty('SAL', String(Date.now()));
  Logger.log('Dados zerados.');
}

// ---------------------------------------------------------------------------
// Rotas
// ---------------------------------------------------------------------------
function doGet(e) {
  try {
    if (!chaveValida_(e.parameter.chave)) return json_({ ok: false, erro: 'Chave inválida.' });
    var acao = e.parameter.acao;
    if (acao === 'estado') return json_(lerEstadoPublico_());
    if (acao === 'resultados') return json_(resultadosAgregados_());
    return json_({ ok: false, erro: 'Ação desconhecida.' });
  } catch (err) {
    return json_({ ok: false, erro: 'Erro no Apps Script: ' + err.message });
  }
}

function doPost(e) {
  try {
    var corpo = JSON.parse(e.postData.contents || '{}');
    if (!chaveValida_(corpo.chave)) return json_({ ok: false, erro: 'Chave inválida.' });
    if (corpo.acao === 'voto') return json_(registrarVoto_(corpo));
    if (corpo.acao === 'resposta') return json_(registrarResposta_(corpo));
    if (corpo.acao === 'controle') return json_(alterarEstado_(corpo));
    return json_({ ok: false, erro: 'Ação desconhecida.' });
  } catch (err) {
    return json_({ ok: false, erro: 'Erro no Apps Script: ' + err.message });
  }
}

// ---------------------------------------------------------------------------
// Estado da apresentação (o que os celulares mostram)
// ---------------------------------------------------------------------------
function lerEstado_() {
  var cache = CacheService.getScriptCache();
  var bruto = cache.get('estado') || PropertiesService.getScriptProperties().getProperty('ESTADO');
  var estado = bruto ? JSON.parse(bruto) : { modo: 'aguardando', rodada: null, atualizadoEm: null };
  return estado;
}

function lerEstadoPublico_() {
  var est = lerEstado_();
  return { ok: true, modo: est.modo, rodada: est.rodada, atualizadoEm: est.atualizadoEm };
}

function salvarEstado_(est) {
  est.atualizadoEm = new Date().toISOString();
  var bruto = JSON.stringify(est);
  PropertiesService.getScriptProperties().setProperty('ESTADO', bruto);
  CacheService.getScriptCache().put('estado', bruto, 21600);
  return est;
}

function alterarEstado_(corpo) {
  var modos = ['aguardando', 'rodada', 'questionario', 'encerrado'];
  if (modos.indexOf(corpo.modo) < 0) return { ok: false, erro: 'Modo inválido.' };
  var est = salvarEstado_({ modo: corpo.modo, rodada: corpo.modo === 'rodada' ? String(corpo.rodada) : null });
  return { ok: true, modo: est.modo, rodada: est.rodada, atualizadoEm: est.atualizadoEm };
}

// ---------------------------------------------------------------------------
// Gravação
// ---------------------------------------------------------------------------
function registrarVoto_(corpo) {
  var est = lerEstado_();
  if (est.modo !== 'rodada' || est.rodada !== corpo.rodada) {
    return { ok: false, codigo: 'rodada-fechada', erro: 'Esta votação já foi encerrada.' };
  }
  var hash = hashAparelho_(corpo.sessao);
  var cache = CacheService.getScriptCache();
  var marca = 'v_' + corpo.rodada + '_' + hash;
  if (cache.get(marca)) return { ok: false, codigo: 'duplicado', erro: 'Você já votou nesta rodada.' };

  var trava = LockService.getScriptLock();
  trava.waitLock(10000);
  try {
    if (cache.get(marca)) return { ok: false, codigo: 'duplicado', erro: 'Você já votou nesta rodada.' };
    var aba = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ABA_VOTOS);
    aba.appendRow([new Date(), hash, String(corpo.rodada), String(corpo.opcao)]);
    cache.put(marca, '1', 21600);
    cache.remove('resultados');
  } finally {
    trava.releaseLock();
  }
  return { ok: true };
}

function registrarResposta_(corpo) {
  var respostas = corpo.respostas || {};
  var hash = hashAparelho_(corpo.sessao);
  var cache = CacheService.getScriptCache();
  var marca = 'q_' + hash;
  if (cache.get(marca)) return { ok: false, codigo: 'duplicado', erro: 'Este aparelho já respondeu ao questionário.' };

  var trava = LockService.getScriptLock();
  trava.waitLock(10000);
  try {
    if (cache.get(marca)) return { ok: false, codigo: 'duplicado', erro: 'Este aparelho já respondeu ao questionário.' };
    var aba = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ABA_RESPOSTAS);
    var cab = aba.getRange(1, 1, 1, aba.getLastColumn()).getValues()[0];
    // Acrescenta colunas para perguntas novas, se houver.
    Object.keys(respostas).forEach(function (id) {
      if (cab.indexOf(id) < 0) { cab.push(id); aba.getRange(1, cab.length).setValue(id); }
    });
    var linha = cab.map(function (col) {
      if (col === 'registrado_em') return new Date();
      if (col === 'aparelho_hash') return hash;
      return respostas[col] !== undefined ? respostas[col] : '';
    });
    aba.appendRow(linha);
    cache.put(marca, '1', 21600);
    cache.remove('resultados');
  } finally {
    trava.releaseLock();
  }
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Leitura — somente agregados
// ---------------------------------------------------------------------------
function resultadosAgregados_() {
  var cache = CacheService.getScriptCache();
  var emCache = cache.get('resultados');
  if (emCache) return JSON.parse(emCache);

  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // Rodadas ao vivo
  var rodadas = {};
  var abaV = ss.getSheetByName(ABA_VOTOS);
  if (abaV.getLastRow() > 1) {
    var votos = abaV.getRange(2, 3, abaV.getLastRow() - 1, 2).getValues();
    votos.forEach(function (v) {
      var r = String(v[0]), o = String(v[1]);
      if (!rodadas[r]) rodadas[r] = { total: 0, contagem: {} };
      rodadas[r].total++;
      rodadas[r].contagem[o] = (rodadas[r].contagem[o] || 0) + 1;
    });
  }
  Object.keys(rodadas).forEach(function (r) {
    if (rodadas[r].total < MIN_RODADA) rodadas[r].contagem = null; // ainda poucos votos
  });

  // Questionário
  var abaR = ss.getSheetByName(ABA_RESPOSTAS);
  var total = Math.max(0, abaR.getLastRow() - 1);
  var perguntas = null;
  if (total >= MIN_QUESTIONARIO) {
    perguntas = {};
    var dados = abaR.getRange(1, 1, abaR.getLastRow(), abaR.getLastColumn()).getValues();
    var cab = dados[0];
    for (var c = 0; c < cab.length; c++) {
      var id = cab[c];
      if (id === 'registrado_em' || id === 'aparelho_hash' || !id) continue;
      var contagem = {};
      for (var l = 1; l < dados.length; l++) {
        var val = dados[l][c];
        if (val === '' || val === null) continue;
        contagem[String(val)] = (contagem[String(val)] || 0) + 1;
      }
      perguntas[id] = { contagem: contagem };
    }
  }

  var resultado = {
    ok: true,
    atualizadoEm: new Date().toISOString(),
    rodadas: rodadas,
    questionario: { total: total, minimo: MIN_QUESTIONARIO, perguntas: perguntas },
  };
  cache.put('resultados', JSON.stringify(resultado), CACHE_RESULTADOS_SEG);
  return resultado;
}

// ---------------------------------------------------------------------------
// Utilitários
// ---------------------------------------------------------------------------
function chaveValida_(chave) {
  var esperada = PropertiesService.getScriptProperties().getProperty('API_KEY');
  return Boolean(esperada) && chave === esperada;
}

function hashAparelho_(sessao) {
  var sal = PropertiesService.getScriptProperties().getProperty('SAL') || 'entre-linhas';
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, sal + ':' + String(sessao || ''));
  return bytes.slice(0, 8).map(function (b) { return ('0' + (b & 0xff).toString(16)).slice(-2); }).join('');
}

function garantirAba_(ss, nome, cabecalho) {
  var aba = ss.getSheetByName(nome) || ss.insertSheet(nome);
  if (aba.getLastRow() === 0) {
    aba.getRange(1, 1, 1, cabecalho.length).setValues([cabecalho]).setFontWeight('bold');
    aba.setFrozenRows(1);
  }
  return aba;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
