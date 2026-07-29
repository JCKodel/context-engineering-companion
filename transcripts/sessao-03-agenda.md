# Sessão 03: fatia de agenda e compressão de contexto

Ferramenta: Claude Code 2.1.220 (Anthropic), modelo Sonnet 5
Data: 2026-07-29
Sessão: 03, marcar e cancelar consulta
Técnica-alvo: compressão ao estourar a sessão (cap. 20)
Reconstrução: não

Esta é a sessão mais longa das três, e é a primeira em que a janela
enche. O pacote está em `transcripts/pacote-03.md`. Ele fecha com uma
pergunta antes do pedido, e a pergunta é de propósito:

```markdown
Uma coisa antes: o dia da semana da consulta sai da data. Me diga
como você pretende obter esse dia a partir da string `YYYY-MM-DD`
antes de escrever a função, porque essa conta tem um jeito errado que
o sistema antigo usa até hoje.
```

## Turno 1: a armadilha certa e o remédio caro demais

A sessão acha a armadilha sozinha, no lugar certo, e explica o
mecanismo inteiro:

```text
Antes de escrever qualquer código: o formato herdado
(docs/legado/CLAUDE.md, seção "Armadilhas conhecidas") documenta o
jeito errado que já existe no sistema antigo: hoje() usa
toISOString(), que devolve data em UTC, e depois das 21h no horário
de Brasília o dia vira o seguinte. É o mesmo risco que
new Date("YYYY-MM-DD").getDay() teria aqui: o construtor de Date
interpreta string YYYY-MM-DD como meia-noite UTC, mas .getDay() lê no
fuso local do processo.

Minha proposta: não usar Date nenhum. Parso a string manualmente e
calculo o dia da semana por aritmética pura (algoritmo de
Zeller/Sakamoto).
```

Custo do turno: 4 iterações, 36,5 segundos, 2.814 tokens de saída,
US$ 0,18.

O diagnóstico está certo e a proposta é cara: aritmética de calendário
escrita à mão é código que ninguém da equipe vai revisar, para
resolver um problema que a biblioteca padrão resolve com duas
chamadas.

## Turno 2: a decisão que fecha, com o motivo

**Prompt**: Você achou a armadilha certa e propôs remédio caro demais.
Zeller está descartado: é conta que ninguém aqui vai revisar. A decisão
é `Date.UTC(ano, mes - 1, dia)` seguido de `getUTCDay()`: quem cria e
quem lê ficam os dois em UTC, então não existe fuso no meio. Vale para
o projeto inteiro. Implemente marcar consulta com essa função.

```typescript
// src/agenda/marcar-consulta.usecase.ts
function diaDaSemana(data: string): number {
  const partes = data.split("-");
  const ano = Number(partes[0]);
  const mes = Number(partes[1]);
  const dia = Number(partes[2]);
  return new Date(Date.UTC(ano, mes - 1, dia)).getUTCDay();
}
```

Sai a fatia inteira, com as duas recusas da spec, e um teste que fixa
o dia da semana contra datas reais de calendário:

```text
Confirmado: 04/08/2026 é terça (getUTCDay() === 2) e 05/08/2026 é
quarta (=== 3): datas reais que vou usar para fixar o dia da semana
no teste.
```

Custo do turno: 25 iterações, 196,5 segundos, 18.002 tokens de saída,
US$ 0,78. Dezenove testes verdes.

## A folha de âncoras, escrita fora da janela

Antes do turno seguinte, a folha de `transcripts/ancoras-sessao-03.md`
recebe a decisão e o descarte, os dois com motivo. O critério de
admissão é uma pergunta só: se esta sessão sumir agora, isto volta de
graça? O `tsconfig.json` volta. As convenções voltam. As mensagens da
spec voltam. O motivo de a data ser lida em UTC não volta de lugar
nenhum, porque ele nunca foi escrito em lugar nenhum.

## Turnos 3 e 4: o cancelamento

O pedido de cancelar consulta vem com o desenho antes do código, e a
sessão devolve quatro decisões para aprovação. A terceira é a que
interessa: `id` inexistente ou consulta já cancelada não ganha
mensagem de recepção, porque frase de recepção só nasce na spec, e
isso aqui é uso indevido da API, não regra da clínica. O caminho vira
`ErroConsultaNaoEncontrada` sem string de spec e 404 com corpo vazio.

Custo dos dois turnos: 30 iterações, 225,5 segundos, 21.874 tokens de
saída, US$ 1,12. Vinte e oito testes verdes, `tsc --noEmit` limpo.

O turno 4 fecha com uma frase que vale por um capítulo:

```text
Também salvei na memória a decisão sobre erros fora da spec, para
manter esse padrão em use cases futuros.
```

A decisão está certa e o lugar está errado. O arquivo foi parar em
`~/.claude/projects/<projeto>/memory/`, fora do repositório: `git
status` não mostra, o commit não leva, o próximo dev não recebe. Está
registrado como F04 em `falhas.md`. A regra virou seção de
`docs/convencoes.md` e o arquivo de memória foi apagado, para não
existirem duas cópias divergindo com o tempo.

## A compactação

Com a fatia pronta, é hora de comprimir de propósito, com a instrução
da folha. Em modo não interativo o comando não se aplica à sessão
retomada com `--continue`:

```console
$ claude --print --continue --output-format stream-json --verbose \
    "/compact Preserve literalmente as decisões fechadas [...]"
{"type":"system","subtype":"status","status":"compacting"}
{"type":"system","status":null,"compact_result":"failed",
 "compact_error":"Not enough messages to compact."}
```

O `/compact` roda antes de o histórico ser carregado. Com `--resume` e
o identificador da sessão na mão, funciona:

