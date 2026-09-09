// src/js/main.js — Adventures of GitHub with AI: The Field Log
//
// Three small features, no frameworks:
//   1) Time-of-day entry line + a rotating "Git tip for today"
//   2) 25-minute focus stopwatch with a hand-drawn progress ring
//   3) A checklist that persists (completed state included) in localStorage
//
// Everything targets the ids/classes in src/index.html.

/* ---------- Feature 1: greeting + git tip ---------- */
const GREETINGS = [
  "Good morning — the log is open. Start with a commit.",   // 05–11
  "Good afternoon — plenty of daylight left for branching.", // 12–17
  "Good evening — wind down, then stash your notes.",        // 18–21
  "Night watch — careful commits in the quiet hours.",       // 22–04
];

const GIT_TIPS = [
  "Stage in reviewable hunks: `git add -p`.",
  "Create and switch in one move: `git switch -c <branch>`.",
  "Half-done work? `git stash`, then `git stash pop` to recover it.",
  "Discard one file: `git restore <file>`.",
  "Keep secrets out of the repo with a `.gitignore`.",
  "A good subject line is under 50 characters and finishes the sentence.",
  "Keep history straight by pulling with `--rebase`.",
  "Mark a release with `git tag v1.0` and `git push --tags`.",
];

function hourGreeting(h) {
  if (h >= 5 && h < 12) return GREETINGS[0];
  if (h >= 12 && h < 18) return GREETINGS[1];
  if (h >= 18 && h < 22) return GREETINGS[2];
  return GREETINGS[3];
}

function tipOfTheDay() {
  const day = Math.floor(Date.now() / 86400000);
  return GIT_TIPS[day % GIT_TIPS.length];
}

function initGreeting() {
  const g = document.getElementById("greeting");
  const t = document.getElementById("git-tip");
  const now = new Date();
  if (g) g.textContent = hourGreeting(now.getHours()) + " Entry logged: " + now.toDateString();
  if (t) t.textContent = "Git tip for today — " + tipOfTheDay();
}

/* ---------- Feature 2: stopwatch with progress ring ---------- */
const WORK_SECONDS = 25 * 60;
const RING_R = 52;
const RING_C = 2 * Math.PI * RING_R;

let secondsLeft = WORK_SECONDS;
let timerId = null;

function pad(n) { return String(n).padStart(2, "0"); }
function fmt(sec) {
  const total = Math.max(0, Math.floor(sec));
  return pad(Math.floor(total / 60)) + ":" + pad(total % 60);
}

function initTimer() {
  const display = document.getElementById("timer");
  const ring = document.getElementById("ring-progress");
  const startBtn = document.getElementById("start");
  const resetBtn = document.getElementById("reset");
  if (!display || !ring || !startBtn || !resetBtn) return;

  ring.style.strokeDasharray = String(RING_C);

  const draw = () => {
    display.textContent = fmt(secondsLeft);
    const frac = secondsLeft / WORK_SECONDS;
    ring.style.strokeDashoffset = String(RING_C * (1 - frac));
  };

  const tick = () => {
    if (secondsLeft <= 0) {
      clearInterval(timerId);
      timerId = null;
      startBtn.textContent = "Start";
      startBtn.classList.remove("running");
      draw();
      return;
    }
    secondsLeft--;
    draw();
  };

  startBtn.addEventListener("click", () => {
    if (timerId !== null) {
      clearInterval(timerId);
      timerId = null;
      startBtn.textContent = "Start";
      startBtn.classList.remove("running");
    } else {
      timerId = setInterval(tick, 1000);
      startBtn.textContent = "Pause";
      startBtn.classList.add("running");
    }
  });

  resetBtn.addEventListener("click", () => {
    clearInterval(timerId);
    timerId = null;
    secondsLeft = WORK_SECONDS;
    startBtn.textContent = "Start";
    startBtn.classList.remove("running");
    draw();
  });

  draw();
}

/* ---------- Feature 3: checklist (localStorage) ---------- */
const TODO_KEY = "fieldlog.todos";

function initTodo() {
  const form = document.getElementById("todo-form");
  const input = document.getElementById("todo-input");
  const list = document.getElementById("todo-list");
  const count = document.getElementById("todo-count");
  const kudos = document.getElementById("todo-kudos");
  if (!form || !input || !list) return;

  let items = [];
  try { items = JSON.parse(localStorage.getItem(TODO_KEY)) || []; } catch { items = []; }

  const save = () => {
    try { localStorage.setItem(TODO_KEY, JSON.stringify(items)); }
    catch (e) { console.warn("todo save failed", e); }
  };

  const render = () => {
    list.innerHTML = "";
    const open = items.filter((it) => !it.done).length;

    items.forEach((it, i) => {
      const li = document.createElement("li");
      li.className = "todo-item" + (it.done ? " done" : "");

      const check = document.createElement("button");
      check.className = "todo-check";
      check.type = "button";
      check.setAttribute("aria-label", it.done ? "Mark as not done" : "Mark as done");
      check.addEventListener("click", () => {
        it.done = !it.done;
        save();
        render();
      });

      const span = document.createElement("span");
      span.className = "todo-text";
      span.textContent = it.text;

      const del = document.createElement("button");
      del.className = "todo-del";
      del.type = "button";
      del.textContent = "\u00d7";
      del.setAttribute("aria-label", "Remove task");
      del.addEventListener("click", () => {
        items.splice(i, 1);
        save();
        render();
      });

      li.append(check, span, del);
      list.appendChild(li);
    });

    if (count) {
      count.textContent = items.length === 0
        ? "0 open tasks"
        : (open + " open of " + items.length + " total");
    }
    if (kudos) {
      kudos.textContent = items.length > 0 && open === 0
        ? "All tasks struck through — ship it! \u2713"
        : "";
    }
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const val = input.value.trim();
    if (!val) return;
    items.push({ text: val, done: false });
    input.value = "";
    save();
    render();
  });

  render();
}

/* ---------- boot ---------- */
document.addEventListener("DOMContentLoaded", () => {
  initGreeting();
  initTimer();
  initTodo();
});
