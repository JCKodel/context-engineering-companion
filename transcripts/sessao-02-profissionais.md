# Sessão 02: fatia de profissionais e validação de contexto

Ferramenta: Claude Code 2.1.220 (Anthropic), modelo Sonnet 5
Data: 2026-07-29
Sessão: 02, cadastro de profissionais e grade semanal
Técnica-alvo: validação de contexto (cap. 19)
Reconstrução: não

Sessão nova, sobre o repositório que a sessão 01 deixou. O pacote
está em `transcripts/pacote-02.md` e traz uma coisa que os anteriores
não tinham: material do sistema antigo. A grade dos profissionais é
carregada de lá, então `docs/legado/mapa-do-codigo.md` entra na
janela, e com ele entra a chance de a sessão afirmar como regra de
hoje o que era regra de 2019.

O pedido do pacote começa assim, e é essa frase que dá o que checar:

```markdown
Antes de escrever qualquer arquivo, me diga em até cinco linhas o que
você entendeu que o sistema faz hoje nesta área: o que é a grade, que
regras ela impõe e o que já existe no repositório para você reusar.
```

## Turno 1: cinco afirmações de estado e um buraco na spec

A sessão lê a spec, as convenções, o mapa do legado, o servidor e o
`package.json`, não escreve nada e devolve o entendimento pedido:

```text
1. Grade é a agenda semanal do profissional: por dia da semana, uma
   faixa início/fim em que ele atende; dia sem faixa cadastrada é dia
   sem atendimento.
2. O formato herdado (docs/legado/mapa-do-codigo.md) guarda isso na
   tabela grade (prof_id, dia_semana, inicio, fim), com horário como
   inteiro em minutos desde a meia-noite: preciso manter esse formato
   na tabela nova.
3. Regras da spec para o cadastro: grade vazia é recusada (pelo menos
   um dia com faixa); cada faixa exige início antes do fim, e os dois
   em minuto cheio ou meia hora (múltiplos de 30, para casar com os
   slots).
4. Hoje src/profissionais/ só tem .gitkeep: nada para reusar. É a
   primeira fatia com persistência, então o repositório com
   node:sqlite nasce aqui.
5. Fora de escopo aqui: consulta, cancelamento, lista de espera e
   encaixe.
```

E aponta uma lacuna real:

```text
Uma dúvida antes de escrever código: CLAUDE.md exige que toda
mensagem de erro exibida à recepção seja copiada literalmente da
spec. A seção "Consultas" tem mensagens entre aspas, mas a seção
"Profissionais" não traz nenhuma para as duas recusas do cadastro.

Que texto exato você quer para essas duas mensagens de erro?
```

Custo do turno: 8 iterações, 61,7 segundos, 5.198 tokens de saída,
US$ 0,24.

A pergunta está certa e a resposta não pode ser digitada aqui. Se a
mensagem nascer nesta conversa, ela existe só aqui, e a próxima
sessão vai perguntar de novo. As duas frases entraram na spec e
foram commitadas antes do turno seguinte:

```console
$ git log --oneline -1 -- docs/spec-agendamento.md
b314963 Spec: fixa as duas mensagens de recusa do cadastro de profissional
```

## Turno 2: o pedido aponta para o arquivo, não para a conversa

**Prompt**: Você achou um buraco real na spec, e o lugar de tapar é a
spec, não esta conversa. Acabei de fixar as duas mensagens em
docs/spec-agendamento.md, seção Profissionais, linhas 27 a 33, e
commitei. Leia de lá e copie literalmente. Um ajuste na sua leitura do
item 3: a spec agora diz hora cheia ou meia hora, não minuto cheio. Se
alguma coisa no repositório contradisser o que eu acabei de afirmar,
pare e me mostre o trecho em vez de escolher um dos dois.

A primeira coisa que a sessão faz não é ler a spec: é conferir o
commit que eu disse ter feito.

```console
$ git log --oneline -3 -- docs/spec-agendamento.md
b314963 Spec: fixa as duas mensagens de recusa do cadastro de profissional
8c90f40 Pacote de contexto inicial: spec de agendamento, CLAUDE.md e convencoes
```

Sai a fatia inteira, com a regra no use case e a tradução do erro no
arquivo HTTP:

```typescript
// src/profissionais/cadastrar-profissional.usecase.ts
export class ErroCadastroProfissional extends Error {}

const MINUTOS_POR_FAIXA = 30;

function faixaValida(inicio: number, fim: number): boolean {
  return (
    inicio < fim &&
    inicio % MINUTOS_POR_FAIXA === 0 &&
    fim % MINUTOS_POR_FAIXA === 0
  );
}
```

```typescript
// src/profissionais/profissionais.repositorio.ts
  db.exec(`
    CREATE TABLE IF NOT EXISTS grade (
      prof_id INTEGER NOT NULL,
      dia_semana INTEGER NOT NULL,
      inicio INTEGER NOT NULL,
      fim INTEGER NOT NULL
    )
  `);
```

E a sessão responde à instrução de parar diante de contradição:

```text
Sobre "hora cheia ou meia hora": não achei contradição em nenhum
lugar do repositório. Em minutos desde a meia-noite isso equivale a
múltiplo de 30, que é a mesma checagem que eu já tinha
(inicio % 30 === 0 && fim % 30 === 0), então segui sem parar.
```

Dez testes verdes, `tsc --noEmit` limpo. Custo do turno: 14
iterações, 90,6 segundos, 8.295 tokens de saída, US$ 0,54.

## A checagem

Três comandos, todos apontando para o projeto e nenhum para a sessão.

A primeira checagem é se as duas mensagens do código são mesmo as da
spec, e não uma paráfrase:

