# Sessão 04: perder a manhã e retomar duas vezes

Ferramenta: Claude Code 2.1.220 (Anthropic), modelo Sonnet 5
Data: 2026-07-29
Sessão: 04, relatório mensal, interrompida de propósito
Técnica-alvo: recuperação de contexto (cap. 18)
Reconstrução: não

O capítulo 18 compara duas retomadas da mesma tarefa. Aqui elas
acontecem de verdade, com a mesma perda e o mesmo estado de disco: o
diff da tarefa pela metade foi salvo em um patch, a primeira retomada
rodou, o disco voltou ao ponto exato com `git apply`, e a segunda
retomada partiu do mesmo lugar. O que muda entre as duas é só o que
entra na janela.

## A tarefa que ficou pela metade

O pacote está em `transcripts/pacote-04.md` e pede o relatório mensal
que a recepção quer: consultas do mês por profissional, separadas em
dia útil e fim de semana. O pedido fecha com duas perguntas antes do
código, e a sessão responde as duas bem:

```text
1. Onde o relatório mora: em src/agenda/, sem nascer compartilhado/
nem uma feature nova. O relatório consulta e classifica dados que já
são donos de agenda; não é um eixo de mudança novo, é uma leitura
nova sobre o mesmo eixo.

2. diaDaSemana sai de dentro de marcar-consulta.usecase.ts e vira um
arquivo solto em src/agenda/. Extrair agora evita duplicar a
implementação exata que a decisão D1 amarra: duas cópias do mesmo
cálculo mandatório é o tipo de duplicação que convida alguém a
divergir por engano.
```

Custo do turno: 7 iterações, 51,8 segundos, US$ 0,23.

O turno seguinte aprova as duas, fecha uma terceira decisão, descarta
uma alternativa com motivo e pede só o repositório:

**Prompt**: A classificação em dia útil e fim de semana acontece no use
case, usando a função extraída, e não no SQL. Está descartado agregar
com `GROUP BY strftime('%w', data)` ou qualquer contagem por dia da
semana feita pelo SQLite, por dois motivos: regra de negócio mora no
use case, e uma segunda forma de calcular dia da semana no projeto é
exatamente o que a D1 existe para impedir. [...] Uma coisa fica em
aberto: consulta cancelada entra na contagem do mês? A coordenação
ainda não respondeu, então por enquanto não conta, e o nome do teste
registra a dúvida. Agora faça só o repositório.

Sai `listarPorMes`, com quatro testes, um deles carregando a dúvida no
nome. Custo: 6 iterações, 44,2 segundos, US$ 0,20. Trinta e um testes
verdes, nada commitado.

É aqui que a sessão morre. Duas decisões fechadas, um descarte com
motivo, uma pergunta em aberto e uma extração decidida que não foi
feita: nada disso está em arquivo nenhum.

## Retomada 1: a frase que todo mundo digita

**Prompt**: Ontem eu comecei o relatório mensal de consultas, aquele que
separa dia útil de fim de semana, e parei no meio. Continua de onde eu
parei.

A sessão se sai melhor do que a fama do método, e o motivo é o assunto
do livro inteiro: ela roda `git diff`, roda `npm test`, lê o pacote
que ficou no disco, lê `docs/decisoes.md`, lê a spec e as convenções.
O que estava em artefato voltou sozinho.

E ela ainda achou uma coisa que nem eu tinha visto:

```text
Conflito com a spec. docs/spec-agendamento.md lista "relatórios e
faturamento" em Fora de escopo (linha 85). O pacote-04 pede
exatamente um relatório. Isso foi combinado com a coordenação e a
spec só está desatualizada, ou é uma exceção pontual?
```

Está certíssimo, e virou o F06 de `falhas.md`. O achado é do tipo que
só aparece para quem chega sem pacote e precisa se situar na spec.

O que ela não recuperou é exatamente o que o capítulo 18 prevê. As
duas decisões fechadas no turno 1 voltaram como perguntas abertas:

```text
(b) já avanço para as duas perguntas que o pacote-04 deixou em aberto
para o use case: onde o relatório mora, e o que fazer com
diaDaSemana, hoje privada em marcar-consulta.usecase.ts (extrair para
reuso ou duplicar)?
```

Elas não estavam em aberto. Foram decididas, com motivo, e o motivo
morreu junto com a sessão. Custo até aqui, só para chegar a essas
perguntas: 12 iterações, 88,6 segundos, US$ 0,34.

Empurrada para seguir, ela resolve as duas do jeito dela:

```typescript
// src/agenda/marcar-consulta.usecase.ts
-function diaDaSemana(data: string): number {
+export function diaDaSemana(data: string): number {
```

