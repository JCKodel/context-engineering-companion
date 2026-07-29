# AgendaVila

Sistema de agendamento da Clínica Vila Nova: profissionais com grade
semanal, consultas em slots de 30 minutos e lista de espera com
encaixe automático no cancelamento.

## Onde a verdade mora

- O que construir: `docs/spec-agendamento.md`. Sem spec na janela,
  pergunte antes de implementar.
- Como fazemos as coisas aqui: `docs/convencoes.md`, obrigatório para
  todo arquivo novo.
- O que já foi construído: o próprio `src/`, uma pasta por feature.

## Stack

- TypeScript 5 sobre Node.js 24 LTS ou superior, com módulos ES.
- Node roda os arquivos `.ts` direto, sem passo de build.
- Servidor HTTP com Hono, servido por `@hono/node-server` (adaptador
  oficial do time do Hono para rodar sobre Node.js). Decisão tomada
  em 2026-07-29; não pergunte de novo.
- Banco com `node:sqlite`, o módulo nativo do Node, sem ORM e sem
  driver externo.
- Testes com Vitest.
- Nenhuma dependência além dessas. Antes de instalar qualquer pacote,
  pergunte.

## Regras de toda sessão

- Termos do domínio em português, como a clínica os usa: `Consulta`,
  `Encaixe`, `Profissional`, `ListaDeEspera`. Nunca traduza para
  inglês nem use sinônimo (`Atendimento` no lugar de `Consulta`).
- Mensagem de erro exibida à recepção vem da spec, copiada
  literalmente.
- Regra de negócio mora no use case; o arquivo HTTP traduz o erro em
  status, não decide nada.
- Antes de criar arquivo novo, confira em `docs/convencoes.md` a
  pasta e o sufixo que ele deve ter.

## Comandos

- `npm test` roda a suíte inteira com Vitest.
- `npm run dev` sobe o servidor local na porta 3000.
