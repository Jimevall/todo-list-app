// =====================
// CONFIGURACIÓN
// =====================

const STORAGE_KEY = 'todos';
let todos = [];
let currentFilter = 'all';

// =====================
// ELEMENTOS DEL DOM
// =====================

const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const emptyState = document.getElementById('emptyState');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const totalCount = document.getElementById('totalCount');
const completedCount = document.getElementById('completedCount');
const activeCount = document.getElementById('activeCount');

// =====================
// INICIALIZACIÓN
// =====================

document.addEventListener('DOMContentLoaded', () => {
    loadTodos();
    renderTodos();
    updateStats();
    
    // Event listeners
    addBtn.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTodo();
    });
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            renderTodos();
        });
    });
    
    clearCompletedBtn.addEventListener('click', clearCompleted);
    clearAllBtn.addEventListener('click', clearAll);
});

// =====================
// FUNCIONES PRINCIPALES
// =====================

function addTodo() {
    const text = todoInput.value.trim();
    
    if (text === '') {
        alert('Por favor escribe una tarea');
        return;
    }
    
    const todo = {
        id: Date.now(),
        text: text,
        completed: false,
        createdAt: new Date().toLocaleDateString('es-ES')
    };
    
    todos.push(todo);
    saveTodos();
    renderTodos();
    updateStats();
    todoInput.value = '';
    todoInput.focus();
}

function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    renderTodos();
    updateStats();
}

function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        renderTodos();
        updateStats();
    }
}

function editTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        const newText = prompt('Edita la tarea:', todo.text);
        if (newText && newText.trim() !== '') {
            todo.text = newText.trim();
            saveTodos();
            renderTodos();
        }
    }
}

function clearCompleted() {
    const completed = todos.filter(t => t.completed).length;
    
    if (completed === 0) {
        alert('No hay tareas completadas');
        return;
    }
    
    if (confirm(`¿Estás seguro? Se eliminarán ${completed} tarea(s) completada(s).`)) {
        todos = todos.filter(todo => !todo.completed);
        saveTodos();
        renderTodos();
        updateStats();
    }
}

function clearAll() {
    if (todos.length === 0) {
        alert('No hay tareas para eliminar');
        return;
    }
    
    if (confirm('¿Estás seguro? Se eliminarán todas las tareas.')) {
        todos = [];
        saveTodos();
        renderTodos();
        updateStats();
    }
}

// =====================
// RENDERIZACIÓN
// =====================

function renderTodos() {
    const filtered = getFilteredTodos();
    
    todoList.innerHTML = '';
    
    if (filtered.length === 0) {
        emptyState.classList.add('show');
        return;
    }
    
    emptyState.classList.remove('show');
    
    filtered.forEach(todo => {
        const todoItem = createTodoElement(todo);
        todoList.appendChild(todoItem);
    });
}

function createTodoElement(todo) {
    const div = document.createElement('div');
    div.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    div.innerHTML = `
        <input 
            type="checkbox" 
            class="todo-checkbox" 
            ${todo.completed ? 'checked' : ''}
            onchange="toggleTodo(${todo.id})"
        >
        <div style="flex: 1;">
            <div class="todo-text">${escapeHtml(todo.text)}</div>
            <div class="todo-date">📅 ${todo.createdAt}</div>
        </div>
        <div class="todo-actions">
            <button class="action-btn edit-btn" onclick="editTodo(${todo.id})" title="Editar">✏️</button>
            <button class="action-btn delete-btn" onclick="deleteTodo(${todo.id})" title="Eliminar">🗑️</button>
        </div>
    `;
    return div;
}

function getFilteredTodos() {
    switch(currentFilter) {
        case 'active':
            return todos.filter(t => !t.completed);
        case 'completed':
            return todos.filter(t => t.completed);
        default:
            return todos;
    }
}

// =====================
// ESTADÍSTICAS
// =====================

function updateStats() {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const active = total - completed;
    
    totalCount.textContent = total;
    completedCount.textContent = completed;
    activeCount.textContent = active;
}

// =====================
// LOCAL STORAGE
// =====================

function saveTodos() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function loadTodos() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            todos = JSON.parse(stored);
        } catch (e) {
            console.error('Error al cargar tareas:', e);
            todos = [];
        }
    }
}

// =====================
// UTILIDADES
// =====================

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}