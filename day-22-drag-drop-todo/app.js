// Day 22 - Drag & Drop To-Do Board JS

// State
let tasks = [];
let currentEditingTaskId = null;

// Sample tasks for first-time load
const defaultTasks = [
    {
        id: '1',
        title: '✨ Implement Drag & Drop API',
        desc: 'Build robust drag-and-drop handlers using HTML5 Drag and Drop events.',
        status: 'in-progress',
        priority: 'high',
        tag: 'Feature',
        order: 0
    },
    {
        id: '2',
        title: '🎨 Design Sleek UI Layout',
        desc: 'Create glassmorphism styled cards, custom scrollbars, and neon glows.',
        status: 'completed',
        priority: 'medium',
        tag: 'Design',
        order: 0
    },
    {
        id: '3',
        title: '📱 Add Mobile Touch Support',
        desc: 'Implement touch event listeners to simulate drag-and-drop on mobile touchscreens.',
        status: 'todo',
        priority: 'high',
        tag: 'Mobile',
        order: 0
    },
    {
        id: '4',
        title: '📝 Write Verification Plan',
        desc: 'Document test steps and run validation via browser automation agent.',
        status: 'todo',
        priority: 'low',
        tag: 'Docs',
        order: 1
    }
];

// DOM Elements
const taskLists = {
    'todo': document.getElementById('todo-list'),
    'in-progress': document.getElementById('in-progress-list'),
    'completed': document.getElementById('completed-list')
};

const counters = {
    'todo': document.getElementById('todo-count'),
    'in-progress': document.getElementById('in-progress-count'),
    'completed': document.getElementById('completed-count')
};

const searchInput = document.getElementById('searchInput');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');
const globalAddBtn = document.getElementById('globalAddBtn');

// Modal Elements
const taskModal = document.getElementById('taskModal');
const modalTitle = document.getElementById('modalTitle');
const taskForm = document.getElementById('taskForm');
const modalTaskId = document.getElementById('modalTaskId');
const modalTaskStatus = document.getElementById('modalTaskStatus');
const taskTitleInput = document.getElementById('taskTitle');
const taskDescInput = document.getElementById('taskDesc');
const taskPrioritySelect = document.getElementById('taskPriority');
const taskTagInput = document.getElementById('taskTag');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');

// Initialize App
function init() {
    loadTasks();
    setupEventListeners();
    renderBoard();
}

// Load tasks from LocalStorage
function loadTasks() {
    const localData = localStorage.getItem('drag_drop_todo_tasks');
    if (localData) {
        try {
            tasks = JSON.parse(localData);
        } catch (e) {
            console.error('Failed to parse tasks from localStorage. Loading defaults.', e);
            tasks = [...defaultTasks];
            saveTasks();
        }
    } else {
        tasks = [...defaultTasks];
        saveTasks();
    }
}

// Save tasks to LocalStorage
function saveTasks() {
    localStorage.setItem('drag_drop_todo_tasks', JSON.stringify(tasks));
}

// Setup Event Listeners
function setupEventListeners() {
    // Search Filter
    searchInput.addEventListener('input', () => {
        renderBoard();
    });

    // Clear Completed Action
    clearCompletedBtn.addEventListener('click', () => {
        tasks = tasks.filter(t => t.status !== 'completed');
        saveTasks();
        renderBoard();
    });

    // Modal Actions
    globalAddBtn.addEventListener('click', () => openModal('todo'));
    closeModalBtn.addEventListener('click', closeModal);
    cancelModalBtn.addEventListener('click', closeModal);
    
    // Close modal clicking outside content
    taskModal.addEventListener('click', (e) => {
        if (e.target === taskModal) closeModal();
    });

    // Submit Task Form
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveFormTask();
    });

    // Column Quick Add Buttons
    document.querySelectorAll('.column-add-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const column = btn.getAttribute('data-column');
            openModal(column);
        });
    });

    // Setup drag & drop for lists (standard HTML5)
    Object.keys(taskLists).forEach(status => {
        const list = taskLists[status];
        
        list.addEventListener('dragover', (e) => {
            e.preventDefault(); // Required to allow drop
            const draggingCard = document.querySelector('.task-card.dragging');
            if (!draggingCard) return;

            const afterElement = getDragAfterElement(list, e.clientY);
            if (afterElement) {
                list.insertBefore(draggingCard, afterElement);
            } else {
                list.appendChild(draggingCard);
            }
        });

        list.addEventListener('dragenter', (e) => {
            e.preventDefault();
            list.closest('.board-column').classList.add('drag-over');
        });

        list.addEventListener('dragleave', (e) => {
            // Only remove if leaving the column element itself
            if (!list.closest('.board-column').contains(e.relatedTarget)) {
                list.closest('.board-column').classList.remove('drag-over');
            }
        });

        list.addEventListener('drop', (e) => {
            e.preventDefault();
            list.closest('.board-column').classList.remove('drag-over');
            syncDOMState();
        });
    });
}