```typescript
// src/agenda/relatorio-mensal.usecase.ts
import { diaDaSemana } from "./marcar-consulta.usecase.ts";
```

Não é o que tinha sido decidido, e é pior do que parece: o use case do
relatório passou a depender do use case de marcar consulta para
calcular uma data, e a função utilitária ficou pendurada num arquivo
cujo nome promete outra coisa. Trinta e cinco testes verdes. Custo do
turno: 9 iterações, 81,9 segundos, US$ 0,31.

## Retomada 2: mesmo disco, mais dois arquivos na janela

O diff voltou ao estado congelado com `git apply`, e a nota de estado
do capítulo 18 foi escrita: onde o diff parou, decisões fechadas,
descartado com motivo, aberto. Ela mora em `nota-de-estado.md`, na
raiz, dentro do `.gitignore`, e a cópia para leitura está em
`transcripts/nota-de-estado-sessao-04.md`.

**Prompt**: Retomando a tarefa do relatório mensal, que ficou pela
metade. O pacote dela está em `transcripts/pacote-04.md` e o estado em
que parei está em `nota-de-estado.md`, na raiz. Leia os dois e o diff
não commitado antes de qualquer coisa. Antes de escrever uma linha de
código, me responda três perguntas, e diga "não sei" em vez de supor: o
que já está feito, que decisões estão fechadas e o que foi descartado
e por quê.

Três comandos: `git status` com o diff, o pacote, a nota. Depois as
três respostas, com os motivos colados nas decisões, e o descarte do
`strftime` citado com os dois motivos. E o "não sei" no lugar exato:

```text
Um ponto em aberto que a nota registra explicitamente: não sei se
consulta cancelada entra na contagem do mês. A coordenação da clínica
ainda não respondeu, e por isso ainda não deve contar até haver
resposta.
```

Custo: 4 iterações, 20,0 segundos, US$ 0,13.

O fecho da tarefa saiu no turno seguinte, com a spec já emendada:
`dia-da-semana.ts` extraído para arquivo próprio, como decidido,
`gerar-relatorio-mensal.usecase.ts`, a rota
`GET /relatorios/mensal?mes=YYYY-MM` e os dublês dos outros use cases
ajustados. Trinta e oito testes verdes, `tsc --noEmit` limpo. Custo:
28 iterações, 213,8 segundos, US$ 0,86.

E um detalhe que eu não pedi e não corrigi:

```text
Removo nota-de-estado.md, que por definição própria "nasce com a
tarefa e morre com ela": a tarefa está fechando.
```

## As duas retomadas, lado a lado

| | Retomada 1 | Retomada 2 |
|---|---|---|
| O que entrou na janela | uma frase | pacote e nota |
| Iterações até saber onde estava | 12 | 4 |
| Tempo até saber onde estava | 88,6 s | 20,0 s |
| Custo até saber onde estava | US$ 0,34 | US$ 0,13 |
| Decisões fechadas recuperadas | 0 de 3 | 3 de 3 |
| Descarte recuperado | não | sim, com os dois motivos |
| Pergunta em aberto | perdida | devolvida como "não sei" |
| Resultado do código | diverge da decisão | segue a decisão |

A diferença de custo é pequena e enganosa. O que importa não é
US$ 0,21 de diferença: é que a retomada 1 escreveu, com testes verdes,
um import que a equipe tinha decidido não ter, e ninguém revisando o
pull request depois teria como saber que aquilo já tinha sido
decidido em outro sentido.

E vale registrar o que as duas retomadas tiveram em comum, porque é a
tese do livro em forma de evidência: as duas recuperaram sozinhas o
formato do banco, as convenções, a D1 do dia da semana e o estado dos
testes. Nada disso precisou de memória, porque nada disso estava só na
memória. O que a nota de estado adiciona é exclusivamente aquilo que
não tem outro endereço: o que foi decidido hoje de manhã, o que foi
descartado e por quê, e qual é a próxima pergunta.

## Custo total da sessão

| Etapa | Iterações | Tempo | Tokens de saída | Custo |
|---|---|---|---|---|
| Trabalho, desenho | 7 | 51,8 s | 4.483 | US$ 0,23 |
| Trabalho, repositório | 6 | 44,2 s | 3.763 | US$ 0,20 |
| Retomada 1, situar-se | 12 | 88,6 s | 6.856 | US$ 0,34 |
| Retomada 1, use case | 9 | 81,9 s | 7.473 | US$ 0,31 |
| Retomada 2, situar-se | 4 | 20,0 s | 1.386 | US$ 0,13 |
| Retomada 2, fecha a tarefa | 28 | 213,8 s | 19.876 | US$ 0,86 |
| Total | 66 | 500,3 s | 43.837 | US$ 2,07 |

Cache lido nas seis invocações: 2,0 milhões de tokens.
