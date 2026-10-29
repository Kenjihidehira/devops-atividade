const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { createServer } = require("../server");

test("executa o fluxo CRUD completo", async t => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "taskflow-"));
  const server = createServer({ dataFile: path.join(directory, "tarefas.json") });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));

  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const health = await fetch(`${baseUrl}/api/health`);
  assert.equal(health.status, 200);

  const healthHead = await fetch(`${baseUrl}/api/health`, { method: "HEAD" });
  assert.equal(healthHead.status, 200);

  const createdResponse = await fetch(`${baseUrl}/api/tarefas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ titulo: "Criar pipeline", responsavel: "Wesley", prioridade: "alta" })
  });
  assert.equal(createdResponse.status, 201);
  const created = await createdResponse.json();

  const updatedResponse = await fetch(`${baseUrl}/api/tarefas/${created.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ concluida: true })
  });
  assert.equal((await updatedResponse.json()).concluida, true);

  const listResponse = await fetch(`${baseUrl}/api/tarefas`);
  assert.equal((await listResponse.json()).length, 1);

  const deletedResponse = await fetch(`${baseUrl}/api/tarefas/${created.id}`, { method: "DELETE" });
  assert.equal(deletedResponse.status, 204);
});

test("rejeita tarefa sem titulo", async t => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "taskflow-"));
  const server = createServer({ dataFile: path.join(directory, "tarefas.json") });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));

  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/tarefas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ responsavel: "Wesley", prioridade: "media" })
  });
  assert.equal(response.status, 400);
});