// Find insertion element in vertical list
function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.task-card:not(.dragging)')];
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Synchronize model state from DOM (triggered after drag/drop ends)
function syncDOMState() {
    const newTasks = [];
    
    // Read each list's DOM elements
    Object.keys(taskLists).forEach(status => {
        const list = taskLists[status];
        const cards = [...list.querySelectorAll('.task-card')];
        
        cards.forEach((card, index) => {
            const id = card.getAttribute('data-id');
            const task = tasks.find(t => t.id === id);
            
            if (task) {
                // Update status and order in status column
                task.status = status;
                task.order = index;
                newTasks.push(task);
            }
        });
    });

    // Make sure we keep any tasks that were filtered out from search but still exist
    tasks.forEach(task => {
        if (!newTasks.some(t => t.id === task.id)) {
            newTasks.push(task);
        }
    });

    tasks = newTasks;
    saveTasks();
    
    // Quick re-update counters and tasks order
    updateCounters();
}

// Render Board
function renderBoard() {
    const query = searchInput.value.toLowerCase().trim();
    
    // Clear lists
    Object.keys(taskLists).forEach(status => {
        taskLists[status].innerHTML = '';
    });

    // Filter tasks
    const filteredTasks = tasks.filter(task => {
        const titleMatch = task.title.toLowerCase().includes(query);
        const descMatch = (task.desc || '').toLowerCase().includes(query);
        const tagMatch = (task.tag || '').toLowerCase().includes(query);
        return titleMatch || descMatch || tagMatch;
    });

    // Sort tasks by order attribute in each status list
    const statusGroups = { 'todo': [], 'in-progress': [], 'completed': [] };
    filteredTasks.forEach(task => {
        if (statusGroups[task.status]) {
            statusGroups[task.status].push(task);
        }
    });

    Object.keys(statusGroups).forEach(status => {
        statusGroups[status].sort((a, b) => (a.order || 0) - (b.order || 0));
        
        const list = taskLists[status];
        const group = statusGroups[status];

        if (group.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'empty-state';
            
            let emoji = '📝';
            let message = 'No tasks here yet.';
            if (status === 'in-progress') {
                emoji = '⚡';
                message = 'No active tasks in progress.';
            } else if (status === 'completed') {
                emoji = '🎉';
                message = 'No completed tasks yet.';
            }

            if (query) {
                emoji = '🔍';
                message = 'No matching tasks found.';
            }

            empty.innerHTML = `
                <span class="empty-state-icon">${emoji}</span>
                <p>${message}</p>
            `;
            list.appendChild(empty);
        } else {
            group.forEach(task => {
                const card = createTaskCardDOM(task);
                list.appendChild(card);
            });
        }
    });

    updateCounters();
}

