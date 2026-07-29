import { expect, test } from "vitest";
import { app } from "./servidor.ts";

test("GET /saude responde com status ok", async () => {
  const resposta = await app.request("/saude");

  expect(resposta.status).toBe(200);
  expect(await resposta.json()).toEqual({ status: "ok" });
});
