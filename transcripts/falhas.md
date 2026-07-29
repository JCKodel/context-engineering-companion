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

## F04: a decisão que ficou fora do repositório

**Sessão**: 03, agenda
**Custo do conserto**: nenhum turno de sessão; duas edições à mão

Ao implementar o cancelamento, a sessão decidiu que erro sem cobertura
na spec não ganha frase de recepção inventada, e fechou o turno
assim: "Também salvei na memória a decisão sobre erros fora da spec,
para manter esse padrão em use cases futuros."

A decisão está certa e o lugar está errado. O arquivo nasceu em
`~/.claude/projects/<caminho-do-projeto>/memory/`, fora do
repositório do AgendaVila. `git status` não mostra, o commit não
leva, o próximo dev clona o projeto e não recebe nada. A regra valia
para o time e foi arquivada na gaveta de uma máquina só.

O conserto foi promover a regra a seção de `docs/convencoes.md`, que
é onde convenção de projeto mora, e apagar o arquivo de memória para
não existirem duas cópias divergindo com o tempo.

O que isso ensina: a ferramenta escreve em lugares que não são o seu
repositório, e escreve por conta própria. Quando uma sessão anuncia
que guardou alguma coisa, a pergunta seguinte é onde, e a resposta só
serve se for um caminho que o `git` enxerga.

## F05: o motivo reconstruído, com fonte que não sustenta

**Sessão**: 03, agenda, depois da compactação
**Custo do conserto**: 8,6 segundos e US$ 0,10, depois do ADR escrito

Perguntada se havia decisão anterior sobre obter dia da semana e qual
o motivo dela, a sessão compactada achou a prática no código e
explicou o motivo assim: "o motivo, confirmado pelo teste
`marcar-consulta.usecase.test.ts:135`, é evitar depender do fuso
horário local do processo".

A prática estava certa e o motivo, não. A decisão real falava de um
bug específico do sistema antigo, com arquivo e linha, e proibia uma
classe de código em consequência. Nada disso estava no código, então
nada disso voltou; o que voltou foi uma explicação plausível montada
na hora. E a citação do teste é o agravante: teste confirma
comportamento, nunca razão, e a fonte citada não sustenta a afirmação
que ela apoia.

O conserto foi tirar a decisão da conversa e pôr em
`docs/decisoes.md`, com motivo, descarte e proibição. A mesma
pergunta, feita depois disso em sessão sem nada herdado, foi
respondida com uma leitura de arquivo e o motivo literal.

O que isso ensina: o código preserva a escolha e perde a razão. Uma
sessão que não tem a razão não fica em silêncio sobre ela, e é por
isso que a razão precisa morar num arquivo do projeto, e não numa
folha de âncoras que só existe enquanto a sessão durar.

## F06: o pacote contradizia a spec e ninguém viu, menos quem chegou sem ele

**Sessão**: 04, relatório mensal
**Custo do conserto**: uma emenda na spec, dois turnos depois

`docs/spec-agendamento.md` listava "relatórios e faturamento" em Fora
de escopo. O `pacote-04.md` pedia um relatório mensal. A contradição
estava a uma linha de distância e passou por dois turnos inteiros.

O detalhe que salva o registro é este: no turno 1 a sessão rodou
`grep -n -i "relat\|mensal\|dia útil\|fim de semana" docs/spec-agendamento.md`,
leu a linha que diz "fora de escopo" e seguiu para o desenho do
relatório sem mencionar o assunto. Quem apontou a contradição foi uma
sessão que chegou depois sem o pacote na janela, tentando descobrir
sozinha o que estava acontecendo.

A leitura mais provável é que o pacote afirmava o escopo com
autoridade, e a spec entrou na janela como confirmação de uma coisa
já decidida, não como fonte que pode discordar. A retomada, sem
pacote nenhum, foi ler a spec para se situar, e leu a seção inteira.

O conserto foi na spec: o relatório entrou no escopo, com a regra da
consulta cancelada, e faturamento continuou fora. O erro de origem,
porém, é do pacote, quer dizer, meu.

O que isso ensina: quem escreve o pacote é a última linha de defesa,
porque o pacote é a peça que ninguém confere. Camada 1 e camada 2
contra a spec é uma leitura de dois minutos, e vale ser feita antes de
mandar, não depois de duas sessões trabalharem em cima.

## F07: a fronteira de escrita não previa os testes

**Sessão**: 05, encaixes, subtarefa isolada
**Custo do conserto**: nenhum; o desvio foi declarado no retorno

O contrato da subtarefa autorizava escrever dentro de
`src/encaixes/` e mais duas exceções nominais: registrar a rota nova
em `src/servidor.ts` e tirar a rota de cancelamento de
`src/agenda/agenda.http.ts`. A instrução seguinte era explícita: se
precisar de qualquer outra mudança em `src/agenda/`, pare e devolva o
pedido em vez de editar.

A subtarefa editou também `src/agenda/agenda.http.test.ts`, que não
estava nas exceções, para remover os dois testes da rota que mudou de
dono. Sem isso a suíte quebraria, então o desvio era necessário: o
buraco é do contrato, que autorizou mexer num arquivo e esqueceu do
teste ao lado dele.

O que salva o episódio é que ela declarou o desvio na entrega, no
item de arquivos alterados, sem esconder atrás dos 47 testes verdes.
O que preocupa é que ela escolheu entregar em vez de parar, e essa é
a escolha que a instrução mandava não fazer.

O que isso ensina: fronteira de escrita se desenha por unidade de
mudança, não por arquivo. Autorizar um arquivo é autorizar o teste ao
lado dele, e um contrato que separa os dois vai ser desobedecido por
uma razão boa, que é o pior tipo de desobediência para se pegar depois.