// Create Card DOM Element
function createTaskCardDOM(task) {
    const card = document.createElement('div');
    card.className = `task-card${task.status === 'completed' ? ' completed-task' : ''}`;
    card.setAttribute('draggable', 'true');
    card.setAttribute('data-id', task.id);

    // Header (Title)
    const header = document.createElement('div');
    header.className = 'task-card-header';
    
    const title = document.createElement('h3');
    title.className = 'task-card-title';
    title.textContent = task.title;
    header.appendChild(title);
    card.appendChild(header);

    // Description
    if (task.desc) {
        const desc = document.createElement('p');
        desc.className = 'task-card-desc';
        desc.textContent = task.desc;
        card.appendChild(desc);
    }

    // Badges Container (Priority & Tags)
    const badges = document.createElement('div');
    badges.className = 'task-badges';

    // Priority Badge
    const pBadge = document.createElement('span');
    pBadge.className = `badge badge-priority-${task.priority}`;
    pBadge.textContent = task.priority;
    badges.appendChild(pBadge);

    // Tag Badge
    if (task.tag) {
        const tBadge = document.createElement('span');
        tBadge.className = 'badge badge-tag';
        tBadge.textContent = `#${task.tag}`;
        tBadge.setAttribute('title', task.tag);
        badges.appendChild(tBadge);
    }
    card.appendChild(badges);

    // Footer with Edit / Delete Actions
    const footer = document.createElement('div');
    footer.className = 'task-card-footer';

    const actions = document.createElement('div');
    actions.className = 'card-actions';

    // Edit button
    const editBtn = document.createElement('button');
    editBtn.className = 'action-btn action-edit';
    editBtn.title = 'Edit task';
    editBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
    `;
    editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openModal(task.status, task.id);
    });

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'action-btn action-delete';
    deleteBtn.title = 'Delete task';
    deleteBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
    `;
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteTask(task.id);
    });

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    footer.appendChild(actions);
    card.appendChild(footer);

    // Standard Drag Listeners
    card.addEventListener('dragstart', (e) => {
        card.classList.add('dragging');
        e.dataTransfer.setData('text/plain', task.id);
    });

    card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
        // Clear all column highlights just in case
        document.querySelectorAll('.board-column').forEach(col => col.classList.remove('drag-over'));
        syncDOMState();
    });

    // Custom Mobile Touch Drag Support
    setupTouchDrag(card);

    return card;
}

// Update column counters
function updateCounters() {
    const counts = { 'todo': 0, 'in-progress': 0, 'completed': 0 };
    
    tasks.forEach(t => {
        if (counts[t.status] !== undefined) {
            counts[t.status]++;
        }
    });

    Object.keys(counters).forEach(status => {
        counters[status].textContent = counts[status];
    });

    // Clear completed visibility helper
    const hasCompleted = tasks.some(t => t.status === 'completed');
    clearCompletedBtn.style.visibility = hasCompleted ? 'visible' : 'hidden';
}

// Delete Task with transition
function deleteTask(id) {
    const card = document.querySelector(`.task-card[data-id="${id}"]`);
    if (card) {
        card.style.transform = 'scale(0.8)';
        card.style.opacity = '0';
        setTimeout(() => {
            tasks = tasks.filter(t => t.id !== id);
            saveTasks();
            renderBoard();
        }, 150);
    } else {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderBoard();
    }
}

// Modal Form Operations
function openModal(column, taskId = null) {
    currentEditingTaskId = taskId;
    modalTaskStatus.value = column;
    
    if (taskId) {
        // Edit Mode
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            modalTitle.textContent = 'Edit Task';
            taskTitleInput.value = task.title;
            taskDescInput.value = task.desc || '';
            taskPrioritySelect.value = task.priority;
            taskTagInput.value = task.tag || '';
            modalTaskId.value = task.id;
        }
    } else {
        // Create Mode
        modalTitle.textContent = 'Create New Task';
        taskForm.reset();
        modalTaskId.value = '';
        modalTaskStatus.value = column;
    }
    
    taskModal.classList.remove('hidden');
    taskTitleInput.focus();
}

function closeModal() {
    taskModal.classList.add('hidden');
    currentEditingTaskId = null;
}

function saveFormTask() {
    const title = taskTitleInput.value.trim();
    const desc = taskDescInput.value.trim();
    const priority = taskPrioritySelect.value;
    const tag = taskTagInput.value.trim();
    const status = modalTaskStatus.value;
    const id = modalTaskId.value;

    if (!title) return;

    if (id) {
        // Update existing task
        tasks = tasks.map(t => {
            if (t.id === id) {
                return { ...t, title, desc, priority, tag };
            }
            return t;
        });
    } else {
        // Create new task
        // Find highest order in the target column to place at the end
        const columnTasks = tasks.filter(t => t.status === status);
        const maxOrder = columnTasks.reduce((max, t) => Math.max(max, t.order || 0), -1);
        
        const newTask = {
            id: Date.now().toString(),
            title,
            desc,
            status,
            priority,
            tag,
            order: maxOrder + 1
        };
        tasks.push(newTask);
    }

    saveTasks();
    renderBoard();
    closeModal();
}

