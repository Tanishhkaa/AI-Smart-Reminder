const tasks = [];

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
    const badge = node.querySelector(".score-badge");
    badge.textContent = task.score;
    badge.classList.add(getPriorityLabel(task.score));
    taskList.appendChild(node);
  });

  updateInsights(sortedTasks);
}

function updateInsights(sortedTasks) {
  if (sortedTasks.length === 0) {
    nextAction.textContent = "Add tasks to receive a focused AI recommendation.";
    scheduleAdvice.textContent = "Your focused work blocks will appear here after you add tasks.";
    coachingAdvice.textContent = "The assistant will recommend next actions based on urgency, impact, and effort.";
    reminderAdvice.textContent = "Expect reminders that explain why a task matters and what to do first.";
    return;
  }

  const topTask = sortedTasks[0];
  const quickWin = sortedTasks.find((task) => Number(task.effort) <= 2) || topTask;
  const highImpact = sortedTasks.find((task) => Number(task.impact) >= 4) || topTask;

  nextAction.textContent = `Start “${topTask.title}” now. It has the highest priority score because its deadline, impact, and context make it risky to delay.`;
  scheduleAdvice.textContent = `Block ${getScheduleWindow(topTask)}. Then reserve a shorter recovery block for “${quickWin.title}” to keep momentum high.`;
  coachingAdvice.textContent = `Use a first-step rule: spend five minutes defining the next visible deliverable for “${highImpact.title},” then work in one uninterrupted sprint.`;
  reminderAdvice.textContent = `Reminder copy: “${topTask.title} matters because it is a ${topTask.context.toLowerCase()} commitment. Open the task and complete the first concrete step now.”`;
}

function addTask(task) {
  tasks.push({ id: crypto.randomUUID(), ...task });
  renderTasks();
}

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
