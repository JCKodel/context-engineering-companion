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
