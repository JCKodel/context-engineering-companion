# Spec: agendamento do AgendaVila

**Sistema**: AgendaVila (Clínica Vila Nova)

**Status**: aprovada pela coordenação clínica

**Última revisão**: 2026-07-29

## Contexto

A Clínica Vila Nova marca consultas em slots fixos de 30 minutos por
profissional. Hoje a recepção controla isso numa planilha, e a dor
diária é dupla: consulta marcada em cima de outra, e horário que vaga
por cancelamento e ninguém avisa quem estava esperando.

Este sistema substitui a planilha em três frentes: cadastro dos
profissionais com a grade de atendimento de cada um, marcação e
cancelamento de consultas com checagem de conflito, e lista de espera
que aproveita automaticamente o horário aberto por um cancelamento.

## Profissionais

Cada profissional tem nome, especialidade e uma grade semanal: por
dia da semana, o horário em que começa e termina o atendimento. Dia
sem faixa cadastrada é dia em que o profissional não atende.

- Profissional é cadastrado com pelo menos um dia de atendimento na
  grade; grade vazia é recusada.
- A faixa de um dia tem início antes do fim, e os dois caem em minuto
  cheio ou meia hora, para casar com os slots de 30 minutos.
- A grade pode ser alterada; consultas já marcadas fora da grade nova
  continuam válidas e aparecem na agenda do dia.

## Consultas

- Consulta é marcada para um profissional, um paciente e um horário
  de início; a duração é sempre 30 minutos.
- O horário precisa cair dentro da grade do profissional naquele dia
  da semana. Fora da grade, o sistema recusa com "Profissional não
  atende neste horário".
- Dois horários que se sobrepõem para o mesmo profissional são
  conflito, e o segundo é recusado com "Horário já ocupado". Dois
  profissionais podem atender no mesmo horário sem conflito.
- Consulta cancelada libera o horário e sai da agenda do dia, mas
  fica registrada com o motivo do cancelamento.

## Lista de espera e encaixe

- Quando o horário desejado está ocupado, o paciente entra na lista
  de espera daquele profissional, com a data pretendida.
- A lista é atendida por ordem de chegada: quem pediu primeiro tem
  preferência.
- Cancelar uma consulta dispara o encaixe automático: o primeiro da
  lista de espera do mesmo profissional na mesma data assume o
  horário liberado, e sai da lista.
- Se a lista de espera estiver vazia para aquele profissional e data,
  o horário fica livre para marcação normal.
- Encaixe automático respeita as mesmas regras da consulta: se o
  horário liberado não couber na grade vigente, o próximo da lista é
  avaliado no lugar.

## Critérios de aceite

1. **Dado** um profissional que atende terça das 8h às 12h, **quando** a
   recepção marca consulta às 9h de uma terça, **então** o sistema aceita.
2. **Dado** o mesmo profissional com consulta às 9h, **quando** a recepção
   marca outra às 9h no mesmo dia, **então** o sistema recusa com "Horário
   já ocupado".
3. **Dado** o mesmo profissional, **quando** a recepção marca consulta às
   14h de uma terça, **então** o sistema recusa com "Profissional não
   atende neste horário".
4. **Dado** um paciente na lista de espera de terça com um profissional
   cuja agenda está cheia, **quando** uma consulta daquele profissional
   naquela terça é cancelada, **então** o paciente da lista assume o
   horário liberado e deixa a lista.
5. **Dado** dois pacientes na mesma lista de espera, **quando** um horário
   abre, **então** quem entrou primeiro na lista fica com ele.

## Fora de escopo

Autenticação e controle de acesso, interface gráfica, notificação ao
paciente por qualquer canal, relatórios e faturamento, atendimento em
mais de uma unidade, fuso horário (tudo em horário local da clínica)
e migração versionada de banco.