```console
$ claude --print --resume eb1d5a3f-... --output-format stream-json \
    --verbose "/compact Preserve literalmente as decisões fechadas
    com o motivo e os descartes com o motivo."
{"type":"system","subtype":"compact_boundary","compact_metadata":{
  "trigger":"manual","pre_tokens":71665,"post_tokens":7783,
  "cumulative_dropped_tokens":63882,"duration_ms":72550}}
```

Os números da compressão, que ninguém costuma ver: 71.665 tokens
entraram, 7.783 saíram, 63.882 foram descartados. A operação levou
72,5 segundos e custou US$ 0,31, sem produzir um único token de
trabalho útil. Onze por cento do contexto sobreviveu.

## O que o resumo trouxe, e a surpresa embaixo dele

O resumo de 11.712 caracteres preservou a decisão do cancelamento
com o motivo, palavra por palavra, exatamente como a instrução pediu.
E não trouxe uma linha sobre `Date.UTC`, sobre `getUTCDay`, sobre
Zeller ou sobre o bug das 21h.

A explicação não é falha do resumo. É que aquilo já não estava lá:

```console
$ python3 -c "mapeia mensagens de usuário por arquivo de sessão"
b7ca7821 2 || ## Abre o pacote [...] ~~ Você achou a armadilha certa
                e propôs remédio caro demais. Z
eb1d5a3f 3 || Commitei. Agora cancelar consulta [...] ~~ As quatro
                decisões estão aprovadas [...]
```

A sessão 03 não existe. Existem duas sessões: uma com os turnos 1 e 2
e outra com os turnos 3 e 4. Encadear turnos com `--continue` criou um
arquivo novo no meio do caminho, e os turnos 3 e 4 rodaram sem
nenhuma memória de conversa dos turnos 1 e 2. Trabalharam bem assim
porque o que eles precisavam saber estava no `CLAUDE.md`, nas
convenções, na spec e no código já escrito no disco.

A lição é anterior à compressão e mais dura que ela: comprimir é a
segunda coisa que apaga contexto. A primeira é a ferramenta decidir
sozinha onde a sessão termina.

## O teste de sobrevivência

Vale a pena medir o que sobrou, e a medida é um pedido novo que
dependa da decisão do turno 2.

**Prompt**: Não escreva nada ainda, só responda. A recepção quer um
relatório mensal que separa consultas em dia útil e fim de semana,
então vou precisar de uma função que, dada uma data `YYYY-MM-DD`, diga
o dia da semana. Antes de você propor como fazer: existe alguma
decisão anterior deste projeto sobre como obter dia da semana a partir
de uma data? Se existir, qual é ela e qual foi o motivo?

A sessão compactada faz `grep`, abre o use case e responde certo sobre
o que fazer. Sobre o porquê, responde assim:

```text
O motivo, confirmado pelo teste marcar-consulta.usecase.test.ts:135
("fixa o dia da semana a partir da data"), é evitar depender do fuso
horário local do processo.
```

O "o quê" voltou de graça, porque estava escrito em código. O motivo
não voltou: foi reconstruído por plausibilidade. A frase está quase
certa e não é a decisão que foi tomada, que falava de um bug
específico do sistema antigo, com arquivo e linha, e de uma classe de
código proibida em consequência. Pior que a imprecisão é o "confirmado
pelo teste": o teste confirma comportamento, nunca razão, e a fonte
citada não sustenta a afirmação. É a alucinação extrínseca do capítulo
19 aplicada à história do próprio projeto.

Custo dessa resposta: 3 iterações, 12,0 segundos, US$ 0,20.

## Onde o motivo passou a morar

A correção não é escrever um resumo melhor. É tirar a decisão da
conversa: `docs/decisoes.md`, uma entrada por decisão fechada, com o
motivo, o proibido em consequência e o descarte. O `CLAUDE.md` ganhou
a linha que aponta para lá, na seção "Onde a verdade mora".

Feito isso, a mesma pergunta em uma sessão nova, sem nada herdado:

```text
Sim, existe: D1 em docs/decisoes.md. [...] Motivo: no sistema legado
(src/utils.js:3), a data passa por toISOString(), e uma consulta
marcada depois das 21h no fuso de Brasília acaba gravada com a data
do dia seguinte, bug que a recepção convive desde 2019. Proibido em
consequência: new Date(string).getDay() e toISOString() para obter
data em qualquer arquivo do projeto. Descartado: Zeller/Sakamoto.
```

Uma leitura de arquivo, 8,6 segundos, US$ 0,10, motivo literal e
descarte junto. Contra 12,0 segundos, US$ 0,20 e um motivo inventado
com fonte falsa. A âncora mais barata é a que você não precisa
carregar, porque virou arquivo do projeto.

## Custo total da sessão

| Turno | Iterações | Tempo | Tokens de saída | Custo |
|---|---|---|---|---|
| 1, dia da semana | 4 | 36,5 s | 2.814 | US$ 0,18 |
| 2, marcar consulta | 25 | 196,5 s | 18.002 | US$ 0,78 |
| 3, desenho do cancelamento | 10 | 61,2 s | 5.234 | US$ 0,26 |
| 4, cancelamento | 20 | 164,3 s | 16.640 | US$ 0,86 |
| compactação | 0 | 72,6 s | 0 | US$ 0,31 |
| sobrevivência, sem ADR | 3 | 12,0 s | 859 | US$ 0,20 |
| sobrevivência, com ADR | 2 | 8,6 s | 564 | US$ 0,10 |
| Total | 64 | 551,7 s | 44.113 | US$ 2,70 |

Cache lido nos sete comandos: 2,8 milhões de tokens.
