## Abre o pacote: o que não pode ser violado (camada 1)

- Nenhuma dependência nova. A stack está fechada em CLAUDE.md:
  TypeScript, Hono, `node:sqlite`, Vitest. Se achar que precisa de
  outra coisa, pergunte em vez de instalar.
- Organização por feature. Nenhum arquivo em `src/` fora de uma pasta
  de feature, exceto o ponto de entrada do servidor.
- Interface com implementação única é proibida.

## Meio do pacote: o material da tarefa (camada 2)

- O que construir: o esqueleto do AgendaVila, antes de qualquer regra
  de negócio. Um servidor Hono que sobe e responde `GET /saude` com
  `{"status":"ok"}`, e o acesso ao SQLite disponível para os
  repositórios das features que virão.
- O que NÃO construir agora: nada de consulta, profissional, grade ou
  encaixe. As três features entram em sessões seguintes, uma por vez.
- Onde o diff acontece: `src/` (arquivos novos), `package.json` se
  precisar de script, e `src/placeholder.test.ts`, que deve ser
  removido porque existia só para provar que a suíte roda.
- Convenções que a tarefa toca: `docs/convencoes.md`, seções
  "Organização" e "Papéis no nome do arquivo".
- Teto do pacote: se precisar de qualquer arquivo que não está aqui,
  peça antes de supor.

## Fecha o pacote: o pedido (camada 4)

Monte o esqueleto descrito acima. Comece decidindo onde o acesso ao
banco vai morar, considerando que ainda não existe nenhuma feature, e
justifique a escolha em uma frase antes de escrever o arquivo. Ao
final, rode `npm test` e mostre a saída.
