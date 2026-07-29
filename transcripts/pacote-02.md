## Abre o pacote: o que não pode ser violado (camada 1)

- Regra de negócio mora no use case. O arquivo HTTP traduz erro em
  status e não decide nada.
- Uma pasta por feature. Esta tarefa inteira acontece dentro de
  `src/profissionais/`, sem subpasta técnica.
- Mensagem de erro exibida à recepção é copiada literalmente da spec.
- Nenhuma dependência nova.

## Meio do pacote: o material da tarefa (camada 2)

- O que construir: a fatia `profissionais`, com cadastro e grade
  semanal, conforme a seção "Profissionais" de `docs/spec-agendamento.md`.
- Persistência: esta é a primeira feature com banco, então o
  repositório de profissionais nasce aqui, dentro da fatia, usando
  `node:sqlite`.
- Formato de horário herdado: o sistema antigo guarda a grade na
  tabela `grade`, com `prof_id`, `dia_semana`, `inicio` e `fim`, e
  horário é inteiro em minutos desde a meia-noite
  (`docs/legado/mapa-do-codigo.md`). A carga inicial vem de lá, então
  mantenha esse formato dentro do sistema novo.
- O que NÃO construir agora: consulta, cancelamento, lista de espera e
  encaixe. Cada um entra em sessão própria.
- Onde o diff acontece: arquivos novos em `src/profissionais/` e a
  rota registrada em `src/servidor.ts`.
- Teto do pacote: se precisar de qualquer arquivo que não está aqui,
  peça antes de supor.

## Fecha o pacote: o pedido (camada 4)

Antes de escrever qualquer arquivo, me diga em até cinco linhas o que
você entendeu que o sistema faz hoje nesta área: o que é a grade, que
regras ela impõe e o que já existe no repositório para você reusar.

Depois implemente a fatia com os testes das regras da spec, rode
`npm test` e me mostre a saída.
