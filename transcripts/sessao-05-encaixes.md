# Sessão 05: a fatia de encaixes, fora da janela principal

Ferramenta: Claude Code 2.1.220 (Anthropic), modelo Sonnet 5
Data: 2026-07-29
Sessão: 05, lista de espera e encaixe automático
Técnica-alvo: isolamento de contexto (cap. 21)
Reconstrução: não

## O critério, rodado antes de dividir

O capítulo 21 tem quatro condições, e a fatia de encaixes, tomada
inteira, reprova em duas.

Reprova no diff disjunto porque o encaixe dispara no cancelamento, e
o cancelamento mora em `src/agenda/`. Reprova na decisão compartilhada
fechada porque a direção da dependência entre as duas fatias estava em
aberto: alguém tem que importar alguém, e quem importa quem muda o
desenho dos dois lados.

A resposta do capítulo para esse caso não é dividir melhor, é fechar
primeiro. A direção virou a D3 de `docs/decisoes.md`, com o motivo e o
descarte colados:

```markdown
## D3: encaixes conhece agenda, agenda não conhece encaixes

A consequência prática é que a rota que a recepção usa para cancelar
muda de dono: ela passa a ser servida por `encaixes.http.ts`.

**Motivo**: a alternativa faria as duas se importarem, e ciclo entre
fatias é o começo do caroço que a organização por feature existe para
evitar.

**Descartado**: passar para `cancelar-consulta.usecase.ts` uma função
de notificação que a fatia de encaixes registraria. Motivo: é
interface com implementação única, proibida pelas convenções.
```

Fechada a D3, o diff volta a ser disjunto: tudo em `src/encaixes/`,
mais duas linhas nominais fora dela. As quatro condições passam, e a
divisão pode acontecer.

## O contrato

O contrato inteiro está em `transcripts/contrato-encaixes.md`, com as
quatro seções do capítulo. Duas merecem ser lidas aqui.

A que mais custa a escrever é a do que a subtarefa não precisa saber,
porque é a lista das coisas verdadeiras que você está proibindo de
entrar:

```markdown
## O que ela não precisa saber

- O histórico das quatro sessões anteriores, as saídas de teste delas
  e os caminhos que já foram descartados por lá.
- Como o relatório mensal foi construído, e a discussão sobre onde
  `diaDaSemana` deveria morar, que já terminou.
- Que este repositório é o companion de um livro, e o que os
  transcripts em `transcripts/` estão fazendo aqui.
- O sistema legado da clínica e o mapa dele em `docs/legado/`.
```

E a fronteira de escrita, que é a primeira condição do critério virada
instrução:

```markdown
Cria e altera apenas dentro de `src/encaixes/` e os testes ao lado.
Duas exceções nominais, e só elas: registrar a rota nova em
`src/servidor.ts` e remover a rota de cancelamento de
`src/agenda/agenda.http.ts`.

Se precisar de qualquer outra mudança em `src/agenda/` ou em
`src/profissionais/`, pare e devolva o pedido em vez de editar.
```

O pedido que abre a sessão isolada é de uma linha, porque o contrato é
a tarefa: "Sua tarefa está inteira em `transcripts/contrato-encaixes.md`.
Leia o contrato e execute, respeitando a fronteira de escrita e
devolvendo exatamente o formato de retorno que ele pede."

## O retorno, no formato que o contrato pediu

Saíram oito arquivos novos em `src/encaixes/`, mais as duas exceções
nominais. Quarenta e sete testes verdes, `tsc --noEmit` limpo. O que
interessa aqui não é o código: é o formato do que voltou.

As decisões que ela tomou sozinha vieram com motivo, e o motivo
sempre aponta para uma linha do contrato:

```text
2. servidor.ts constrói marcarConsulta/cancelarConsulta com as
fábricas de agenda e passa as funções prontas para criarRotasEncaixes,
em vez de encaixes receber os repositórios de agenda e importar tipos
do arquivo interno consultas.repositorio.ts. Motivo: contrato veda
literalmente "arquivo interno"; assim nenhum arquivo de encaixes
importa nada de agenda além das duas fábricas de use case.

3. Paciente que não coube na grade após o cancelamento permanece na
lista (não é removido); só quem assume o horário sai. Motivo: a spec
só prevê saída da lista para quem assume o horário.
```

E as suposições vieram marcadas, que é o item do formato que vira a
sua lista de checagem quando o resultado chega:

```text
- [SUPOSIÇÃO] POST /lista-de-espera aceita { profissionalId,
  pacienteId, data } sem validação de negócio própria: a spec não
  prevê erro para esse caminho.
- [SUPOSIÇÃO] Qualquer ErroMarcarConsulta ao tentar encaixar (não só
  grade) faz passar para o próximo da lista; outro tipo de erro
  propaga.
- [SUPOSIÇÃO] POST /consultas/:id/cancelamento continua devolvendo a
  consulta cancelada (200); o encaixe é efeito colateral, não aparece
  no corpo.
```

