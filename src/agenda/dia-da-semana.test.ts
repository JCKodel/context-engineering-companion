import { expect, test } from "vitest";
import { diaDaSemana } from "./dia-da-semana.ts";

test("2026-08-04 é terça", () => {
  expect(diaDaSemana("2026-08-04")).toBe(2);
});

test("2026-08-01 é sábado", () => {
  expect(diaDaSemana("2026-08-01")).toBe(6);
});

test("2026-08-02 é domingo", () => {
  expect(diaDaSemana("2026-08-02")).toBe(0);
});
