# Mapa do sistema antigo

Levantado em 2026-07-29 sobre o repositório reconstruído da clínica.
Cada linha aponta a evidência; `[?]` marca hipótese.

## Arquivos e assuntos

| Arquivo | Assunto | Fala com |
|---|---|---|
| `db.js` | pool MySQL e `query` | todos |
| `src/agenda.js` | gera os slots do dia a partir da grade | `db` |
| `src/consulta.js` | marca consulta | `db`, `agenda`, `bloqueio` |
| `src/encaixe.js` | cria encaixe do dia | `db`, `utils`, `bloqueio` |
| `src/bloqueio.js` | diz se a agenda está bloqueada | `db` |
| `src/lembrete.js` | monta e dispara o lembrete | `db`, `whatsapp`, `utils` |
| `src/whatsapp.js` | POST para a API de mensagens | `https` |
| `src/relatorio.js` | conta consultas do mês | `db` |
| `src/utils.js` | data de hoje e hora legível | nada |

## Onde a manutenção dói

```console
$ git log --format= --name-only | sort | uniq -c | sort -rn | head -3
   5 src/encaixe.js
   3 src/lembrete.js
   3 src/consulta.js
```

O encaixe concentra a manutenção e é por onde qualquer leitura nova
começa.

## Tabelas que o código usa

`grade` (prof_id, dia_semana, inicio, fim), `consulta` (prof_id, dia,
inicio, fim, paciente_id), `encaixe` (prof_id, dia, duracao,
paciente_id, motivo, criado_por), `bloqueio` (prof_id, inicio, fim,
motivo) e `paciente` (id, telefone). Todas deduzidas das queries; não
há arquivo de esquema no repositório. `[?]` sobre colunas que
nenhuma query toca.

## Fluxos verificados

1. Marcar consulta (`src/consulta.js:5`): checa bloqueio, gera os
   slots do dia, exige que o início bata com um slot, recusa se já
   existe consulta no mesmo profissional, dia e início, e insere com
   fim igual a início mais 30.
2. Criar encaixe (`src/encaixe.js:5`): usa o dia corrente, checa
   bloqueio, conta os encaixes do profissional no dia, recusa a
   partir de 2, exige motivo e usuária, e insere com duração 15.
3. Lembrete (`src/lembrete.js:5`): busca dia, início e telefone da
   consulta e manda pelo WhatsApp o texto "Clinica Vila Nova.
   Lembrete: consulta amanha as HH:MM". Isso confirma a hipótese que
   os nomes dos arquivos sugeriam.

## Decisão fossilizada no histórico

```console
$ git log --date=short --format='%h %ad %an  %s' -- src/encaixe.js
34c2def 2024-05-29 Paulo Tanaka  fix urgente producao
46564fd 2022-08-04 Paulo Tanaka  encaixe nao pode com agenda bloqueada
a78a0b9 2021-01-15 Marcia Lima  muda limite encaixe pra 2 (dra cecilia)
8a15586 2020-04-10 Renato Alves  fix encaixe
eb5f752 2020-04-02 Renato Alves  encaixe
```

O limite de encaixes nasceu 3 e foi reduzido para 2 em 2021 a pedido
de uma dra. Cecília. O motivo além da mensagem não está registrado em
lugar nenhum.
