import { test, expect } from "vitest";

// Teste temporario: existe so para provar que `npm test` roda antes da
// primeira sessao de implementacao. A sessao 1 remove este arquivo.
test("a suite de testes executa", () => {
  expect(1 + 1).toBe(2);
});