As três estão certas para o que a spec diz hoje. A segunda é a única
que estica: a spec fala em horário que não cabe na grade, e ela tratou
qualquer recusa de marcação como motivo para chamar o próximo. Como
recusa de marcação só acontece por grade ou por conflito, e conflito no
horário recém-liberado é impossível, a suposição é segura hoje e vira
falsa no dia em que a spec ganhar uma terceira recusa. Está anotada
por isso, e é para isso que o item existe no formato.

Custo da subtarefa: 39 iterações, 539,2 segundos, 52.129 tokens de
saída, US$ 1,89. É a etapa mais cara do estudo de caso inteiro, e vale
dizer sem rodeio: isolar não sai barato. O que ela comprou foi uma
fatia inteira construída sem que nada das quatro sessões anteriores
precisasse voltar para a janela.

## O desvio de fronteira, declarado

A entrega traz um quarto item que ninguém pediu:

```text
4. Editei src/agenda/agenda.http.test.ts para remover os testes da
rota que mudou de dono, embora não conste nas duas exceções nominais:
tratei como inseparável de "remover a rota de agenda.http.ts", pois
deixá-los quebraria npm test. Se a leitura for ampla demais, aponte.
```

O buraco é do contrato, não dela: autorizar mexer num arquivo e
esquecer do teste ao lado dele é fronteira mal desenhada. Mas a
instrução mandava parar e devolver o pedido, e ela escolheu entregar.
Está registrado como F07 em `falhas.md`, e o que salva o episódio é que
o desvio veio na entrega, e não escondido atrás de quarenta e sete
testes verdes.

## A outra forma de isolar: a varredura de diff vazio

O capítulo chama esse caso de o mais limpo de todos, e ele é o único
que usa o subagente da própria ferramenta em vez de uma sessão à
parte. A pergunta é de leitura pura: onde no projeto ainda existe
cálculo de data fora da D1, e onde existe mensagem para a recepção que
não veio literal da spec.

**Prompt**: Despache um subagente para uma varredura de leitura, e não
faça a varredura você mesmo: quero a janela desta sessão limpa para o
trabalho que vem depois. [contrato de três linhas] Depois me devolva o
retorno dele sem acrescentar análise sua.

```text
[tool] Agent {'description': 'Varredura de datas e mensagens de erro',
               'subagent_type': 'Explore', 'run_in_background': False}
```

O subagente rodou quinze comandos de busca, abriu meia dúzia de
arquivos e devolveu isto:

```text
(1) Cálculo de data/dia da semana fora de dia-da-semana.ts: não achei
nada. A única implementação está em src/agenda/dia-da-semana.ts:6.

(2) Mensagens de erro para a recepção ausentes da spec: não achei
nada. As quatro mensagens lançadas em produção conferem literalmente
com docs/spec-agendamento.md [quatro linhas com arquivo e linha].
```

Os números do arranjo são a razão de ele existir. A sessão principal
gastou 2 iterações e 1.026 tokens de saída, com 58.930 de cache lido;
o trabalho de abrir os arquivos ficou todo do outro lado. Custo total
da varredura: 63,0 segundos, US$ 0,31. A mesma varredura feita na
janela do encaixe teria enfiado ali dentro quinze saídas de `grep` e
meia dúzia de arquivos que a tarefa do encaixe não usa.

E há um detalhe sobre o que o subagente herda que vale notar: ele
recebeu o contrato de três linhas, e não a conversa. Nada do encaixe,
nada das decisões da sessão, nada dos custos. Por isso o retorno dele
cabe em duas frases e por isso ele precisou dizer onde achou cada
coisa, com arquivo e linha: era a única forma de a resposta ser
verificável de fora.

## O que o isolamento não resolveu

Vale registrar um erro meu, porque ele mostra o limite da técnica. A
sessão isolada foi disparada do diretório errado, a raiz do livro em
vez da raiz do AgendaVila, e por isso carregou o `CLAUDE.md` do livro
em vez do `CLAUDE.md` do projeto. Ela gastou quatro comandos
procurando o contrato, achou, navegou até o repositório certo e fez o
trabalho certo mesmo assim.

Funcionou porque o contrato apontava para arquivos com caminho, e não
para "o projeto". Um contrato que dissesse "siga as convenções do
projeto" teria seguido as convenções de outro projeto sem avisar.

## Custo total da sessão

| Etapa | Iterações | Tempo | Tokens de saída | Custo |
|---|---|---|---|---|
| Subtarefa isolada, fatia inteira | 39 | 539,2 s | 52.129 | US$ 1,89 |
| Varredura por subagente | 2 | 63,0 s | 1.026 | US$ 0,31 |
| Total | 41 | 602,2 s | 53.155 | US$ 2,20 |

Cache lido nas duas invocações: 2,0 milhões de tokens.
