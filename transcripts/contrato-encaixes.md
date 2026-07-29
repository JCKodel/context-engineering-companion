# Contrato da subtarefa: fatia de encaixes

## O que ela recebe (pacote de entrada, montado antes de começar)

Abre o pacote, o que não pode ser violado:

- Regra de negócio mora no use case. O arquivo HTTP traduz erro em
  status e não decide nada.
- Papéis no nome do arquivo, sem subpasta técnica, conforme
  `docs/convencoes.md`.
- Fatia fala com fatia pela porta da frente: o use case público da
  outra fatia, importado pelo caminho da pasta dela. Nunca por tabela,
  nunca por arquivo interno.
- Mensagem de erro exibida à recepção vem copiada literalmente da
  spec. Erro que a spec não prevê não ganha frase inventada.
- Nenhuma dependência nova.

O material da tarefa:

- A regra está na seção "Lista de espera e encaixe" de
  `docs/spec-agendamento.md` e nos critérios de aceite 4 e 5. Leia de
  lá, não desta frase.
- O formato herdado continua valendo: horário é inteiro em minutos
  desde a meia-noite, data é string `YYYY-MM-DD`.
- Decisões já fechadas que valem aqui, e que não estão em discussão:
  - D3 de `docs/decisoes.md`: encaixes conhece agenda, agenda não
    conhece encaixes. A rota de cancelamento passa a ser servida por
    esta fatia.
  - D1 de `docs/decisoes.md`: dia da semana só sai de
    `src/agenda/dia-da-semana.ts`. Nada de `toISOString` nem de
    `new Date(string).getDay()`.
  - Consulta cancelada não conta em relatório, e cancelar duas vezes
    é uso indevido da API, não regra da clínica.

## O que ela devolve (formato fixo, cabe em uma página)

1. Os arquivos criados ou alterados, uma linha por arquivo.
2. As perguntas que precisou fazer a cada porta da frente das outras
   fatias, e o que faltou nelas.
3. As decisões que precisou tomar sozinha, com o motivo de cada uma.
4. O que supôs por falta de informação, marcado como suposição.
5. O resultado de `npm test` e de `npx tsc --noEmit`, em uma linha
   cada.

## O que ela não precisa saber

- O histórico das quatro sessões anteriores, as saídas de teste delas
  e os caminhos que já foram descartados por lá.
- Como o relatório mensal foi construído, e a discussão sobre onde
  `diaDaSemana` deveria morar, que já terminou.
- Que este repositório é o companion de um livro, e o que os
  transcripts em `transcripts/` estão fazendo aqui.
- O sistema legado da clínica e o mapa dele em `docs/legado/`.

## Fronteira de escrita

Cria e altera apenas dentro de `src/encaixes/` e os testes ao lado.
Duas exceções nominais, e só elas: registrar a rota nova em
`src/servidor.ts` e remover a rota de cancelamento de
`src/agenda/agenda.http.ts`, que muda de dono por causa da D3.

Se precisar de qualquer outra mudança em `src/agenda/` ou em
`src/profissionais/`, pare e devolva o pedido em vez de editar.
