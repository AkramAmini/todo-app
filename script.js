// ============================================
// To-Do App with LocalStorage
// ============================================

// ---------- State ----------
let todos = [];
let currentFilter = "all";

// ---------- DOM Elements ----------
const todoForm = document.getElementById("todo-form");
const todoInput = document.getElementById("todo-input");
const todoList = document.getElementById("todo-list");
const stats = document.getElementById("stats");
const filterButtons = document.querySelectorAll(".filter-btn");
const clearAllBtn = document.getElementById("clear-all");

// ---------- Load from LocalStorage ----------
function loadTodos() {
  const stored = localStorage.getItem("todos");
  if (stored) {
    try {
      todos = JSON.parse(stored);
    } catch (e) {
      todos = [];
    }
  } else {
    // Sample data - ALL IN ENGLISH
    todos = [
      { id: 1, text: "Learn JavaScript", completed: false },
      { id: 2, text: "Build a To-Do App", completed: true },
      { id: 3, text: "Deploy to GitHub", completed: false },
    ];
  }
}

// ---------- Save to LocalStorage ----------
function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

// ---------- Generate Unique ID ----------
function generateId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

// ---------- Render Todos ----------
function render() {
  let filteredTodos = todos;
  if (currentFilter === "active") {
    filteredTodos = todos.filter((todo) => !todo.completed);
  } else if (currentFilter === "completed") {
    filteredTodos = todos.filter((todo) => todo.completed);
  }

  filteredTodos.sort((a, b) => {
    if (a.completed === b.completed) return 0;
    return a.completed ? 1 : -1;
  });

  if (filteredTodos.length === 0) {
    todoList.innerHTML = `
            <div class="empty-message">
                <span>📭</span>
                <p>No tasks found!</p>
                <small style="color: #bbb;">Add one now...</small>
            </div>
        `;
  } else {
    todoList.innerHTML = filteredTodos
      .map(
        (todo) => `
            <li class="todo-item ${todo.completed ? "completed" : ""}" data-id="${todo.id}">
                <input 
                    type="checkbox" 
                    class="todo-checkbox" 
                    ${todo.completed ? "checked" : ""}
                    aria-label="Mark as done"
                />
                <span class="todo-text">${escapeHtml(todo.text)}</span>
                <button class="delete-btn" aria-label="Delete task">🗑️</button>
            </li>
        `,
      )
      .join("");
  }

  const remaining = todos.filter((t) => !t.completed).length;
  stats.textContent = `${remaining} task${remaining !== 1 ? "s" : ""} remaining`;

  filterButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.filter === currentFilter);
  });

  saveTodos();
}

// ---------- Escape HTML ----------
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ---------- Add Todo ----------
function addTodo(text) {
  const trimmed = text.trim();
  if (!trimmed) return false;

  const newTodo = {
    id: generateId(),
    text: trimmed,
    completed: false,
  };

  todos.push(newTodo);
  render();
  todoInput.value = "";
  todoInput.focus();
  return true;
}

// ---------- Delete Todo ----------
function deleteTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);
  render();
}

// ---------- Toggle Todo ----------
function toggleTodo(id) {
  const todo = todos.find((t) => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    render();
  }
}

// ---------- Clear All Completed ----------
function clearAllCompleted() {
  const hasCompleted = todos.some((t) => t.completed);
  if (!hasCompleted) {
    alert("No completed tasks to clear!");
    return;
  }

  if (confirm("Clear all completed tasks?")) {
    todos = todos.filter((todo) => !todo.completed);
    render();
  }
}

// ---------- Event Listeners ----------
todoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  addTodo(todoInput.value);
});

todoList.addEventListener("click", (e) => {
  const item = e.target.closest(".todo-item");
  if (!item) return;

  const id = Number(item.dataset.id);

  if (e.target.classList.contains("delete-btn")) {
    deleteTodo(id);
    return;
  }

  if (e.target.classList.contains("todo-checkbox")) {
    toggleTodo(id);
    return;
  }

  if (e.target.classList.contains("todo-text")) {
    toggleTodo(id);
  }
});

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    currentFilter = btn.dataset.filter;
    render();
  });
});

clearAllBtn.addEventListener("click", clearAllCompleted);

// ---------- Keyboard Shortcuts ----------
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.shiftKey && e.key === "C") {
    e.preventDefault();
    clearAllCompleted();
  }

  if (e.key === "Escape" && document.activeElement === todoInput) {
    todoInput.value = "";
    todoInput.blur();
  }
});

// ---------- Init ----------
loadTodos();
render();
console.log("✅ To-Do App ready!");
console.log("⌨️ Shortcut: Ctrl+Shift+C to clear completed tasks");
