// src/js/main.js — Adventures of GitHub with AI
//
// Three tiny, self-contained MVPs:
//   1) Time-of-day greeting + rotating "Git tip of the day"
//   2) Pomodoro mini-timer (start / pause / reset)
//   3) To-do list that persists with localStorage
//
// Open this page from the src/ folder so css/ and js/ resolve.

/* ---------- Feature 1: greeting + git tip ---------- */
const GREETINGS = [
  { text: "Good morning! Rise and shine. 🌅" },   // 5:00–11:59
  { text: "Good afternoon! Keep going. ☀️" },      // 12:00–17:59
  { text: "Good evening! Wind down. 🌆" },       // 18:00–21:59
  { text: "Hey there, night owl. 🌙" },           // 22:00–4:59
];

const GIT_TIPS = [
  "Stage individual hunks with `git add -p` to review changes line-by-line.",
  "Use `git switch -c <branch>` to create AND switch in one command.",
  "Quick-save work with `git stash`, then `git stash pop` to restore it.",
  "Use `git restore <file>` rather than `checkout` to discard local changes.",
  "Add a .gitignore to keep secrets and build output out of your repo.",
  "Write clear commits: a <50-char subject, blank line, then a body.",
  "Keep history linear with `git pull --rebase`.",
  "Tag releases: `git tag v1.0` then `git push --tags`.",
];

function greeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return GREETINGS[0].text;
  if (h >= 12 && h < 18) return GREETINGS[1].text;
  if (h >= 18 && h < 22) return GREETINGS[2].text;
  return GREETINGS[3].text;
}

// Picks a tip that stays the same all day (stable per calendar day).
function tipOfTheDay() {
  const day = Math.floor(Date.now() / 86400000);
  return GIT_TIPS[day % GIT_TIPS.length];
}

function initGreeting() {
  const g = document.getElementById("greeting");
  const t = document.getElementById("git-tip");
  if (g) g.textContent = greeting() + " \u2014 welcome to the adventure!";
  if (t) t.textContent = "\ud83d\udca1 Git tip of the day: " + tipOfTheDay();
}

/* ---------- Feature 2: pomodoro timer ---------- */
const WORK_SECONDS = 25 * 60; // 25 minutes
let secondsLeft = WORK_SECONDS;
let timerId = null;

function pad(n) { return String(n).padStart(2, "0"); }
function fmt(sec) {
  const total = Math.max(0, Math.floor(sec));
  return pad(Math.floor(total / 60)) + ":" + pad(total % 60);
}

function initTimer() {
  const display = document.getElementById("timer");
  const startBtn = document.getElementById("start");
  const resetBtn = document.getElementById("reset");
  if (!display || !startBtn || !resetBtn) return;

  display.textContent = fmt(secondsLeft);

  startBtn.addEventListener("click", () => {
    if (timerId === null) {
      // running -> pause
      clearInterval(timerId);
      timerId = null;
      startBtn.textContent = "Start";
    } else {
      // paused/started -> tick down
      timerId = setInterval(() => {
        secondsLeft--;
        display.textContent = fmt(secondsLeft);
        if (secondsLeft <= 0) {
          clearInterval(timerId);
          timerId = null;
          startBtn.textContent = "Start";
          display.textContent = fmt(0);
        }
      }, 1000);
      startBtn.textContent = "Pause";
    }
  });

  resetBtn.addEventListener("click", () => {
    clearInterval(timerId);
    timerId = null;
    secondsLeft = WORK_SECONDS;
    display.textContent = fmt(secondsLeft);
    startBtn.textContent = "Start";
  });
}

/* ---------- Feature 3: todo list (localStorage) ---------- */
const TODO_KEY = "adventures.todos";

function initTodo() {
  const form = document.getElementById("todo-form");
  const input = document.getElementById("todo-input");
  const list = document.getElementById("todo-list");
  if (!form || !input || !list) return;

  let items = [];
  try { items = JSON.parse(localStorage.getItem(TODO_KEY)) || []; } catch { items = []; }

  const save = () => {
    try { localStorage.setItem(TODO_KEY, JSON.stringify(items)); }
    catch (e) { console.warn("todo save failed", e); }
  };

  const render = () => {
    list.innerHTML = "";
    items.forEach((it, i) => {
      const li = document.createElement("li");
      li.className = "todo-item";
      li.textContent = it;
      const del = document.createElement("button");
      del.textContent = "\u2715";
      del.title = "Remove";
      del.addEventListener("click", () => { items.splice(i, 1); save(); render(); });
      li.appendChild(del);
      list.appendChild(li);
    });
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const val = input.value.trim();
    if (!val) return;
    items.push(val);
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
