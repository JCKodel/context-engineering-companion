# Claude Code GitHub Actions (agente em CI)

Verificado em julho/2026. Estado coberto: Claude Code GitHub Actions
v1, conforme a documentação oficial em
https://code.claude.com/docs/en/github-actions (acesso em 2026-07-28).

Classe: agente em CI. Ele roda num runner do GitHub, disparado por um
evento do repositório, sem ninguém ao lado para corrigir o rumo no meio
do caminho.

## Onde vive o contexto persistente

Todo ele no repositório, e só ali. São dois arquivos com papéis
distintos. O `CLAUDE.md` na raiz define padrões de código, critérios de
revisão e regras do projeto, e a documentação diz que o agente os segue
ao criar pull requests e responder a pedidos. O arquivo de workflow em
`.github/workflows/` define o contexto daquela execução, pelo parâmetro
`prompt` e pelos argumentos passados em `claude_args`.

Não existe aqui o equivalente ao seu arquivo pessoal de preferências.
Se a informação não está versionada ou escrita no workflow, ela não
existe para o agente.

## O que a ferramenta injeta sozinha

O evento que disparou a execução. Numa menção `@claude` em issue ou
comentário de pull request, o agente recebe o contexto daquela
conversa; num workflow agendado ou disparado por `pull_request`, ele
recebe o que o `prompt` mandar. O checkout do repositório não é
automático em todo caso: quando o workflow precisa dos arquivos, ele
roda `actions/checkout` antes do passo do agente.

A configuração mínima documentada é curta:

```yaml
- uses: anthropics/claude-code-action@v1
  with:
    anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
    prompt: "Your instructions here"
    claude_args: "--max-turns 5"
```

A chave de API vai para os secrets do repositório, com o nome
`ANTHROPIC_API_KEY`, e a documentação é direta: nunca faça commit de
chave de API no repositório.

## Custo de sessão

Aqui o custo é o mais visível das quatro classes, porque vem em duas
faturas. A documentação separa as duas: os minutos de GitHub Actions
consumidos pelo runner e os tokens de API consumidos por cada
interação. Cada execução paga tudo de novo, inclusive o `CLAUDE.md`
inteiro, e execução disparada por evento frequente multiplica isso pelo
número de eventos.

As recomendações oficiais de contenção são do mesmo tipo que o livro
usa para janela de contexto: manter o `CLAUDE.md` conciso e focado,
configurar `--max-turns` em `claude_args` para evitar iteração
excessiva, definir timeout no workflow e usar controle de concorrência
para limitar execuções paralelas.

## O que sobrevive entre interações

Nada da execução anterior. Cada rodada começa do zero e termina quando
o job termina. O que sobrevive é o que virou artefato do repositório:
commit, pull request, comentário na issue. Um agente em CI que descobre
algo relevante e não escreve em lugar nenhum descobriu para ninguém.

Essa é a diferença que muda o desenho do seu contexto: no terminal você
corrige o agente na segunda tentativa; no CI não existe segunda
tentativa dentro da mesma execução, e o que faltar no arquivo vira
resultado errado publicado no pull request.

## Como levar as técnicas do livro para cá

Trate o workflow como um prompt versionado, revisado como código. Tudo
que você diria ao agente na primeira mensagem de uma sessão interativa
precisa estar no `CLAUDE.md` ou no `prompt`. E prefira tarefas com
critério de sucesso verificável pela própria CI, porque o agente sem
humano no loop não tem quem responda "não era isso".
