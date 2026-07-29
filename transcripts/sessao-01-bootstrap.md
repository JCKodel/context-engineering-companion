# Sessão 01: bootstrap com pacote de contexto

Ferramenta: Claude Code 2.1.220 (Anthropic), modelo Sonnet 5
Data: 2026-07-29
Sessão: 01, bootstrap do AgendaVila
Técnica-alvo: camadas de contexto (cap. 16) e packing (cap. 17)
Reconstrução: não

Mesma ferramenta e mesmo modelo da sessão 00. A diferença é o
diretório: aqui existem `CLAUDE.md`, `docs/spec-agendamento.md` e
`docs/convencoes.md`, e o pedido chega empacotado em três zonas.

```console
$ cd code
$ claude --print --model sonnet --permission-mode acceptEdits \
    "$(cat pacote-01.md)"
```

## O pacote

O arquivo `pacote-01.md` não é artefato do projeto: é o prompt da
sessão, montado pelas quatro perguntas do capítulo 17 e organizado
pelas camadas do capítulo 16.

```markdown
## Abre o pacote: o que não pode ser violado (camada 1)

- Nenhuma dependência nova. A stack está fechada em CLAUDE.md:
  TypeScript, Hono, `node:sqlite`, Vitest. Se achar que precisa de
  outra coisa, pergunte em vez de instalar.
- Organização por feature. Nenhum arquivo em `src/` fora de uma pasta
  de feature, exceto o ponto de entrada do servidor.
- Interface com implementação única é proibida.

## Meio do pacote: o material da tarefa (camada 2)

- O que construir: o esqueleto do AgendaVila, antes de qualquer regra
  de negócio. Um servidor Hono que sobe e responde `GET /saude` com
  `{"status":"ok"}`, e o acesso ao SQLite disponível para os
  repositórios das features que virão.
- O que NÃO construir agora: nada de consulta, profissional, grade ou
  encaixe. As três features entram em sessões seguintes, uma por vez.
- Onde o diff acontece: `src/` (arquivos novos), `package.json` se
  precisar de script, e `src/placeholder.test.ts`, que deve ser
  removido porque existia só para provar que a suíte roda.
- Convenções que a tarefa toca: `docs/convencoes.md`, seções
  "Organização" e "Papéis no nome do arquivo".
- Teto do pacote: se precisar de qualquer arquivo que não está aqui,
  peça antes de supor.

## Fecha o pacote: o pedido (camada 4)

Monte o esqueleto descrito acima. Comece decidindo onde o acesso ao
banco vai morar, considerando que ainda não existe nenhuma feature, e
justifique a escolha em uma frase antes de escrever o arquivo. Ao
final, rode `npm test` e mostre a saída.
```

## Turno 1: a sessão para antes de escrever

A sessão lê `docs/convencoes.md`, `docs/spec-agendamento.md`,
`package.json`, `tsconfig.json` e o placeholder, e não escreve
nenhum arquivo. Ela devolve isto:

```text
Antes de escrever qualquer arquivo, encontrei um ponto que trava o
esqueleto: package.json já declara "dev": "node src/servidor.ts",
mas o pacote Hono sozinho não roda em Node: ele expõe só app.fetch
(Web Fetch API), sem servidor HTTP embutido. O jeito padrão de
servir isso em Node é o pacote @hono/node-server (mesmos
mantenedores do Hono), que hoje não está em package.json nem
instalado.

CLAUDE.md é explícito: "Nenhuma dependência além dessas... Antes de
instalar qualquer pacote, pergunte." Então pergunto antes de decidir
sozinho:

1. Adicionar @hono/node-server: uma dependência pequena, oficial do
   time do Hono, é o caminho padrão documentado para isso.
2. Escrever eu mesmo um adaptador manual node:http para
   Request/Response (Node 24 tem essas classes globais via undici),
   sem dependência nova, mas é código de infraestrutura que eu teria
   que acertar (parsing de corpo, streaming) e manter.

Qual dos dois você prefere?
```

Custo do turno: 9 iterações, 72,5 segundos, 5.563 tokens de saída,
US$ 0,26. Linhas de código produzidas: zero, e desta vez isso é o
resultado certo. A mesma ferramenta que na sessão 00 instalou dez
pacotes sem perguntar aqui trava numa dependência porque uma linha de
camada 1 mandava travar.

## Turno 2: a decisão volta e a camada 1 cresce

**Prompt**: Opção 1: autorizo @hono/node-server, que é do mesmo time
do Hono e é o jeito padrão de servir em Node. Registre essa decisão no
CLAUDE.md junto da stack, para a próxima sessão não precisar perguntar
de novo. Siga com o esqueleto. O placeholder sai e um teste de verdade
entra no lugar: o GET /saude respondendo. Rode npm test e commite.

A primeira coisa que ela faz depois de instalar é reescrever a linha
da stack no `CLAUDE.md`:

Antes:

