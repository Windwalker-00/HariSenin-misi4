const form = document.getElementById("taskForm");
const textInput = document.getElementById("taskText");
const priorityInput = document.getElementById("priority");
const deadlineInput = document.getElementById("deadline");
const todoList = document.getElementById("todoList");
const doneList = document.getElementById("doneList");
const deleteAllBtn = document.getElementById("deleteAll");

let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");

const hari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const bulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli",
  "Agustus", "September", "Oktober", "November", "Desember"];

function formatTanggal(d) {
  return `${hari[d.getDay()]}, ${d.getDate()} ${bulan[d.getMonth()]} ${d.getFullYear()}`;
}

function updateClock() {
  const now = new Date();
  document.getElementById("day").textContent = hari[now.getDay()];
  document.getElementById("date").textContent =
    `${now.getDate()} ${bulan[now.getMonth()]} ${now.getFullYear()}`;
}

function save() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function isLate(task) {
  if (task.done || !task.deadline) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(task.deadline + "T00:00:00") < today;
}

function createItem(task) {
  const li = document.createElement("li");
  li.className = `${task.priority}${task.done ? " done" : ""}${isLate(task) ? " late" : ""}`;

  const check = document.createElement("input");
  check.type = "checkbox";
  check.checked = task.done;
  check.setAttribute("aria-label", "Tandai selesai");
  check.addEventListener("change", () => toggleTask(task.id));

  const body = document.createElement("div");
  const text = document.createElement("p");
  text.className = "text";
  text.textContent = task.text;

  const meta = document.createElement("p");
  meta.className = "meta";
  meta.textContent = `Prioritas: ${task.priority} • Dibuat: ${formatTanggal(new Date(task.createdAt))}`;
  if (task.deadline) {
    meta.textContent += ` • Tenggat: ${formatTanggal(new Date(task.deadline + "T00:00:00"))}`;
  }
  if (isLate(task)) {
    const tag = document.createElement("span");
    tag.className = "late-tag";
    tag.textContent = " • Terlambat";
    meta.appendChild(tag);
  }
  body.append(text, meta);

  const del = document.createElement("button");
  del.className = "del";
  del.type = "button";
  del.textContent = "Delete";
  del.addEventListener("click", () => deleteTask(task.id));

  li.append(check, body, del);
  return li;
}

function fillList(listEl, items, emptyText) {
  listEl.innerHTML = "";
  if (items.length === 0) {
    const li = document.createElement("li");
    li.className = "empty";
    li.textContent = emptyText;
    li.style.display = "block";
    listEl.appendChild(li);
    return;
  }
  items.forEach(t => listEl.appendChild(createItem(t)));
}

function render() {
  fillList(todoList, tasks.filter(t => !t.done), "Belum ada tugas. Tulis satu di atas.");
  fillList(doneList, tasks.filter(t => t.done), "Belum ada tugas yang selesai.");
}

function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  task.done = !task.done;
  save();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  save();
  render();
}

form.addEventListener("submit", e => {
  e.preventDefault();
  const text = textInput.value.trim();
  if (!text) return;
  tasks.push({
    id: Date.now(),
    text,
    priority: priorityInput.value,
    deadline: deadlineInput.value,
    createdAt: new Date().toISOString(),
    done: false
  });
  save();
  render();
  form.reset();
});

deleteAllBtn.addEventListener("click", () => {
  if (tasks.length === 0) return;
  if (confirm("Hapus seluruh to do list?")) {
    tasks = [];
    save();
    render();
  }
});

updateClock();
setInterval(updateClock, 60000);
render();