```console
$ python3 -c "
import re,glob
spec=' '.join(open('docs/spec-agendamento.md').read().split())
for arq in glob.glob('src/profissionais/*.usecase.ts'):
    for m in re.findall(r'\"([A-ZÀ-Ú][^\"]{10,})\"', open(arq).read()):
        print(('  confere na spec: ' if m in spec else '  FORA DA SPEC:   ')+m)
"
  confere na spec: Profissional precisa de pelo menos um dia de atendimento
  confere na spec: Faixa de atendimento inválida
```

A segunda é se o formato herdado é mesmo aquele. A afirmação veio de
`docs/legado/mapa-do-codigo.md`, que é documento; a fonte que manda é
o código que roda na clínica:

```console
$ grep -rn "dia_semana\|prof_id" ../../003-parte-ii-construindo-contexto/code/clinica-legado/src/agenda.js
4:  db.query('SELECT * FROM grade WHERE prof_id = ? AND dia_semana = ?',
9:      var t = g.inicio;
10:      while (t + 30 <= g.fim) {
```

A terceira não estava na lista de afirmações. É a pergunta que sobra
quando a fatia tem banco: onde esse banco mora.

```console
$ grep -rn ":memory:\|DatabaseSync" src/ | grep -v test
src/profissionais/profissionais.repositorio.ts:1:import { DatabaseSync } from "node:sqlite";
src/profissionais/profissionais.repositorio.ts:23:  db: DatabaseSync = new DatabaseSync(":memory:"),
```

Duas afirmações passaram. A terceira coisa é a que interessa, e ela
não é uma afirmação errada: é uma decisão que nunca foi dita. O
parâmetro tem valor padrão, `src/servidor.ts` chama a função sem
argumento, e o servidor que a clínica sobe com `npm run dev` perde
todos os profissionais a cada restart. Os dez testes continuam verdes
porque banco em memória é exatamente o que um teste quer.

## Turno 3: o reparo

**Prompt**: [as duas afirmações conferidas, com arquivo e linha] A
terceira não passou, e você não a declarou. Em
src/profissionais/profissionais.repositorio.ts linha 23 o parâmetro db
tem valor padrão new DatabaseSync(':memory:'), e src/servidor.ts chama
criarRotasProfissionais() sem argumento. [...] Tire o default. Quem
escolhe onde o banco mora é o ponto de entrada, não o repositório.

O default sai dos dois lugares, os testes passam a pedir `:memory:`
de propósito, e o servidor escolhe o arquivo na cara:

```typescript
const banco = new DatabaseSync("agendavila.db");
const repositorioProfissionais = criarRepositorioProfissionais(banco);
```

Custo do turno: 16 iterações, 75,6 segundos, 5.046 tokens de saída,
US$ 0,60. E o fecho do turno traz um fato novo, dito sem alarme:

```text
Confirmei que agendavila.db foi criado na raiz ao rodar os testes
(via servidor.test.ts, que importa app) e que git status não o lista.
```

## Turno 4: o reparo tem rastro

A frase acima é a próxima afirmação a checar, e ela reprova sozinha.
Rodar `npm test` passou a criar o banco de verdade na raiz, porque o
`new DatabaseSync("agendavila.db")` ficou no topo do módulo e
qualquer `import` o executa.

**Prompt**: Você notou o fato certo e não puxou a consequência:
agendavila.db nasce na raiz quando eu rodo npm test. Rodar a suíte não
pode tocar o banco de verdade, porque no dia em que alguém rodar os
testes na máquina que serve a clínica, a suíte vai abrir o arquivo de
produção. [...] Apague o agendavila.db que ficou na raiz e confirme,
rodando npm test com o arquivo ausente, que ele não volta.

```typescript
// src/servidor.ts
export const app = new Hono();

app.get("/saude", (c) => c.json({ status: "ok" }));

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const banco = new DatabaseSync("agendavila.db");
  const repositorioProfissionais = criarRepositorioProfissionais(banco);
  app.route("/", criarRotasProfissionais(repositorioProfissionais));
  serve({ fetch: app.fetch, port: 3000 });
}
```

```console
$ rm agendavila.db && npm test && ls agendavila.db
 Test Files  4 passed (4)
      Tests  10 passed (10)
ls: agendavila.db: No such file or directory
```

Custo do turno: 11 iterações, 48,3 segundos, 3.679 tokens de saída,
US$ 0,23.

## Custo total da sessão

| Turno | Iterações | Tempo | Tokens de saída | Custo |
|---|---|---|---|---|
| 1 | 8 | 61,7 s | 5.198 | US$ 0,24 |
| 2 | 14 | 90,6 s | 8.295 | US$ 0,54 |
| 3 | 16 | 75,6 s | 5.046 | US$ 0,60 |
| 4 | 11 | 48,3 s | 3.679 | US$ 0,23 |
| Total | 49 | 276,2 s | 22.218 | US$ 1,61 |

Cache lido nos quatro turnos: 2,0 milhões de tokens.

## O que a checagem pegou e o que ela não pegou

O capítulo 19 fala em afirmação que contradiz o pacote. Nesta sessão
não houve nenhuma: as cinco afirmações do turno 1 estavam certas, e
duas delas foram conferidas contra arquivo e linha em vinte segundos.
O que reprovou foi outra coisa, e vale mais como aviso: o defeito
entrou por uma decisão que a sessão tomou sem afirmar nada, escondida
no valor padrão de um parâmetro.

Fica a regra prática que esta sessão produziu, e ela é a razão de as
quatro perguntas do pacote incluírem "onde cada coisa vai": em fatia
com efeito externo, banco, arquivo, rede, a checagem não pode se
limitar ao que a sessão disse. Tem que incluir o que ela escolheu por
você enquanto os testes ficavam verdes.
