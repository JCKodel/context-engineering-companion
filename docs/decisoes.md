# Decisões do AgendaVila

Uma entrada por decisão fechada, com o motivo e o que foi descartado.
O que entra aqui é o que uma sessão nova não conseguiria reconstruir
lendo o código: o código mostra a escolha, não a razão dela.

## D1: dia da semana sai de `Date.UTC` com `getUTCDay`

**Data**: 2026-07-29
**Vale para**: todo o projeto

O dia da semana de uma data `YYYY-MM-DD` é obtido assim, e só assim:
a string é quebrada em ano, mês e dia, a data é criada com
`Date.UTC(ano, mes - 1, dia)` e lida com `getUTCDay()`.

**Motivo**: quem cria e quem lê ficam os dois em UTC, então não existe
fuso no meio. É a discordância entre criar em UTC e ler em horário
local que produz o bug que o sistema antigo tem até hoje: em
`src/utils.js:3` do legado a data passa por `toISOString()`, e
consulta marcada depois das 21h no fuso de Brasília é gravada com a
data do dia seguinte. A recepção convive com isso desde 2019.

**Proibido em consequência**: `new Date(string).getDay()` e
`toISOString()` para obter data em qualquer arquivo do AgendaVila.

**Descartado**: calcular o dia por aritmética pura, com Zeller ou
Sakamoto. Motivo: é conta que ninguém da equipe vai revisar, para
resolver um problema que a biblioteca padrão já resolve com duas
chamadas.

## D3: encaixes conhece agenda, agenda não conhece encaixes

**Data**: 2026-07-29
**Vale para**: a fronteira entre as duas fatias

O encaixe automático dispara no cancelamento, então uma das duas
fatias precisa chamar a outra. A direção é uma só: `encaixes` importa
a porta da frente de `agenda` (marcar e cancelar consulta) e a agenda
nunca importa nada de `encaixes`.

A consequência prática é que a rota que a recepção usa para cancelar
muda de dono: ela passa a ser servida por `encaixes.http.ts`, que
compõe o cancelamento com a tentativa de encaixe, e sai de
`agenda.http.ts`.

**Motivo**: a alternativa faria as duas se importarem, e ciclo entre
fatias é o começo do caroço que a organização por feature existe para
evitar. Entre as duas direções possíveis, a que sobra é a que segue a
dependência real do domínio: encaixe não existe sem consulta, consulta
existe sem encaixe.

**Descartado**: passar para `cancelar-consulta.usecase.ts` uma função
de notificação que a fatia de encaixes registraria. Motivo: é
interface com implementação única, proibida pelas convenções, e
inverte a leitura do código sem tirar o acoplamento.

## D2: quem escolhe onde o banco mora é o ponto de entrada

**Data**: 2026-07-29
**Vale para**: todo repositório

Nenhum `criar*Repositorio` tem valor padrão para o banco. O
`DatabaseSync` é criado em `src/servidor.ts`, dentro do bloco que só
roda quando o arquivo é executado direto, e desce por parâmetro.

**Motivo**: o valor padrão `new DatabaseSync(":memory:")` já esteve
lá, e com ele a clínica perdia todos os profissionais a cada restart
do servidor, com a suíte inteira verde, porque banco em memória é
exatamente o que um teste quer. A abertura ficou dentro do bloco de
execução direta porque, fora dele, `npm test` abria o banco de
produção só por importar o módulo.
