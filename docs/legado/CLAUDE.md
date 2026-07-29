# Sistema antigo da Clínica Vila Nova

Este arquivo é o contexto persistente do sistema que roda na clínica
desde 2019, extraído do próprio repositório em 2026-07-29. O sistema
não tem spec, doc nem ADR: tudo aqui foi levantado do código e do
histórico de git, e cada afirmação carrega a evidência que a
sustenta. Item marcado com `[?]` é hipótese não confirmada; trate
como pergunta, nunca como fato.

O repositório é uma reconstrução didática do livro Context
Engineering: os arquivos, os commits e as saídas de comando são reais
e reexecutáveis, e a história por trás deles é fictícia.

## O que o sistema faz

Agenda de consultas por profissional em slots de 30 minutos, com
encaixes de 15 minutos no dia corrente, bloqueio de agenda,
lembrete por WhatsApp e um relatório de ocupação mensal.

## Como ele é feito

- Node.js antigo: `var`, `require`, callback com erro primeiro.
  Nenhuma Promise e nenhum `async/await` no repositório inteiro.
- MySQL direto, sem ORM: todo acesso passa por `db.query`
  (`db.js:10`), que é um pool compartilhado.
- Nove arquivos, 157 linhas, zero teste e zero documentação.
- Um arquivo por assunto em `src/`, sem pasta de camada.

## Regras que o código impõe hoje

- Horário é minuto desde a meia-noite, sempre inteiro: os slots
  nascem de `inicio` e `fim` da tabela `grade` e avançam de 30 em 30
  (`src/agenda.js:10`). A conversão para texto acontece só na borda,
  em `minutosParaHora` (`src/utils.js:6`).
- Data viaja como string `YYYY-MM-DD`, produzida por `hoje()`
  (`src/utils.js:1`); nunca como objeto `Date` entre módulos.
- Marcar consulta recusa em três situações, nesta ordem: agenda
  bloqueada, horário fora dos slots do dia e horário já ocupado
  (`src/consulta.js:8`, `:15` e `:19`).
- Encaixe é sempre do dia corrente: a data vem de `utils.hoje()` e
  não é parâmetro de `criar` (`src/encaixe.js:6`).
- O limite de 2 encaixes por profissional por dia está cravado no
  código, não em configuração (`src/encaixe.js:13`).
- O limite é checado antes de motivo e usuária
  (`src/encaixe.js:13` a `:15`), então um encaixe sem motivo em
  profissional lotado devolve "limite de encaixe", nunca "sem
  motivo".

## Armadilhas conhecidas

- `hoje()` usa `toISOString`, que devolve a data em UTC
  (`src/utils.js:3`). Depois das 21h no horário de Brasília, o dia
  corrente do encaixe vira o dia seguinte. Nenhum teste cobre isso.
- `src/encaixe.js` é o arquivo mais mexido do repositório, com 5 dos
  14 commits. Mudança ali tem histórico de quebrar produção
  (commit `34c2def`, "fix urgente producao").
- O commit `15b2523` se chama "relatorio convenio", mas o código
  atual de `src/relatorio.js` não tem nada de convênio. `[?]`

## Regras desta sessão

- Antes de mudar comportamento, leia `docs/legado/mapa-do-codigo.md`
  e confirme a regra no arquivo e na linha citados.
- Imite o estilo do arquivo que você está editando: callback, `var`,
  `module.exports`. Não modernize de carona.
- Toda afirmação nova sobre o sistema entra aqui com arquivo e linha,
  ou com `[?]`.
