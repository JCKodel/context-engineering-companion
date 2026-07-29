# Context Engineering: companion repo

Guias por ferramenta do livro *Context Engineering: Engineering
Information for AI Systems*, de J.C. Ködel. Tudo aqui é escrito em
português brasileiro.

Endereço canônico deste repositório:
https://github.com/jckodel/context-engineering-companion

## Por que este repositório existe

O livro ensina classes de ferramenta, não versões de ferramenta. Um
assistente de chat, um agente de IDE, um agente de terminal e um agente
em CI se comportam de formas diferentes em quatro pontos, e são esses
quatro pontos que o livro trata como estáveis:

1. onde vive o contexto persistente;
2. o que a ferramenta injeta sozinha na janela;
3. quanto custa cada sessão;
4. o que sobrevive entre uma interação e a próxima.

A resposta concreta para cada um desses pontos muda a cada release de
cada produto. Um capítulo com passo a passo de configuração nasceria
desatualizado. Por isso o detalhe perecível mora aqui, num repositório
que recebe commit quando a ferramenta muda, enquanto o livro fica com o
que não muda.

## Estrutura

```text
guias/
├── chat/       # assistentes de chat
├── ide/        # agentes acoplados ao editor
├── terminal/   # agentes de linha de comando
└── ci/         # agentes que rodam sem humano no loop
```

Cada guia cobre os quatro atributos da classe aplicados a uma
ferramenta concreta e aponta para a documentação oficial dela. Todo
guia abre declarando o mês e o ano em que foi verificado e o estado da
ferramenta naquele momento. Guia que não cobre os quatro atributos é
considerado incompleto.

## Política de atualização

O repositório evolui por commits normais na branch `main`. Correção,
ferramenta nova ou mudança de comportamento entram por issue ou pull
request. Quando um guia é revisado, a linha "Verificado em" muda junto:
guia com data velha é sinal de que ninguém conferiu, não de que nada
mudou.

O livro cita estados fixos deste repositório por tag. Os blocos
impressos nos capítulos são conferidos por diff contra um clone limpo
na tag citada, e não contra o `main`. A tag `livro-parte-iv` marca o
estado que os capítulos 26 e 27 citam. O `main` segue adiante da tag,
e é ele que você deve ler para saber como a ferramenta se comporta
hoje.

## Como contribuir

Abra uma issue descrevendo o que está errado ou desatualizado, com link
para a documentação oficial que sustenta a correção. Pull request é
bem-vindo e segue três regras:

1. toda afirmação sobre comportamento de ferramenta traz a URL da
   documentação oficial;
2. o guia mantém os quatro atributos como espinha dorsal, na mesma
   ordem;
3. a linha "Verificado em" é atualizada no mesmo commit que altera o
   conteúdo.

## Licença

Conteúdo sob Creative Commons Attribution 4.0 International (CC BY
4.0). Veja o arquivo `LICENSE`. Você pode copiar, adaptar e redistribuir
com atribuição.
