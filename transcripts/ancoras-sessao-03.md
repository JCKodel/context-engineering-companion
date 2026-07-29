# Âncoras da sessão 03

Folha escrita durante a sessão, fora da janela, com o que não pode
sumir se a compressão rodar. Critério de admissão: se esta sessão
sumir agora, isto volta de graça? O que volta é ponteiro e fica de
fora.

## Decisões fechadas nesta tarefa (com motivo)

- Turno 2: o dia da semana sai de `Date.UTC(ano, mes - 1, dia)`
  seguido de `getUTCDay()`. Motivo: quem cria e quem lê ficam os dois
  em UTC, então não existe fuso no meio, e é a discordância entre
  criar em UTC e ler em local que produz o bug do legado depois das
  21h (`src/utils.js:3` do sistema antigo). Vale para o projeto
  inteiro, não só para esta fatia.
- Turno 2: nenhum código do AgendaVila chama
  `new Date(string).getDay()` nem `toISOString()` para obter data.

## Descartes (com motivo)

- Turno 2: calcular o dia da semana por aritmética pura, com
  Zeller ou Sakamoto, proposta da sessão. Motivo: é conta que ninguém
  da equipe vai revisar, para resolver um problema que a biblioteca
  padrão já resolve com duas chamadas.

## O que ficou de fora da folha de propósito

- Turno 4: erro que a spec não prevê não ganha frase de recepção
  inventada. Entrou na folha e saiu no mesmo dia: virou seção de
  `docs/convencoes.md`. Volta de graça agora, e essa é a promoção que
  toda âncora persegue.
- Turno 2: a decisão do dia da semana e o descarte do Zeller seguiram
  o mesmo caminho depois da compactação, e viraram a D1 de
  `docs/decisoes.md`. Ficam acima nesta folha como registro do que ela
  era enquanto ainda não tinha para onde ir.

- `noUncheckedIndexedAccess` obriga `Number(partes[0])` em vez de
  desestruturar. Volta de graça: está no `tsconfig.json` e o `tsc`
  reclama de novo no primeiro build.
- Nomes de arquivo, sufixos e a proibição de subpasta técnica. Voltam
  de graça: estão em `docs/convencoes.md`.
- As duas mensagens de recusa. Voltam de graça: estão na spec.

## A instrução que acompanha o resumo

Ao resumir esta sessão, preserve literalmente as decisões fechadas
com o motivo e os descartes com o motivo. Pode descartar saída de
teste, trechos de arquivo colados e a narrativa das tentativas. Se
cortar algo além disso, diga o que foi cortado.
