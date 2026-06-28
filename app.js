const STORAGE_KEY = "ai-smart-reminder-tasks";
let tasks = loadTasks();

const taskForm = document.querySelector("#taskForm");
const taskList = document.querySelector("#taskList");
const taskTemplate = document.querySelector("#taskTemplate");
const nextAction = document.querySelector("#nextAction");
const scheduleAdvice = document.querySelector("#scheduleAdvice");
const coachingAdvice = document.querySelector("#coachingAdvice");
const reminderAdvice = document.querySelector("#reminderAdvice");
const seedTasks = document.querySelector("#seedTasks");
const deadlineInput = document.querySelector("#deadline");

const formatDate = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

function loadTasks() {
  const savedTasks = localStorage.getItem(STORAGE_KEY);
  return savedTasks ? JSON.parse(savedTasks) : [];
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function createTaskId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function setDefaultDeadline() {
  const tomorrowMorning = new Date();
  tomorrowMorning.setDate(tomorrowMorning.getDate() + 1);
  tomorrowMorning.setHours(9, 0, 0, 0);
  deadlineInput.value = tomorrowMorning.toISOString().slice(0, 16);
}

function calculatePriority(task, now = new Date()) {
  const deadline = new Date(task.deadline);
  const hoursLeft = Math.max((deadline - now) / 36e5, 0.25);
  const urgency = Math.min(60, Math.round(60 / hoursLeft));
  const impact = Number(task.impact) * 10;
  const effortPenalty = Number(task.effort) * 3;
  const contextBoost = ["Finance", "Interview", "Work"].includes(task.context) ? 8 : 0;

  return Math.max(1, Math.min(100, urgency + impact + contextBoost - effortPenalty));
}

function getPriorityLabel(score) {
  if (score >= 70) return "urgent";
  if (score >= 45) return "high";
  return "steady";
}

function getSortedTasks() {
  return [...tasks]
    .map((task) => ({ ...task, score: calculatePriority(task) }))
    .sort((a, b) => b.score - a.score);
}

function getScheduleWindow(task) {
  const effortMinutes = Number(task.effort) * 30;
  return `${effortMinutes} focused minutes before ${formatDate.format(new Date(task.deadline))}`;
}

function renderTasks() {
  const sortedTasks = getSortedTasks();
  taskList.innerHTML = "";

  if (sortedTasks.length === 0) {
    taskList.innerHTML = `<p class="task-meta">No tasks yet. Add one commitment to generate an action plan.</p>`;
    updateInsights([]);
    return;
  }

  sortedTasks.forEach((task) => {
    const node = taskTemplate.content.cloneNode(true);
    node.querySelector(".task-context").textContent = task.context;
    node.querySelector("h3").textContent = task.title;
    node.querySelector(".task-meta").textContent = `${getScheduleWindow(task)} • Impact ${task.impact}/5 • Effort ${task.effort}/4`;
    const card = node.querySelector(".task-card");
    if (task.done) card.classList.add("completed");
    const completeButton = node.querySelector(".complete-task");
    completeButton.textContent = task.done ? "Undo" : "Done";
    completeButton.dataset.id = task.id;
    node.querySelector(".delete-task").dataset.id = task.id;
    const badge = node.querySelector(".score-badge");
    badge.textContent = task.score;
    badge.classList.add(getPriorityLabel(task.score));
    taskList.appendChild(node);
  });

  updateInsights(sortedTasks);
}

function updateInsights(sortedTasks) {
  const activeTasks = sortedTasks.filter((task) => !task.done);

  if (activeTasks.length === 0) {
    const message = sortedTasks.length === 0
      ? "Add tasks to receive a focused AI recommendation."
      : "Great work — all current tasks are complete. Add another commitment when you are ready.";
    nextAction.textContent = message;
    scheduleAdvice.textContent = sortedTasks.length === 0
      ? "Your focused work blocks will appear here after you add tasks."
      : "No active work blocks are needed right now.";
    coachingAdvice.textContent = sortedTasks.length === 0
      ? "The assistant will recommend next actions based on urgency, impact, and effort."
      : "Review your completed list, then add the next meaningful goal.";
    reminderAdvice.textContent = sortedTasks.length === 0
      ? "Expect reminders that explain why a task matters and what to do first."
      : "Reminders are paused because there are no active tasks.";
    return;
  }

  const topTask = activeTasks[0];
  const quickWin = activeTasks.find((task) => Number(task.effort) <= 2) || topTask;
  const highImpact = activeTasks.find((task) => Number(task.impact) >= 4) || topTask;

  nextAction.textContent = `Start “${topTask.title}” now. It has the highest priority score because its deadline, impact, and context make it risky to delay.`;
  scheduleAdvice.textContent = `Block ${getScheduleWindow(topTask)}. Then reserve a shorter recovery block for “${quickWin.title}” to keep momentum high.`;
  coachingAdvice.textContent = `Use a first-step rule: spend five minutes defining the next visible deliverable for “${highImpact.title},” then work in one uninterrupted sprint.`;
  reminderAdvice.textContent = `Reminder copy: “${topTask.title} matters because it is a ${topTask.context.toLowerCase()} commitment. Open the task and complete the first concrete step now.”`;
}

function addTask(task) {
  tasks.push({ id: createTaskId(), done: false, ...task });
  saveTasks();
  renderTasks();
}

function toggleTask(id) {
  tasks = tasks.map((task) => (task.id === id ? { ...task, done: !task.done } : task));
  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
  renderTasks();
}

taskList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-id]");
  if (!button) return;

  if (button.classList.contains("complete-task")) toggleTask(button.dataset.id);
  if (button.classList.contains("delete-task")) deleteTask(button.dataset.id);
});

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(taskForm);
  addTask(Object.fromEntries(formData.entries()));
  taskForm.reset();
  setDefaultDeadline();
});

seedTasks.addEventListener("click", () => {
  const now = new Date();
  const examples = [
    ["Submit scholarship essay", 18, 5, 3, "Study"],
    ["Pay credit card bill", 8, 4, 1, "Finance"],
    ["Prepare interview stories", 30, 5, 2, "Interview"],
  ];

  examples.forEach(([title, hoursFromNow, impact, effort, context]) => {
    const deadline = new Date(now.getTime() + hoursFromNow * 36e5).toISOString().slice(0, 16);
    addTask({ title, deadline, impact: String(impact), effort: String(effort), context });
  });
});

setDefaultDeadline();
renderTasks();