// Custom Touch Drag Implementation for Mobile
function setupTouchDrag(card) {
    let touchStartClientX = 0;
    let touchStartClientY = 0;
    let cardXOffset = 0;
    let cardYOffset = 0;
    let ghostElement = null;
    let isDragging = false;
    let activeList = null;

    card.addEventListener('touchstart', (e) => {
        // Ignore multi-touch
        if (e.touches.length > 1) return;
        
        // Don't initiate drag if clicking on buttons
        if (e.target.closest('.action-btn')) return;

        const touch = e.touches[0];
        touchStartClientX = touch.clientX;
        touchStartClientY = touch.clientY;
        
        const rect = card.getBoundingClientRect();
        cardXOffset = touch.clientX - rect.left;
        cardYOffset = touch.clientY - rect.top;
        
        isDragging = false;
    }, { passive: true });

    card.addEventListener('touchmove', (e) => {
        if (e.touches.length > 1) return;
        const touch = e.touches[0];
        
        const dx = touch.clientX - touchStartClientX;
        const dy = touch.clientY - touchStartClientY;
        
        // Start dragging after moving more than 10px
        if (!isDragging && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) {
            isDragging = true;
            card.classList.add('dragging');
            
            // Create ghost clone element to follow finger
            ghostElement = card.cloneNode(true);
            ghostElement.classList.add('touch-ghost');
            ghostElement.classList.remove('dragging');
            
            // Setup ghost styling
            const rect = card.getBoundingClientRect();
            ghostElement.style.position = 'fixed';
            ghostElement.style.width = `${rect.width}px`;
            ghostElement.style.height = `${rect.height}px`;
            ghostElement.style.left = `${touch.clientX - cardXOffset}px`;
            ghostElement.style.top = `${touch.clientY - cardYOffset}px`;
            ghostElement.style.zIndex = '1000';
            ghostElement.style.pointerEvents = 'none';
            ghostElement.style.transform = 'scale(1.04)';
            ghostElement.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.5)';
            ghostElement.style.opacity = '0.9';
            
            document.body.appendChild(ghostElement);
        }

        if (isDragging) {
            // Prevent scrolling on mobile while dragging
            if (e.cancelable) e.preventDefault();
            
            // Update ghost position
            if (ghostElement) {
                ghostElement.style.left = `${touch.clientX - cardXOffset}px`;
                ghostElement.style.top = `${touch.clientY - cardYOffset}px`;
            }

            // Find drop zone element under finger
            const elementUnderFinger = document.elementFromPoint(touch.clientX, touch.clientY);
            if (!elementUnderFinger) return;

            // Find closest column and list
            const columnEl = elementUnderFinger.closest('.board-column');
            const listEl = elementUnderFinger.closest('.task-list');

            // Clear previous highlight
            document.querySelectorAll('.board-column').forEach(col => {
                if (col !== columnEl) col.classList.remove('drag-over');
            });

            if (columnEl) {
                columnEl.classList.add('drag-over');
                activeList = listEl || columnEl.querySelector('.task-list');
                
                if (activeList) {
                    // Try to reorder inline
                    const afterElement = getDragAfterElement(activeList, touch.clientY);
                    if (afterElement) {
                        activeList.insertBefore(card, afterElement);
                    } else {
                        activeList.appendChild(card);
                    }
                }
            } else {
                activeList = null;
            }
        }
    }, { passive: false });

    card.addEventListener('touchend', () => {
        cleanupTouchDrag();
    });

    card.addEventListener('touchcancel', () => {
        cleanupTouchDrag();
    });

    function cleanupTouchDrag() {
        if (ghostElement) {
            ghostElement.remove();
            ghostElement = null;
        }
        
        if (isDragging) {
            card.classList.remove('dragging');
            document.querySelectorAll('.board-column').forEach(col => col.classList.remove('drag-over'));
            syncDOMState();
            isDragging = false;
        }
    }
}

// Run initialization on DOM load
document.addEventListener('DOMContentLoaded', init);
