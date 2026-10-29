const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { randomUUID } = require("node:crypto");

const publicDir = path.join(__dirname, "public");
const defaultDataFile = path.join(__dirname, "data", "tarefas.json");

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

function ensureDataFile(dataFile) {
  fs.mkdirSync(path.dirname(dataFile), { recursive: true });
  if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, "[]\n", "utf8");
}

function readTasks(dataFile) {
  ensureDataFile(dataFile);
  return JSON.parse(fs.readFileSync(dataFile, "utf8"));
}

function writeTasks(dataFile, tasks) {
  const temporary = `${dataFile}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(tasks, null, 2)}\n`, "utf8");
  fs.renameSync(temporary, dataFile);
}

function sendJson(response, status, data) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(data));
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", chunk => {
      body += chunk;
      if (body.length > 100_000) reject(new Error("Corpo da requisicao muito grande"));
    });
    request.on("end", () => {
      try { resolve(JSON.parse(body || "{}")); }
      catch { reject(new Error("JSON invalido")); }
    });
    request.on("error", reject);
  });
}

function validateTask(input, partial = false) {
  const output = {};
  if (!partial || input.titulo !== undefined) {
    if (typeof input.titulo !== "string" || !input.titulo.trim()) throw new Error("Titulo e obrigatorio");
    output.titulo = input.titulo.trim().slice(0, 120);
  }
  if (!partial || input.responsavel !== undefined) {
    if (typeof input.responsavel !== "string" || !input.responsavel.trim()) throw new Error("Responsavel e obrigatorio");
    output.responsavel = input.responsavel.trim().slice(0, 80);
  }
  if (!partial || input.prioridade !== undefined) {
    const priorities = ["baixa", "media", "alta"];
    if (!priorities.includes(input.prioridade)) throw new Error("Prioridade invalida");
    output.prioridade = input.prioridade;
  }
  if (input.concluida !== undefined) output.concluida = Boolean(input.concluida);
  return output;
}

function serveStatic(response, pathname) {
  const requested = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const filePath = path.resolve(publicDir, requested);
  if (!filePath.startsWith(`${path.resolve(publicDir)}${path.sep}`) && filePath !== path.join(publicDir, "index.html")) {
    sendJson(response, 403, { erro: "Acesso negado" });
    return;
  }
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    sendJson(response, 404, { erro: "Recurso nao encontrado" });
    return;
  }
  response.writeHead(200, { "Content-Type": mimeTypes[path.extname(filePath)] || "application/octet-stream" });
  fs.createReadStream(filePath).pipe(response);
}

function createServer(options = {}) {
  const dataFile = options.dataFile || process.env.DATA_FILE || defaultDataFile;
  ensureDataFile(dataFile);

  return http.createServer(async (request, response) => {
    const url = new URL(request.url, "http://localhost");

    try {
      if (["GET", "HEAD"].includes(request.method) && url.pathname === "/api/health") {
        if (request.method === "HEAD") {
          response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
          return response.end();
        }
        return sendJson(response, 200, { status: "ok", servico: "taskflow" });
      }

      if (request.method === "GET" && url.pathname === "/api/tarefas") {
        return sendJson(response, 200, readTasks(dataFile));
      }

      if (request.method === "POST" && url.pathname === "/api/tarefas") {
        const input = validateTask(await readJsonBody(request));
        const tasks = readTasks(dataFile);
        const task = { id: randomUUID(), ...input, concluida: false, criadaEm: new Date().toISOString() };
        tasks.push(task);
        writeTasks(dataFile, tasks);
        return sendJson(response, 201, task);
      }

      const match = url.pathname.match(/^\/api\/tarefas\/([a-f0-9-]+)$/i);
      if (match && request.method === "PUT") {
        const tasks = readTasks(dataFile);
        const index = tasks.findIndex(task => task.id === match[1]);
        if (index < 0) return sendJson(response, 404, { erro: "Tarefa nao encontrada" });
        tasks[index] = { ...tasks[index], ...validateTask(await readJsonBody(request), true) };
        writeTasks(dataFile, tasks);
        return sendJson(response, 200, tasks[index]);
      }

      if (match && request.method === "DELETE") {
        const tasks = readTasks(dataFile);
        const remaining = tasks.filter(task => task.id !== match[1]);
        if (remaining.length === tasks.length) return sendJson(response, 404, { erro: "Tarefa nao encontrada" });
        writeTasks(dataFile, remaining);
        response.writeHead(204);
        return response.end();
      }

      if (url.pathname.startsWith("/api/")) return sendJson(response, 404, { erro: "Rota nao encontrada" });
      return serveStatic(response, url.pathname);
    } catch (error) {
      return sendJson(response, 400, { erro: error.message });
    }
  });
}

if (require.main === module) {
  const port = Number(process.env.PORT || 3000);
  createServer().listen(port, "0.0.0.0", () => {
    console.log(`TaskFlow disponivel em http://localhost:${port}`);
  });
}

module.exports = { createServer };

