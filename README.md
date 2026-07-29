# AgendaVila

Este repositório é material de apoio do livro **Context Engineering**
(J. C. Ködel). Ele guarda o código, os pacotes de contexto e os
transcritos das sessões do estudo de caso da Parte V.

O AgendaVila é o sistema de agendamento da **Clínica Vila Nova**, uma
clínica fictícia: profissionais com grade semanal, consultas em slots
de 30 minutos e lista de espera com encaixe automático no
cancelamento. A clínica, os pacientes, o sistema legado e os nomes que
aparecem aqui foram inventados para o livro. Qualquer semelhança com
uma clínica real é coincidência.

## Para que serve

O livro se lê inteiro sem abrir este repositório. Nada aqui é
necessário para entender qualquer capítulo: os artefatos que importam
estão impressos nas páginas, e o que está aqui é a versão completa
deles, para quem quiser rodar, ler o diff ou repetir o exercício.

Os capítulos que citam este código:

- **29. Preparando um projeto (do zero e um legado)** — o pacote de
  contexto inicial: `CLAUDE.md`, `docs/spec-agendamento.md`,
  `docs/convencoes.md`.
- **30. Implementação completa guiada por IA** — as cinco sessões que
  construíram `src/`, em `transcripts/sessao-NN-*.md`.
- **31. Post-mortem: onde o contexto falhou e como foi recuperado** —
  `transcripts/falhas.md` e as notas de recuperação.

## O que tem aqui

| Pasta | Conteúdo |
|---|---|
| `src/` | O sistema, uma pasta por feature |
| `docs/` | Spec, convenções e decisões: o contexto que as sessões liam |
| `transcripts/` | Uma sessão por arquivo, com prompts, custo e falhas |

Vale olhar `docs/decisoes.md` mesmo sem rodar nada: é o arquivo que a
Parte V argumenta ser o mais difícil de reconstruir depois, e o
capítulo 31 mostra o que aconteceu quando ele ainda não existia.

## Rodando

Precisa de Node.js 24 ou superior, que roda os arquivos `.ts` direto,
sem passo de build.

```bash
npm install
npm test          # suíte completa com Vitest
npm run dev       # servidor em http://localhost:3000
```

A stack inteira é TypeScript, Hono, `node:sqlite` e Vitest. Não há
ORM, nem injeção de dependência, nem dependência além dessas: a
escolha está explicada no `CLAUDE.md`, e ela existe para que o código
do estudo de caso caiba na cabeça de quem está lendo sobre outra
coisa.

## Sobre as sessões

Todas as sessões rodaram com Claude Code 2.1.220 sobre o modelo Sonnet
5, em 29 de julho de 2026. Os transcritos trazem os prompts como foram
enviados, o custo em dólares e em iterações, e o que deu errado. O
registro de falhas é `transcripts/falhas.md`, e ele é honesto: uma
delas foi encontrada só na auditoria final, depois de cinco sessões
passarem por cima dela.