```markdown
- Servidor HTTP com Hono; banco com `node:sqlite`, o módulo nativo do
  Node, sem ORM e sem driver externo.
```

Depois:

```markdown
- Servidor HTTP com Hono, servido por `@hono/node-server` (adaptador
  oficial do time do Hono para rodar sobre Node.js). Decisão tomada
  em 2026-07-29; não pergunte de novo.
- Banco com `node:sqlite`, o módulo nativo do Node, sem ORM e sem
  driver externo.
```

O código que ela escreve cabe em duas telas:

```typescript
// src/servidor.ts
import { fileURLToPath } from "node:url";
import { serve } from "@hono/node-server";
import { Hono } from "hono";

export const app = new Hono();

app.get("/saude", (c) => c.json({ status: "ok" }));

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  serve({ fetch: app.fetch, port: 3000 });
}
```

```typescript
// src/servidor.test.ts
import { expect, test } from "vitest";
import { app } from "./servidor.ts";

test("GET /saude responde com status ok", async () => {
  const resposta = await app.request("/saude");

  expect(resposta.status).toBe(200);
  expect(await resposta.json()).toEqual({ status: "ok" });
});
```

O placeholder sai e a suíte roda:

```console
$ npm test

 RUN  v3.2.7 /code

 ✓ src/servidor.test.ts (1 test) 3ms

 Test Files  1 passed (1)
      Tests  1 passed (1)
   Duration  166ms
```

O commit não sai: `git commit` está fora do que `acceptEdits`
autoriza sozinho, e no modo não interativo não há prompt de permissão
para responder. A sessão para e pede autorização.

```text
Preciso da sua aprovação no prompt de permissão para rodar o
git commit. Pode autorizar?
```

O commit foi feito à mão, com a mensagem que ela propôs:

```console
$ git log --oneline -1
34d3c7a Sobe servidor Hono com GET /saude no lugar do placeholder
```

Custo do turno: 20 iterações, 68,4 segundos, 5.018 tokens de saída,
US$ 0,39.

## Turno 3: a metade que ficou faltando

O pedido do turno 1 tinha duas partes: o servidor e o acesso ao
SQLite. Voltou uma. A sessão não implementou o banco e também não
disse que não ia implementar.

**Prompt**: Commitei o servidor, obrigado. Mas ficou faltando a
segunda metade do pedido: o acesso ao SQLite para os repositórios das
features que virão. Antes de escrever qualquer arquivo, responda em
uma frase onde esse acesso deve morar, ou se ele deve existir agora,
considerando as duas regras de docs/convencoes.md que colidem aqui:
nenhum arquivo em src/ fora de uma pasta de feature, exceto o ponto de
entrada, e compartilhado/ só nasce quando o mesmo código se provar
necessário em duas features. Depois faça o que a sua resposta indicar
e rode npm test.

```text
Esse acesso não deve existir agora: sem uma segunda feature que
precise dele, criar compartilhado/ seria abstrair antes da segunda
implementação real, então a conexão com node:sqlite nasce dentro do
primeiro *.repositorio.ts que a feature agenda ou profissionais
exigir, e só migra para compartilhado/ no dia em que outra feature
provar precisar do mesmo código.

Como nenhuma feature com repositório está sendo pedida nesta tarefa,
não vou escrever esse arquivo agora: isso evitaria a abstração
prematura que a própria convenção proíbe.
```

Nenhum arquivo novo, suíte verde. A resposta está certa, e o erro do
turno 2 foi não ter dito isso na hora. Ficou registrado em
`falhas.md`.

Custo do turno: 3 iterações, 12,9 segundos, 772 tokens de saída,
US$ 0,21.

## Custo total da sessão

| Turno | Iterações | Tempo | Tokens de saída | Custo |
|---|---|---|---|---|
| 1 | 9 | 72,5 s | 5.563 | US$ 0,26 |
| 2 | 20 | 68,4 s | 5.018 | US$ 0,39 |
| 3 | 3 | 12,9 s | 772 | US$ 0,21 |
| Total | 32 | 153,8 s | 11.353 | US$ 0,86 |

Cache lido nos três turnos: 961 mil tokens.

## O que o pacote comprou

A sessão 00 custou US$ 1,40 e 345 segundos para entregar um projeto
que precisava ser jogado fora. Esta custou US$ 0,86 e 154 segundos
para entregar dois arquivos, um teste verde e uma decisão de stack
registrada onde a próxima sessão vai ler.

O que mudou não foi o modelo. Foi que três frases de camada 1
estavam na janela antes do pedido:

- "Antes de instalar qualquer pacote, pergunte" produziu a pergunta
  do turno 1, em vez das dez dependências da sessão 00.
- "Nenhum arquivo em `src/` fora de uma pasta de feature" impediu o
  `src/routes/` e o `src/services/` que apareceram lá.
- "`compartilhado/` só nasce com dois usos provados" produziu a
  recusa do turno 3, que é a decisão de arquitetura mais barata desta
  sessão inteira.
