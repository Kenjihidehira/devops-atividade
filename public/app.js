const form = document.querySelector("#task-form");
const fields = {
  id: document.querySelector("#task-id"),
  titulo: document.querySelector("#titulo"),
  responsavel: document.querySelector("#responsavel"),
  prioridade: document.querySelector("#prioridade")
};
let tasks = [];

async function request(url, options = {}) {
  const response = await fetch(url, { headers: { "Content-Type": "application/json" }, ...options });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.erro || "Não foi possível concluir a operação");
  }
  return response.status === 204 ? null : response.json();
}

function notify(message) {
  document.querySelector("#message").textContent = message;
  setTimeout(() => document.querySelector("#message").textContent = "", 2500);
}

function resetForm() {
  form.reset();
  fields.id.value = "";
  document.querySelector("#save").textContent = "Adicionar tarefa";
  document.querySelector("#cancel").classList.add("hidden");
}

function editTask(id) {
  const task = tasks.find(item => item.id === id);
  fields.id.value = task.id;
  fields.titulo.value = task.titulo;
  fields.responsavel.value = task.responsavel;
  fields.prioridade.value = task.prioridade;
  document.querySelector("#save").textContent = "Salvar alterações";
  document.querySelector("#cancel").classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function render() {
  document.querySelector("#total").textContent = tasks.length;
  const container = document.querySelector("#tasks");
  if (!tasks.length) {
    container.innerHTML = '<div class="empty">Nenhuma tarefa cadastrada. Comece pelo formulário acima.</div>';
    return;
  }
  container.innerHTML = tasks.map(task => `
    <article class="task ${task.concluida ? "done" : ""}">
      <input class="check" type="checkbox" ${task.concluida ? "checked" : ""} aria-label="Concluir ${escapeHtml(task.titulo)}" data-toggle="${task.id}">
      <div><h3>${escapeHtml(task.titulo)}</h3><p>${escapeHtml(task.responsavel)} · <span class="priority">${task.prioridade}</span></p></div>
      <div class="task-actions"><button class="secondary" data-edit="${task.id}">Editar</button><button class="danger" data-delete="${task.id}">Excluir</button></div>
    </article>`).join("");
}

function escapeHtml(value) {
  const element = document.createElement("div");
  element.textContent = value;
  return element.innerHTML;
}

async function loadTasks() {
  tasks = await request("/api/tarefas");
  render();
}

form.addEventListener("submit", async event => {
  event.preventDefault();
  const payload = { titulo: fields.titulo.value, responsavel: fields.responsavel.value, prioridade: fields.prioridade.value };
  try {
    if (fields.id.value) await request(`/api/tarefas/${fields.id.value}`, { method: "PUT", body: JSON.stringify(payload) });
    else await request("/api/tarefas", { method: "POST", body: JSON.stringify(payload) });
    notify(fields.id.value ? "Tarefa atualizada" : "Tarefa adicionada");
    resetForm();
    await loadTasks();
  } catch (error) { notify(error.message); }
});

document.querySelector("#cancel").addEventListener("click", resetForm);

document.querySelector("#tasks").addEventListener("click", async event => {
  const { edit, delete: deleteId } = event.target.dataset;
  if (edit) return editTask(edit);
  if (deleteId && confirm("Deseja excluir esta tarefa?")) {
    await request(`/api/tarefas/${deleteId}`, { method: "DELETE" });
    notify("Tarefa excluída");
    await loadTasks();
  }
});

document.querySelector("#tasks").addEventListener("change", async event => {
  const id = event.target.dataset.toggle;
  if (!id) return;
  await request(`/api/tarefas/${id}`, { method: "PUT", body: JSON.stringify({ concluida: event.target.checked }) });
  await loadTasks();
});

loadTasks().catch(error => notify(error.message));

