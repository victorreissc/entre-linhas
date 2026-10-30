# Entre Linhas — A Psicologia das Conversas Digitais

Experiência interativa para a disciplina **Psicologia aplicada à Comunicação** (Prof. Canuto Junior).
Grupo: Anny, Dirce, Douglas, Luiza, Sophia e Victor.

O projeto tem **dois sites no mesmo deploy**:

| Endereço | Para quem | O que faz |
|---|---|---|
| `/` | Projetor | Apresentação com as 6 experiências, votação ao vivo e dashboard |
| `/participar` | Celular da turma | Recebe as votações e o questionário (acesso por QR Code) |

```
Celulares ──POST /api/votar, /api/responder──┐
Projetor ──GET /api/resultados, POST /api/controle──┤
                                              ▼
                          Funções do Vercel (/api)  ← guardam URL e chave
                                              ▼
                          Google Apps Script (Web App)
                                              ▼
                          Google Sheets (abas "votos" e "respostas")
```

---

## 1. Configurar o Google Sheets + Apps Script (≈ 10 min)

> Use uma **conta Google pessoal**. Contas institucionais costumam bloquear a opção "Qualquer pessoa".

1. Crie uma planilha nova no Google Sheets (ex.: *Entre Linhas — Respostas*).
2. Menu **Extensões → Apps Script**. Apague o conteúdo e cole o arquivo [`apps-script/Code.gs`](apps-script/Code.gs). Salve.
3. Clique na **engrenagem (Configurações do projeto)** → **Propriedades do script** → **Adicionar**:
   - Propriedade: `API_KEY`
   - Valor: um texto longo e aleatório (ex.: `el-2026-xk93-qq71-pz04`). Guarde — ele vai para o Vercel.
4. No editor, selecione a função **`configurar`** e clique em **Executar**. Autorize o acesso quando pedir
   (aparece um aviso de "app não verificado": clique em *Avançado → Acessar*). Isso cria as abas `votos` e `respostas`.
5. **Implantar → Nova implantação** → tipo **App da Web**:
   - Executar como: **Eu**
   - Quem pode acessar: **Qualquer pessoa**
6. Copie a **URL do app da Web** (termina em `/exec`).

> Se alterar o `Code.gs` depois, use **Implantar → Gerenciar implantações → Editar → Nova versão**, para manter a mesma URL.

## 2. Publicar no Vercel (≈ 5 min)

1. Suba esta pasta para um repositório no GitHub.
2. No [Vercel](https://vercel.com), **Add New → Project** → importe o repositório. O framework (Vite) é detectado sozinho.
3. Em **Environment Variables**, adicione (modelo em `.env.example`):

   | Nome | Valor |
   |---|---|
   | `APPS_SCRIPT_URL` | URL do passo 1.6 |
   | `APPS_SCRIPT_KEY` | o mesmo valor de `API_KEY` do passo 1.3 |
   | `PRESENTER_KEY` | uma senha do grupo para controlar as votações |

4. **Deploy**. Se adicionar ou mudar variáveis depois, faça um **Redeploy**.

## 3. Ensaiar

- **Sem integração:** abra `https://SEU-SITE.vercel.app/?demo=1`. Uma faixa amarela avisa que os dados são demonstrativos.
- **Celular sem enviar nada:** `/participar/?demo=1&modo=rodada&rodada=e1-ok` ou `/participar/?demo=1&modo=questionario`.
- **Ensaio real:** abra o site normal, vote com 2–3 celulares e confira as linhas na planilha.
- **Antes da aula:** no Apps Script, execute a função **`zerarDados`** para apagar os votos do ensaio.
  Também é recomendável abrir `/participar` em aba anônima nos celulares usados no ensaio.

## 4. Durante a apresentação

| Tecla | Ação |
|---|---|
| → / Espaço | Próximo slide |
| ← | Slide anterior |
| F | Tela cheia |
| Q | QR Code em tela cheia (para quem chegou atrasado) |
| M | Índice de slides |

**Roteiro das votações:**

1. No slide de cada conversa, clique **Abrir votação**. A pergunta aparece nos celulares em até ~5 s.
2. Quando a contagem estabilizar, clique **Encerrar** e depois **Revelar**.
3. Clique em **O que a Psicologia diz** para mostrar a explicação.
4. No slide do questionário, clique **Abrir questionário nos celulares**. Os gráficos do dashboard aparecem a partir de 5 respostas.
5. No encerramento, clique **Encerrar participação nos celulares**.

Na primeira vez que abrir uma votação, o site pede a senha do apresentador (`PRESENTER_KEY`); ela fica salva naquele navegador.

## 5. Privacidade e ética

- Nenhum dado pessoal é coletado. O aparelho recebe um código aleatório, gravado na planilha apenas como hash, só para evitar voto duplicado.
- A rota de leitura devolve **apenas contagens agregadas**; o questionário só aparece com ≥ 5 respostas, e cada rodada só pode ser revelada com ≥ 3 votos.
- O celular mostra uma tela de consentimento antes de participar.
- As conversas e os itens do questionário foram criados pelo grupo para fins didáticos (não são instrumentos validados).
- Confirme com o professor se a atividade é apenas pedagógica. Caso os dados sejam usados em publicação, avalie a necessidade de submissão a comitê de ética (Resolução CNS 510/2016).

## 6. Limitações conhecidas

- **Atualização a cada 4–5 s**, não instantânea. O Apps Script não oferece tempo real.
- **Latência do Google** de 1–3 s por chamada, às vezes mais na primeira.
- **Wi-Fi da sala:** teste antes. Os alunos podem usar dados móveis.
- **Voto duplicado:** o controle é por aparelho. Quem limpar o navegador consegue votar de novo; bloquear isso exigiria login, o que quebraria o anonimato.
- **Áudio da Experiência 2:** o slide mostra a entonação de forma visual. Para usar um áudio gravado pelo grupo, coloque o arquivo em `public/audio/` e informe o caminho em `audioSrc`, no arquivo `src/shared/conteudo/rodadas.js`.

## 7. Desenvolvimento local

```bash
npm install
npm run dev          # só a interface (as rotas /api não existem; use ?demo=1)
npm run dev:vercel   # interface + rotas /api (requer: npm i -g vercel, vercel login, vercel link)
npm run build
```

### Estrutura

```
api/                     Funções serverless (Vercel) — falam com o Apps Script
apps-script/Code.gs      Código para colar no Google Apps Script
index.html               Entrada da apresentação
participar/index.html    Entrada do site do celular
src/shared/              Código comum aos dois sites
  conteudo/rodadas.js      Conversas (Exp. 1) e laboratório (Exp. 2)
  conteudo/questionario.js Perguntas dos 5 eixos (fonte única)
  api.js, usePolling.js    Cliente HTTP e consulta periódica
  estatistica.js           Cálculos sobre agregados
  demo.js                  Dados demonstrativos (só com ?demo=1)
src/apresentacao/        Site do projetor (slides, componentes, gráficos)
src/participar/          Site do celular (votação e questionário)
```

Para editar textos, nomes ou perguntas, altere os arquivos em `src/shared/`. Os dois sites e a validação do servidor se atualizam juntos.
