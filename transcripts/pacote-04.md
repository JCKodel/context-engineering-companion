## Abre o pacote: o que não pode ser violado (camada 1)

- Regra de negócio mora no use case. O arquivo HTTP traduz erro em
  status e não decide nada.
- Antes de mudar qualquer coisa com entrada em `docs/decisoes.md`,
  leia a entrada.
- `compartilhado/` só nasce quando o mesmo código se provar necessário
  em duas features, e feature é eixo de mudança, não assunto.
- Nenhuma dependência nova.

## Meio do pacote: o material da tarefa (camada 2)

- O que construir: o relatório mensal que a recepção pediu, contando
  as consultas de um mês separadas em dia útil e fim de semana, por
  profissional.
- O que já existe para reusar: `src/agenda/`, com o repositório de
  consultas e o cálculo de dia da semana já resolvido lá dentro.
- Formato herdado, que continua valendo: horário é inteiro em minutos
  desde a meia-noite; data é string `YYYY-MM-DD`.
- O que NÃO construir agora: qualquer coisa de lista de espera ou
  encaixe.
- Onde o diff acontece: `src/agenda/`, mais a rota em
  `src/servidor.ts` quando chegar a hora dela.
- Teto do pacote: se precisar de qualquer arquivo que não está aqui,
  peça antes de supor.

## Fecha o pacote: o pedido (camada 4)

Antes de escrever, duas perguntas para você responder e eu aprovar:
onde este relatório mora, considerando a regra de `compartilhado/`, e
o que acontece com o cálculo do dia da semana, que hoje é uma função
privada dentro de `marcar-consulta.usecase.ts`.

Depois de aprovado, comece pelo repositório: a consulta que traz o
que o relatório precisa, com os testes dela. O use case e a rota
ficam para o pedido seguinte.
