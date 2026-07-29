# Convenções do AgendaVila

**Dona**: equipe de agendamento

Regras que valem para todo código novo. O que uma ferramenta verifica
sozinha não mora aqui.

## Organização

- Uma pasta por feature dentro de `src/`: `agenda/`, `profissionais/`,
  `encaixes/`. O critério da pasta é o eixo de mudança, não a camada
  técnica.
- Dentro da feature, os arquivos ficam soltos. Subpasta técnica
  (`dominio/`, `infra/`, `usecases/`) é proibida; o que crescer demais
  vira feature nova, nunca camada.
- `compartilhado/` só nasce quando o mesmo código se provar necessário
  em duas features. Antes disso, duplicar é mais barato que abstrair
  cedo.

## Papéis no nome do arquivo

O papel de cada arquivo aparece no sufixo:

- `*.usecase.ts`: o único lugar onde mora regra de negócio, por
  exemplo `marcar-consulta.usecase.ts`.
- `*.repositorio.ts`: a única fronteira de entrada e saída, por
  exemplo `consultas.repositorio.ts`. Nenhum outro arquivo fala com o
  banco.
- `*.http.ts`: a borda web da feature, por exemplo `agenda.http.ts`.
  Recebe requisição, chama o use case e traduz o resultado em status.
- `*.test.ts`: teste, ao lado do arquivo que testa. Não existe pasta
  de testes separada.

## Fronteira entre features

Feature fala com feature pela porta da frente: o use case público da
outra feature, importado pelo caminho da pasta dela. Importar arquivo
interno de outra feature é proibido, e é o primeiro sinal de que a
fronteira está errada.

## Abstração

Interface com implementação única é proibida. A abstração nasce
quando a segunda implementação real aparece. A exceção é o
repositório, cujo dublê de teste conta como segunda implementação.

## Testes

- O nome do teste descreve a regra de negócio: "recusa consulta em
  horário ocupado", não "testa marcarConsulta".
- Use case é testado contra o dublê do repositório, sem banco.
- Toda regra de negócio da spec tem teste; toda mensagem de erro
  testada é comparada com a string literal da spec.

## Commits

Mensagem no imperativo, em português, uma mudança lógica por commit:
"Recusa consulta fora da grade do profissional".
