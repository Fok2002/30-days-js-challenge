const STORAGE_KEY = 'day16-notes';

const notesListEl = document.getElementById('notesList');
const notesCountEl = document.getElementById('notesCount');
const emptyStateEl = document.getElementById('emptyState');
const editorPanelEl = document.getElementById('editorPanel');
const editorTitleEl = document.getElementById('editorTitle');
const newNoteBtn = document.getElementById('newNoteBtn');
const saveNoteBtn = document.getElementById('saveNoteBtn');
const noteTitleInput = document.getElementById('noteTitle');
const noteBodyTextarea = document.getElementById('noteBody');

let notes = [];
let editingNoteId = null;

newNoteBtn.addEventListener('click', () => openEditor());
saveNoteBtn.addEventListener('click', saveNote);

noteTitleInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        saveNote();
    }
});

loadNotes();
renderNotes();

function loadNotes() {
    const storedNotes = localStorage.getItem(STORAGE_KEY);

    if (!storedNotes) {
        notes = [];
        return;
    }

    try {
        notes = JSON.parse(storedNotes) || [];
    } catch (error) {
        console.error('Could not parse stored notes:', error);
        notes = [];
    }
}

function saveNotesToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function renderNotes() {
    notesListEl.innerHTML = '';

    if (notes.length === 0) {
        emptyStateEl.classList.remove('hidden');
        notesCountEl.textContent = '0 notes';
        return;
    }

    emptyStateEl.classList.add('hidden');
    notesCountEl.textContent = `${notes.length} note${notes.length === 1 ? '' : 's'}`;

    notes.slice().reverse().forEach((note) => {
        const noteCard = document.createElement('div');
        noteCard.className = 'note-card';

        const titleEl = document.createElement('div');
        titleEl.className = 'note-title';
        titleEl.textContent = note.title || 'Untitled note';

        const metaEl = document.createElement('div');
        metaEl.className = 'note-meta';
        metaEl.textContent = formatDate(note.updatedAt);

        const previewEl = document.createElement('div');
        previewEl.className = 'note-preview';
        previewEl.textContent = note.body || 'Empty note content.';

        const actionsEl = document.createElement('div');
        actionsEl.className = 'note-actions';

        const editBtn = document.createElement('button');
        editBtn.className = 'note-action-btn';
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', () => openEditor(note.id));

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'note-action-btn';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => deleteNote(note.id));

        actionsEl.append(editBtn, deleteBtn);
        noteCard.append(titleEl, metaEl, previewEl, actionsEl);
        notesListEl.appendChild(noteCard);
    });
}

function openEditor(noteId = null) {
    editingNoteId = noteId;

    if (noteId) {
        const noteToEdit = notes.find((note) => note.id === noteId);
        if (noteToEdit) {
            editorTitleEl.textContent = 'Edit Note';
            noteTitleInput.value = noteToEdit.title;
            noteBodyTextarea.value = noteToEdit.body;
        }
    } else {
        editorTitleEl.textContent = 'New Note';
        noteTitleInput.value = '';
        noteBodyTextarea.value = '';
    }

    editorPanelEl.classList.remove('hidden');
    noteTitleInput.focus();
}

function saveNote() {
    const title = noteTitleInput.value.trim();
    const body = noteBodyTextarea.value.trim();

    if (!title && !body) {
        alert('Please add a title or note content before saving.');
        return;
    }

    const timestamp = Date.now();

    if (editingNoteId) {
        const noteIndex = notes.findIndex((note) => note.id === editingNoteId);
        if (noteIndex !== -1) {
            notes[noteIndex] = {
                ...notes[noteIndex],
                title,
                body,
                updatedAt: timestamp,
            };
        }
    } else {
        notes.push({
            id: `note-${timestamp}`,
            title,
            body,
            updatedAt: timestamp,
        });
    }

    saveNotesToStorage();
    renderNotes();
    editorPanelEl.classList.remove('hidden');
    alert('Note saved successfully.');
}

function deleteNote(noteId) {
    const confirmed = confirm('Delete this note? This cannot be undone.');
    if (!confirmed) {
        return;
    }

    notes = notes.filter((note) => note.id !== noteId);
    saveNotesToStorage();
    renderNotes();
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    const options = {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    };

    return date.toLocaleString('en-US', options);
}
