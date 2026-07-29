## Abre o pacote: o que não pode ser violado (camada 1)

- Regra de negócio mora no use case. O arquivo HTTP traduz erro em
  status e não decide nada.
- A tarefa acontece em `src/agenda/`, sem subpasta técnica.
- Mensagem de erro exibida à recepção é copiada literalmente da spec.
- Quem escolhe onde o banco mora é o ponto de entrada. Nenhum valor
  padrão de infraestrutura dentro da fatia.
- Nenhuma dependência nova.

## Meio do pacote: o material da tarefa (camada 2)

- O que construir: a fatia `agenda`, com marcar consulta e cancelar
  consulta, conforme a seção "Consultas" de `docs/spec-agendamento.md`
  e os critérios de aceite 1, 2 e 3.
- O que já existe para reusar: `src/profissionais/`, com o
  repositório que devolve a grade e os tipos `Profissional` e
  `FaixaGrade`. A agenda fala com profissionais pela porta da frente,
  quer dizer, pelo que a fatia exporta, nunca pela tabela.
- Formato herdado, que continua valendo: horário é inteiro em minutos
  desde a meia-noite; data é string `YYYY-MM-DD`
  (`docs/legado/mapa-do-codigo.md`).
- O que NÃO construir agora: lista de espera e encaixe automático.
- Onde o diff acontece: arquivos novos em `src/agenda/` e a rota
  registrada em `src/servidor.ts`.
- Teto do pacote: se precisar de qualquer arquivo que não está aqui,
  peça antes de supor.

## Fecha o pacote: o pedido (camada 4)

Implemente marcar consulta, com as duas recusas da spec, e os testes
das regras. Cancelar consulta fica para o pedido seguinte.

Uma coisa antes: o dia da semana da consulta sai da data. Me diga
como você pretende obter esse dia a partir da string `YYYY-MM-DD`
antes de escrever a função, porque essa conta tem um jeito errado que
o sistema antigo usa até hoje.
