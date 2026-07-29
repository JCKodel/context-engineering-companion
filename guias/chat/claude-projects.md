# Claude Projects (assistente de chat)

Verificado em julho/2026. Estado coberto: Projects na interface web do
Claude, conforme a central de ajuda oficial em
https://support.claude.com/en/articles/9517075-what-are-projects
(acesso em 2026-07-28).

Classe: assistente de chat. Você conversa numa interface de produto, sem
acesso ao seu sistema de arquivos, e o contexto que persiste é o que a
plataforma guarda por você.

## Onde vive o contexto persistente

Dentro do projeto, em dois lugares. As instruções do projeto (*project
instructions*) guardam o que você repetiria em toda conversa: tom,
papel, convenções, o que nunca fazer. A base de conhecimento do projeto
(*knowledge base*) guarda documentos, texto e código que você carrega
uma vez e passa a valer para todas as conversas daquele projeto.

Isso vive na plataforma, não no seu repositório. Nada disso entra no
`git log` e nada disso chega ao colega que abre o mesmo repositório na
máquina dele. Se um artefato de contexto precisa ser compartilhado com
o time, a origem dele é o repositório e o que está no projeto é uma
cópia que alguém precisa manter em dia.

## O que a ferramenta injeta sozinha

As instruções do projeto e a base de conhecimento entram nas conversas
daquele projeto sem você pedir. Quando a base de conhecimento se
aproxima dos limites de contexto, o Claude passa a usar recuperação:
segundo a documentação, o RAG (*retrieval augmented generation*, ou
geração aumentada por recuperação) é ativado automaticamente nos planos
pagos e expande a capacidade em até dez vezes, mantendo a qualidade das
respostas.

A consequência prática é a que interessa: com base pequena você sabe o
que entrou na janela, com base grande você não sabe. A partir daí, o
que o modelo enxerga passa a depender do que a recuperação encontrou,
e um documento presente na base deixa de ser garantia de documento
presente na resposta.

## Custo de sessão

Cada conversa nova do projeto paga de novo pelas instruções e pelo que
for trazido da base de conhecimento. Base grande com recuperação ativa
troca o custo fixo de carregar tudo pelo custo variável de buscar
trechos, e o que você economiza em token gasta em incerteza sobre o que
foi recuperado.

Conta de padeiro que vale a pena fazer antes de encher a base: material
que serve para toda conversa merece estar nas instruções ou na base;
material que serve para uma conversa só é mais barato colado na
conversa e descartado com ela.

## O que sobrevive entre interações

O projeto é descrito na documentação como um espaço autocontido, com
histórico de conversas próprio. Sobrevivem as instruções, a base de
conhecimento e a lista de conversas anteriores. O que não sobrevive é a
conversa em si: cada chat novo começa sem o que foi discutido no chat
anterior, mesmo dentro do mesmo projeto.

Por isso a conclusão de uma sessão longa precisa virar artefato. Se a
decisão ficou só no meio de um chat, ela morreu ali para efeito de
contexto: promova a decisão para as instruções, para a base de
conhecimento ou para um arquivo no repositório.

## Limites conhecidos

Usuários do plano gratuito têm limite de cinco projetos e não contam
com a recuperação automática. Confira a documentação oficial antes de
planejar uma base de conhecimento grande, porque limites de plano são
justamente o tipo de detalhe que muda entre uma verificação e outra
deste guia.
