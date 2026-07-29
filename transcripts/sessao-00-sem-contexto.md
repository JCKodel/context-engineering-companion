# Sessão 00: abrir a ferramenta sem pacote de contexto

Ferramenta: Claude Code 2.1.220 (Anthropic), modelo Sonnet 5
Data: 2026-07-29
Sessão: 00, anti-solução do capítulo 29
Técnica-alvo: nenhuma (é o cenário ingênuo, antes de qualquer técnica)
Reconstrução: não

Sessão real executada num diretório vazio, sem CLAUDE.md, sem spec e
sem convenções. O comando foi o modo não interativo do Claude Code,
com edição autorizada:

```console
$ mkdir sessao-00 && cd sessao-00
$ claude --print --model sonnet --permission-mode acceptEdits \
    "Implemente o agendamento da clínica."
```

## Turno 1: o pedido de sempre

**Prompt**: Implemente o agendamento da clínica.

A primeira coisa que a sessão faz é olhar em volta:

```console
$ ls -la
total 0
drwxr-xr-x@ 2 jckodel  wheel   64 Jul 29 02:39 .
drwx------@ 5 jckodel  wheel  160 Jul 29 02:39 ..
```

E a resposta não é código. É uma lista de perguntas:

```text
O diretório de trabalho está vazio. Não há nenhum projeto existente
para eu me basear. Como a instrução é bem genérica, preciso de mais
detalhes antes de começar a implementar. Algumas perguntas para
alinharmos o escopo:

1. Contexto do projeto: É um projeto novo do zero ou já existe um
   repositório/código em outro lugar que eu deveria usar?
2. Stack tecnológica: Qual linguagem/framework você quer usar?
   (ex.: Node.js + React, Python + Django, .NET, etc.) Banco de dados
   (Postgres, MySQL, SQLite, Supabase...)?
3. Escopo do "agendamento": O que essa funcionalidade deve cobrir?
   - Cadastro de profissionais/médicos e seus horários disponíveis?
   - Cadastro de pacientes?
   - Marcação/cancelamento/reagendamento de consultas?
   - Verificação de conflitos de horário e duração de cada tipo de
     consulta?
   - Notificações/lembretes (e-mail, SMS, WhatsApp)?
   - Múltiplas clínicas/unidades ou só uma?
[...]
6. Autenticação/perfis de acesso: Recepcionista, médico, paciente,
   admin, têm permissões diferentes?

Com essas respostas consigo montar um plano de implementação
adequado.
```

Custo do turno: 2 iterações, 14,5 segundos, 1.040 tokens de saída,
US$ 0,06. Linhas de código produzidas: zero.

## Turno 2: a resposta que todo mundo dá

**Prompt**: Não sei, faz do jeito que você achar melhor.

```text
Entendido. Vou implementar um módulo de agendamento de clínica como
uma API backend completa e testável, usando uma stack simples e
amplamente conhecida: Node.js + TypeScript + Express + Prisma
(SQLite). Vou cobrir o essencial: profissionais, pacientes, tipos de
consulta (com duração), disponibilidade semanal dos profissionais, e
criação/cancelamento/reagendamento de consultas com verificação de
conflitos de horário.

Vou montar o projeto agora.
```

A sessão então trabalha sozinha por 54 turnos:

```console
$ mkdir -p clinic-scheduling && cd clinic-scheduling && npm init -y
$ npm install express zod @prisma/client
$ npm install -D typescript ts-node-dev prisma @types/express @types/node jest ts-jest @types/jest supertest @types/supertest
[...]
$ npx prisma migrate dev --name init
$ npx jest
```

[...]

E entrega um projeto que funciona:

```text
Implementado: uma API de agendamento de clínica completa em
clinic-scheduling/ (Node.js + TypeScript + Express + Prisma/SQLite).

O que tem:
- Modelos: Patient, Professional, ServiceType (duração da consulta),
  Availability (horário semanal recorrente), Appointment (status
  SCHEDULED/CANCELLED/COMPLETED)
- Regras de negócio: só agenda dentro da disponibilidade do
  profissional, bloqueia sobreposição de horários, cancelar libera o
  slot, reagendar reaplica as mesmas validações
- Rotas REST para pacientes, profissionais, tipos de serviço,
  disponibilidade e consultas (criar/listar/cancelar/reagendar)
- 6 testes automatizados (Jest + supertest) cobrindo os cenários
  principais, todos passando
```

## O que veio na caixa

Estrutura de arquivos gerada:

```console
$ find . -path ./node_modules -prune -o -type f -name '*.ts' -print | sort
./src/app.ts
./src/db.ts
./src/errors.ts
./src/index.ts
./src/routes/appointments.ts
./src/routes/patients.ts
./src/routes/professionals.ts
./src/services/appointmentService.ts
./tests/appointments.test.ts
./tests/setup.ts
```

Dependências instaladas:

```json
"dependencies": {
  "@prisma/client": "^5.22.0",
  "express": "^5.2.1",
  "zod": "^4.4.3"
},
"devDependencies": {
  "@types/express": "^5.0.6",
  "@types/jest": "^30.0.0",
  "@types/node": "^26.1.2",
  "@types/supertest": "^7.2.1",
  "jest": "^30.4.2",
  "prisma": "^5.22.0",
  "supertest": "^7.2.2",
  "ts-jest": "^29.4.12",
  "ts-node-dev": "^2.0.0",
  "typescript": "^5.9.3"
}
```

Trecho do modelo de dados:

```prisma
model ServiceType {
  durationMinutes Int
}

// status: "SCHEDULED" | "CANCELLED" | "COMPLETED" (SQLite não suporta enum nativo)
model Appointment {
  status         String       @default("SCHEDULED")
}
```

## Custo total da sessão

| Turno | Iterações | Tempo | Tokens de saída | Custo |
|---|---|---|---|---|
| 1 | 2 | 14,5 s | 1.040 | US$ 0,06 |
| 2 | 54 | 330,5 s | 25.894 | US$ 1,34 |
| Total | 56 | 345 s | 26.934 | US$ 1,40 |

Cache lido no turno 2: 2.431.538 tokens.

## O que está errado

Nada aqui é bug: o código roda, os testes passam e o conflito de
horário funciona. O problema é que nada disso é o sistema da Clínica
Vila Nova.

- Nome do projeto e do domínio em inglês (`clinic-scheduling`,
  `Patient`, `Appointment`, `ServiceType`), contra a convenção de
  manter termo de domínio em português.
- `ServiceType.durationMinutes` deixa a duração configurável. Na
  clínica, o slot é fixo em 30 minutos.
- Não existe encaixe, não existe lista de espera e não existe
  bloqueio de agenda. As três regras que a recepção usa todo dia.
- Prisma, Express, Jest, zod e supertest entraram sem pergunta: cinco
  dependências que o projeto real não quer.
- `src/routes/` e `src/services/` organizam por camada técnica, não
  por feature.

A sessão acertou tudo que dava para acertar sozinha e errou tudo que
dependia de saber onde ela estava. É o argumento inteiro do capítulo
29 em US$ 1,40.
