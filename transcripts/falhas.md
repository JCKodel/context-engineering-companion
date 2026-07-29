# Falhas das sessões

Registro do que deu errado durante a construção do AgendaVila, uma
entrada por falha, na ordem em que aconteceram. Falha aqui é o que a
sessão fez de errado tendo o contexto certo na janela, ou o que ela
deixou de fazer sem avisar. Erro que o pacote causou também entra,
com a linha do pacote que causou.

## F01: a metade do pedido que voltou em silêncio

**Sessão**: 01, bootstrap
**Custo do conserto**: 1 turno, 12,9 segundos, US$ 0,21

O pedido do pacote tinha duas partes: o servidor Hono com `/saude` e
o acesso ao SQLite disponível para os repositórios. A sessão entregou
a primeira, rodou o teste, pediu o commit e encerrou sem mencionar a
segunda.

Cobrada no turno seguinte, ela respondeu que o acesso ao banco não
devia existir ainda, porque criar `compartilhado/` sem uma segunda
feature usando seria a abstração prematura que `docs/convencoes.md`
proíbe. A decisão está certa. O problema é que ela ficou implícita: o
pacote pedia explicitamente que a escolha fosse justificada em uma
frase antes de escrever o arquivo, e essa frase não veio.

O que isso ensina sobre o pacote: instrução composta some quando o
turno é interrompido no meio. O turno 1 acabou numa pergunta sobre
dependência, e o turno 2 respondeu à pergunta, não ao pedido
original. Pedido de duas partes precisa voltar em duas partes, ou
virar dois pedidos.

## F02: a decisão de produção escondida num valor padrão

**Sessão**: 02, profissionais
**Custo do conserto**: 1 turno, 75,6 segundos, US$ 0,60

`criarRepositorioProfissionais` nasceu com
`db: DatabaseSync = new DatabaseSync(":memory:")`, e `src/servidor.ts`
chamava a cadeia sem argumento. O servidor que a clínica sobe com
`npm run dev` perdia todos os profissionais a cada restart.

A sessão não afirmou nada de errado sobre isso, e é justamente esse o
problema: ela não afirmou nada. A decisão entrou por um valor padrão,
que é o lugar onde escolha de infraestrutura passa despercebida, e os
dez testes ficaram verdes porque banco em memória é o que o teste
quer.

O que isso ensina sobre a checagem: conferir as afirmações da sessão
não basta em fatia com efeito externo. Depois de banco, arquivo ou
rede entrarem na fatia, a pergunta obrigatória é onde essa coisa
mora quando o sistema roda de verdade, e a resposta se procura no
código, não na resposta.

## F03: o reparo criou o rastro seguinte

**Sessão**: 02, profissionais
**Custo do conserto**: 1 turno, 48,3 segundos, US$ 0,23

Consertado o F02, o banco passou a ser aberto no topo de
`src/servidor.ts`. Como `servidor.test.ts` importa esse módulo,
`npm test` passou a criar `agendavila.db` na raiz: a suíte abriria o
banco de produção na máquina que serve a clínica.

A sessão observou o fato ("`agendavila.db` foi criado na raiz ao
rodar os testes") e não puxou a consequência, o que é o mesmo padrão
do F01 em outra roupa. A correção foi mover a abertura do banco para
dentro do bloco que só roda quando o arquivo é executado direto.

O que isso ensina: reparo é mudança, e mudança pede a mesma checagem
que originou o reparo. A pergunta "o que essa correção passou a
fazer que antes não fazia" vale um comando e economizou, aqui, um
banco de produção aberto por engano.
