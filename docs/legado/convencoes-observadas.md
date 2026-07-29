# Convenções observadas no sistema antigo

Ninguém combinou estas regras: elas foram lidas do código em
2026-07-29 e valem como imitação, para que o que a sessão escrever
não destoe do que já existe. Cada uma cita onde foi observada.

- Assíncrono por callback com erro primeiro, sempre. Nenhuma Promise
  no repositório (`src/consulta.js:5`, `src/encaixe.js:5`).
- `var` e `function` clássicas; nada de `let`, `const` ou arrow
  (`src/agenda.js:7`).
- Exportação por `module.exports` com objeto literal no fim do
  arquivo (`src/utils.js:12`).
- Todo acesso a banco passa por `db.query` com SQL escrito à mão e
  parâmetros posicionais (`src/relatorio.js:4`). Não existe camada
  de modelo.
- Erro de regra de negócio vira `new Error` com string curta em
  minúsculas: `'ocupado'`, `'limite de encaixe'`, `'sem motivo'`
  (`src/consulta.js:19`, `src/encaixe.js:13`).
- Horário é inteiro em minutos; formatação só na borda
  (`src/utils.js:6`).
- Nome de tabela e de coluna em português com underscore
  (`prof_id`, `dia_semana`, `criado_por`).
- Configuração vem de variável de ambiente sem valor padrão para
  senha e host de integração (`db.js:6`, `src/whatsapp.js:6`).

## O que o código não faz e a sessão não deve inventar

- Não há teste no repositório, então nenhuma mudança é validada
  automaticamente.
- Não há validação de entrada além do que está escrito no fluxo.
- Não há tratamento de fuso horário em lugar nenhum.
