# Claude Code (agente de terminal)

Verificado em julho/2026. Estado coberto: memória do Claude Code
(arquivos CLAUDE.md, `.claude/rules/` e auto memory), conforme a
documentação oficial em https://code.claude.com/docs/en/memory (acesso
em 2026-07-28).

Classe: agente de terminal. Ele roda no seu shell, dentro de um
diretório de trabalho, e alcança qualquer arquivo que você autorizar.

## Onde vive o contexto persistente

Em arquivos, e em mais de um escopo ao mesmo tempo. A documentação
lista quatro lugares, do mais amplo para o mais específico:

- política gerenciada pela organização, num caminho do sistema
  (`/Library/Application Support/ClaudeCode/CLAUDE.md` no macOS);
- preferências pessoais, em `~/.claude/CLAUDE.md`, que valem para
  todos os seus projetos;
- instruções do projeto, em `./CLAUDE.md` ou `./.claude/CLAUDE.md`,
  compartilhadas com o time por controle de versão;
- preferências pessoais do projeto, em `./CLAUDE.local.md`, que a
  documentação recomenda colocar no `.gitignore`.

A separação entre o terceiro e o quarto item é a que mais rende no dia
a dia de time: a URL do seu ambiente de testes é sua, a convenção de
nomes é do repositório.

Projetos grandes podem quebrar as instruções em vários arquivos dentro
de `.claude/rules/`. Uma rule com o campo `paths` no frontmatter só
entra em contexto quando o agente lê um arquivo que casa com o padrão.

## O que a ferramenta injeta sozinha

Os arquivos de memória, e nada mais até o agente ir buscar. A
documentação descreve o carregamento como uma subida na árvore de
diretórios: partindo do diretório de trabalho, cada diretório acima é
verificado, e todos os arquivos encontrados são concatenados no
contexto, do raiz do sistema de arquivos até o diretório onde você
está. Arquivos em subdiretórios abaixo do seu diretório de trabalho
não entram no início: eles são incluídos quando o agente lê arquivos
daquele subdiretório.

Duas consequências práticas. A primeira: rodar o agente na raiz do
monorepo ou dentro de um pacote muda o que ele carrega. A segunda:
instrução que contradiz outra instrução em outro nível não gera erro,
gera escolha arbitrária, e a documentação diz isso com todas as letras.

Um CLAUDE.md pode importar outros arquivos com a sintaxe `@caminho`,
até quatro níveis de profundidade. Import não economiza janela: o
arquivo importado é carregado no início da sessão junto com quem o
importou.

## Custo de sessão

Todo CLAUDE.md carregado é pago em toda sessão, antes do seu primeiro
prompt. A documentação recomenda manter cada arquivo abaixo de 200
linhas e observa que arquivos mais longos consomem mais contexto e
reduzem a aderência às instruções. O comando `/context` mostra quais
arquivos de memória entraram na sessão atual.

Quando as instruções crescem, a saída barata é escopo, não corte: mova
o que só vale para uma parte do código para uma rule com `paths`, e ela
deixa de ser cobrada nas sessões que não tocam aquela parte.

## O que sobrevive entre interações

Cada sessão começa com uma janela limpa. Sobrevive o que está em
arquivo: os CLAUDE.md, as rules e a auto memory, que é o mecanismo em
que o próprio agente anota o que aprendeu, num diretório por
repositório. Desse diretório, o índice `MEMORY.md` é carregado no
início de toda conversa, limitado às primeiras 200 linhas ou 25KB, o
que vier primeiro; os arquivos de detalhe só são lidos sob demanda.

A conversa em si não sobrevive. Decisão que ficou só no chat some no
fim da sessão, e o CLAUDE.md é o lugar onde você escreve o que
explicaria de novo amanhã.

## AGENTS.md

O Claude Code lê `CLAUDE.md`, não `AGENTS.md`. Se o repositório já usa
`AGENTS.md` para outros agentes, a documentação recomenda criar um
`CLAUDE.md` que importe o outro arquivo, e acrescentar abaixo do import
o que for específico do Claude Code:

```markdown
@AGENTS.md

## Claude Code

Use plan mode for changes under `src/billing/`.
```

Assim os dois agentes leem as mesmas instruções sem duplicação.

## Como levar as técnicas do livro para cá

A hierarquia de arquivos já é a camada de contexto: o que é seu fica no
home, o que é do repositório fica versionado, o que é da feature fica
na pasta da feature. Isolamento de contexto acontece pelo diretório em
que você inicia a sessão. E medir cabe no fluxo: `/context` mostra o
que a sua configuração está cobrando de você antes de qualquer trabalho
útil.
