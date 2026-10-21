/* ===================================================
   STUDY PLANNER: script.js
   Part A: Saving data   (Member 3)
   Part B: Logic         (Member 2)
   Part C: Showing tasks + the form
   =================================================== */


/* ===== PART A: SAVING DATA ===== */

// The name our data is stored under in the browser.
const KEY = "study-planner-tasks";

// Load saved tasks when the page opens.
let tasks = load();

function load() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY));
    // Only accept a real list; anything else becomes an empty list.
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return [];
  }
}

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(tasks));
  } catch (e) {
    // If the browser blocks storage, the app still works for this session.
  }
}


/* ===== PART B: LOGIC ===== */

// How many days until the deadline? Negative means it is already late.
function daysLeft(dueText) {
  const [y, m, d] = dueText.split("-").map(Number);
  const today = new Date();
  today.setHours(0, 0, 0, 0);                       // ignore the time of day
  const due = new Date(y, m - 1, d);                // months start at 0 in JS
  return Math.round((due - today) / 86400000);      // 86,400,000 ms = 1 day
}

// Which color group does a task belong to?
function statusOf(t) {
  if (t.done) return "done";
  const d = daysLeft(t.due);
  if (d < 0) return "over";
  if (d <= 2) return "soon";
  return "later";
}

// The short text shown on the right of each task.
function labelOf(t) {
  if (t.done) return "Done";
  const d = daysLeft(t.due);
  if (d < 0) return (-d) + (d === -1 ? " day overdue" : " days overdue");
  if (d === 0) return "Due today";
  if (d === 1) return "Due tomorrow";
  return d + " days left";
}

// Unfinished tasks first, then the earliest deadline first.
function sortTasks(list) {
  return [...list].sort((a, b) => (a.done - b.done) || a.due.localeCompare(b.due));
}

function addTask(title, subject, due) {
  tasks.push({ id: Date.now(), title: title, subject: subject, due: due, done: false });
  save();
  render();
}

function toggleTask(id) {
  const t = tasks.find(x => x.id === id);
  if (t) {
    t.done = !t.done;
    save();
    render();
  }
}

function deleteTask(id) {
  tasks = tasks.filter(x => x.id !== id);
  save();
  render();
}


/* ===== PART C: SHOWING TASKS ===== */

// Rebuilds the whole list on screen from the tasks array.
function render() {
  const list = document.getElementById("list");
  list.replaceChildren();                           // clear the old list

  for (const t of sortTasks(tasks)) {
    const li = document.createElement("li");
    li.className = "task " + statusOf(t);           // e.g. "task over"

    // Checkbox
    const box = document.createElement("input");
    box.type = "checkbox";
    box.checked = t.done;
    box.setAttribute("aria-label", "Mark done: " + t.title);
    box.addEventListener("change", () => toggleTask(t.id));

    // Title and subject/date line
    const info = document.createElement("div");
    info.className = "info";

    const title = document.createElement("div");
    title.className = "title";
    title.textContent = t.title;                    // textContent keeps typed text safe

    const meta = document.createElement("div");
    meta.className = "meta";
    const niceDate = new Date(t.due + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "short", month: "short", day: "numeric"
    });
    meta.textContent = (t.subject ? t.subject + ", " : "") + "due " + niceDate;

    info.append(title, meta);

    // Status badge
    const badge = document.createElement("div");
    badge.className = "badge";
    badge.textContent = labelOf(t);

    // Delete button
    const del = document.createElement("button");
    del.className = "del";
    del.textContent = "×";
    del.setAttribute("aria-label", "Delete: " + t.title);
    del.addEventListener("click", () => deleteTask(t.id));

    li.append(box, info, badge, del);
    list.append(li);
  }

  // Summary line under the title
  const open = tasks.filter(t => !t.done).length;
  const overdue = tasks.filter(t => statusOf(t) === "over").length;
  document.getElementById("summary").textContent =
    tasks.length === 0
      ? "Must finish task."
      : open + (open === 1 ? " task open" : " tasks open") +
        (overdue ? ", " + overdue + " overdue" : ", none overdue");

  // Show the empty message only when there are no tasks
  document.getElementById("empty").hidden = tasks.length > 0;
}

// When the form is submitted, add the task instead of reloading the page.
document.getElementById("add-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const title = document.getElementById("title").value.trim();
  const subject = document.getElementById("subject").value.trim();
  const due = document.getElementById("due").value;
  if (!title || !due) return;
  addTask(title, subject, due);
  this.reset();
  document.getElementById("title").focus();
});

// Draw the saved tasks as soon as the page loads.
render();
