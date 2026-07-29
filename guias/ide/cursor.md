# Cursor rules (agente de IDE)

Verificado em julho/2026. Estado coberto: sistema de rules do Cursor,
conforme a documentação oficial em https://cursor.com/docs/rules
(acesso em 2026-07-28).

Classe: agente de IDE. O agente vive dentro do editor, enxerga o
projeto aberto e trabalha no mesmo working tree que você.

## Onde vive o contexto persistente

No repositório. As rules de projeto ficam em `.cursor/rules`, como
arquivos `.mdc` (markdown com frontmatter), e a documentação é
explícita ao dizer que elas são versionadas junto com o código. O
Cursor também lê `AGENTS.md`, na raiz do projeto ou em qualquer
subdiretório, como alternativa sem metadados.

Existe um segundo lugar, e ele não é versionado: as user rules,
definidas na própria instalação em Customize > Rules, valem para todos
os seus projetos e não acompanham o repositório. Quando a mesma regra
precisa valer para o time, ela pertence ao repositório, não ao seu
perfil. A precedência documentada, quando várias rules se aplicam, é
team rules, depois project rules, depois user rules.

## O que a ferramenta injeta sozinha

Depende do tipo da rule, e a distinção entre os quatro tipos é o que
decide o tamanho da sua janela em toda sessão:

- Always Apply (`alwaysApply: true`): entra em toda sessão, sem
  condição. É o tipo mais caro e o único que você paga mesmo quando o
  assunto não tem nada a ver.
- Apply Intelligently: o agente decide incluir a partir do campo
  `description`. Descrição vaga vira rule que nunca entra, ou que
  entra sempre.
- Apply to Specific Files: entra quando o arquivo em que você trabalha
  casa com o padrão de `globs`. É o tipo que melhor corresponde a
  contexto de subsistema.
- Apply Manually: só entra quando você referencia a rule com `@` no
  chat.

Em subdiretórios, a documentação registra que a instrução mais
específica ganha precedência sobre a do diretório pai. Monorepo com
rule genérica na raiz e rules específicas por pacote é o caso que essa
regra atende.

## Custo de sessão

Toda rule Always entra em toda sessão, e o preço é cobrado antes de
você digitar a primeira palavra. O padrão que envelhece mal é o arquivo
único de regras marcado como Always com tudo dentro: convenção de
frontend, convenção de banco, política de commit, tudo junto. Divida
por glob e a maior parte desse texto só aparece quando é relevante.

## O que sobrevive entre interações

O que está em arquivo sobrevive: `.cursor/rules` e `AGENTS.md` são
lidos de novo a cada sessão porque estão no disco. O que você explicou
no chat não sobrevive. A pergunta útil ao terminar uma sessão em que
você corrigiu o agente três vezes é qual dessas correções merece virar
rule, e com qual glob.

## Como levar as técnicas do livro para cá

Camadas de contexto viram tipos de rule: o que vale sempre é Always, o
que vale por subsistema é glob, o que vale de vez em quando é manual.
Contexto de feature acompanha a pasta da feature, num `AGENTS.md`
aninhado, e não sobe para a raiz só porque foi escrito hoje.
