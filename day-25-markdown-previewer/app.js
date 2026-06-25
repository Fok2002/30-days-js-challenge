/* =========================================
   MARK FOK — Markdown Previewer  |  Day 25
   app.js — Full vanilla JS Markdown engine
   ========================================= */

'use strict';

/* ── Markdown Parser ─────────────────────
   A custom, spec-aware Markdown → HTML parser
   written from scratch in vanilla JS.
   ──────────────────────────────────────── */
class MarkdownParser {
  parse(md) {
    if (!md || !md.trim()) return '';

    let html = md;

    // --- Block-level parsing ---

    // Fenced code blocks (``` ... ```)
    html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
      const escaped = this._escapeHTML(code.trim());
      const langClass = lang ? ` class="language-${lang}"` : '';
      const langLabel = lang ? `<span class="code-lang">${lang}</span>` : '';
      return `\n\n<pre data-lang="${lang}">${langLabel}<code${langClass}>${escaped}</code></pre>\n\n`;
    });

    // Horizontal rules
    html = html.replace(/^(?:---|\*\*\*|___)\s*$/gm, '\n<hr>\n');

    // Headings
    html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>');
    html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>');
    html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');

    // Setext headings (underlined with = or -)
    html = html.replace(/^(.+)\n={3,}\s*$/gm, '<h1>$1</h1>');
    html = html.replace(/^(.+)\n-{3,}\s*$/gm, '<h2>$1</h2>');

    // Blockquotes (support nested)
    html = html.replace(/((?:^>\s?.+\n?)+)/gm, (match) => {
      const inner = match.replace(/^>\s?/gm, '');
      return `<blockquote>${this.parse(inner.trim())}</blockquote>`;
    });

    // Tables
    html = html.replace(/((?:\|.+\|\n)+)/g, (match) => {
      const rows = match.trim().split('\n');
      if (rows.length < 2) return match;
      // detect separator row
      const sepIdx = rows.findIndex(r => /^\|[\s|:-]+\|$/.test(r));
      if (sepIdx === -1) return match;

      const headerRows = rows.slice(0, sepIdx);
      const bodyRows = rows.slice(sepIdx + 1);

      const parseRow = (row, tag) => {
        const cells = row.split('|').filter((_, i, a) => i > 0 && i < a.length - 1);
        return `<tr>${cells.map(c => `<${tag}>${this._parseInline(c.trim())}</${tag}>`).join('')}</tr>`;
      };

      const thead = headerRows.map(r => parseRow(r, 'th')).join('');
      const tbody = bodyRows.map(r => parseRow(r, 'td')).join('');
      return `<table><thead>${thead}</thead><tbody>${tbody}</tbody></table>`;
    });

    // Unordered lists
    html = html.replace(/((?:^[ \t]*[-*+]\s.+\n?)+)/gm, (match) => {
      const items = match.trim().split('\n').map(line => {
        const content = line.replace(/^[ \t]*[-*+]\s/, '');
        // task list checkboxes
        const task = content.replace(/^\[([xX ])\]\s/, (_, c) => {
          const checked = c.toLowerCase() === 'x' ? ' checked' : '';
          return `<input type="checkbox"${checked} disabled> `;
        });
        return `<li>${this._parseInline(task)}</li>`;
      }).join('');
      return `<ul>${items}</ul>`;
    });

    // Ordered lists
    html = html.replace(/((?:^[ \t]*\d+\.\s.+\n?)+)/gm, (match) => {
      const items = match.trim().split('\n').map(line => {
        const content = line.replace(/^[ \t]*\d+\.\s/, '');
        return `<li>${this._parseInline(content)}</li>`;
      }).join('');
      return `<ol>${items}</ol>`;
    });

    // Paragraphs — double newline separates blocks
    const blocks = html.split(/\n{2,}/);
    html = blocks.map(block => {
      block = block.trim();
      if (!block) return '';
      // Already a block element?
      if (/^<(h[1-6]|ul|ol|li|blockquote|pre|table|hr|div)/.test(block)) {
        return block;
      }
      return `<p>${this._parseInline(block)}</p>`;
    }).join('\n');

    // Clean up empty paragraphs
    html = html.replace(/<p>\s*<\/p>/g, '');

    return html;
  }

  _parseInline(text) {
    // Inline code — process first to protect from other rules
    text = text.replace(/`([^`]+)`/g, (_, code) => `<code>${this._escapeHTML(code)}</code>`);

    // Images before links (order matters)
    text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) => {
      return `<img src="${src}" alt="${alt}" loading="lazy">`;
    });

    // Links
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => {
      const isExternal = /^https?:\/\//.test(href);
      const target = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
      return `<a href="${href}"${target}>${label}</a>`;
    });

    // Autolinks
    text = text.replace(/(?<!["\(])(https?:\/\/[^\s<>]+)/g, (url) => {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    });

    // Bold + Italic combined
    text = text.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    text = text.replace(/___(.+?)___/g, '<strong><em>$1</em></strong>');

    // Bold
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/__(.+?)__/g, '<strong>$1</strong>');

    // Italic
    text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
    text = text.replace(/_(.+?)_/g, '<em>$1</em>');

    // Strikethrough
    text = text.replace(/~~(.+?)~~/g, '<del>$1</del>');

    // Highlight
    text = text.replace(/==(.+?)==/g, '<mark>$1</mark>');

    // Subscript / Superscript
    text = text.replace(/\^(.+?)\^/g, '<sup>$1</sup>');
    text = text.replace(/~(.+?)~/g, '<sub>$1</sub>');

    // Line breaks (two trailing spaces)
    text = text.replace(/  \n/g, '<br>');
    text = text.replace(/\\\n/g, '<br>');

    return text;
  }

  _escapeHTML(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}

/* ── Sample Markdown ─────────────────────
   Showcases almost all supported features
   ──────────────────────────────────────── */
const SAMPLE_MD = `# Welcome to MarkFok ✨

A **live Markdown previewer** built with vanilla JavaScript — no libraries, no frameworks.
Type in the editor on the left and see the rendered HTML _instantly_ on the right.

---

## Features

- **Bold**, _italic_, ~~strikethrough~~, and \`inline code\`
- [Hyperlinks](https://github.com) and ![images](https://placehold.co/300x120/1a1b2e/7c6af7?text=MarkFok+Image)
- Blockquotes, code blocks, tables, and task lists
- Real-time stats: word count, character count, reading time
- Resizable split pane — drag the divider!
- Light / dark theme toggle
- Export Markdown or copy the HTML output

---

## Code Example

\`\`\`javascript
// A simple Markdown → HTML pipeline
function parseMarkdown(text) {
  return text
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>')
    .replace(/\\*(.+?)\\*/g, '<em>$1</em>');
}

console.log(parseMarkdown('# Hello **World**'));
\`\`\`

---

## Blockquote

> "Any sufficiently advanced technology is indistinguishable from magic."
> — Arthur C. Clarke

---

## Table

| Feature          | Status  | Notes                |
|------------------|---------|----------------------|
| Bold / Italic    | ✅ Done  | Full support         |
| Tables           | ✅ Done  | Alignment ready      |
| Code Blocks      | ✅ Done  | Syntax labels        |
| Task Lists       | ✅ Done  | Checkbox rendering   |
| Export           | ✅ Done  | MD download + HTML   |

---

## Task List

- [x] Build the Markdown parser from scratch
- [x] Implement live preview with debounce
- [x] Add toolbar with keyboard shortcuts
- [x] Resizable split pane via drag
- [ ] Syntax highlighting (stretch goal)
- [ ] Collaborative editing (future)

---

## Typography

H1 through H6 headings, **bold**, _italic_, ~~strikethrough~~, \`code\`, ==highlight==, and ^superscript^.

Paragraph with a forced line break here:  
↑ That was a line break (two trailing spaces).

---

*Day 25 • 30 Days JavaScript Challenge* 🚀
`;

/* ── Toolbar Actions ─────────────────────
   Maps action IDs to wrap/insert logic
   ──────────────────────────────────────── */
const TOOLBAR_ACTIONS = {
  h1:          { prefix: '# ',   suffix: '',   placeholder: 'Heading 1'   },
  h2:          { prefix: '## ',  suffix: '',   placeholder: 'Heading 2'   },
  h3:          { prefix: '### ', suffix: '',   placeholder: 'Heading 3'   },
  bold:        { prefix: '**',   suffix: '**', placeholder: 'bold text'   },
  italic:      { prefix: '*',    suffix: '*',  placeholder: 'italic text' },
  strike:      { prefix: '~~',   suffix: '~~', placeholder: 'strikethrough' },
  'code-inline': { prefix: '`', suffix: '`',  placeholder: 'code'        },
  link:        { prefix: '[',    suffix: '](url)', placeholder: 'link text' },
  image:       { prefix: '![',   suffix: '](url)', placeholder: 'alt text' },
  ul:          { prefix: '- ',   suffix: '',   placeholder: 'List item',  block: true },
  ol:          { prefix: '1. ',  suffix: '',   placeholder: 'List item',  block: true },
  blockquote:  { prefix: '> ',   suffix: '',   placeholder: 'Quote',      block: true },
  hr:          { insert: '\n---\n' },
  table: {
    insert: '\n| Column 1 | Column 2 | Column 3 |\n|----------|----------|----------|\n| Cell     | Cell     | Cell     |\n| Cell     | Cell     | Cell     |\n'
  },
  codeblock: {
    insert: '\n```javascript\n// your code here\n```\n'
  },
};

/* ── App State ───────────────────────────── */
const state = {
  theme: 'dark',
  viewMode: 'split',
  splitPercent: 50,
};

/* ── DOM References ──────────────────────── */
const $ = (id) => document.getElementById(id);

const editor       = $('md-editor');
const preview      = $('md-preview');
const lineNumbers  = $('line-numbers');
const editorShell  = $('editor-shell');
const editorPane   = $('editor-pane');
const previewPane  = $('preview-pane');
const resizeHandle = $('resize-handle');
const toastContainer = $('toast-container');

// Stats
const elWords  = $('word-count');
const elChars  = $('char-count');
const elLines  = $('line-count');
const elRead   = $('read-time');

/* ── Parser Instance ─────────────────────── */
const parser = new MarkdownParser();

/* ── Debounce ────────────────────────────── */
function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

/* ── Render ──────────────────────────────── */
function renderPreview() {
  const md = editor.value;
  const html = parser.parse(md);
  preview.innerHTML = html || '<p style="color:var(--text-tertiary);font-style:italic;">Nothing to preview yet…</p>';
  updateStats(md);
  updateLineNumbers();
  saveToStorage();
}

const debouncedRender = debounce(renderPreview, 80);

/* ── Stats ───────────────────────────────── */
function updateStats(md) {
  const text = md.trim();
  const words    = text ? text.split(/\s+/).length : 0;
  const chars    = md.length;
  const lines    = md.split('\n').length;
  const readTime = Math.max(1, Math.ceil(words / 200));

  animateNum(elWords, words);
  animateNum(elChars, chars);
  animateNum(elLines, lines);
  animateNum(elRead, readTime);
}

function animateNum(el, target) {
  const current = parseInt(el.textContent) || 0;
  if (current === target) return;
  el.textContent = target;
  el.style.transform = 'scale(1.15)';
  el.style.color = 'var(--accent-green)';
  setTimeout(() => {
    el.style.transform = '';
    el.style.color = '';
  }, 180);
}

/* ── Line Numbers ────────────────────────── */
function updateLineNumbers() {
  const lines = editor.value.split('\n').length;
  const fragment = document.createDocumentFragment();
  for (let i = 1; i <= lines; i++) {
    const div = document.createElement('div');
    div.textContent = i;
    fragment.appendChild(div);
  }
  lineNumbers.innerHTML = '';
  lineNumbers.appendChild(fragment);
}

/* Sync scroll between line numbers and textarea */
editor.addEventListener('scroll', () => {
  lineNumbers.scrollTop = editor.scrollTop;
});

/* ── Toolbar ─────────────────────────────── */
document.querySelectorAll('.tb-btn[data-action]').forEach(btn => {
  btn.addEventListener('click', () => applyAction(btn.dataset.action));
});

function applyAction(action) {
  if (action === 'clear') {
    if (editor.value && confirm('Clear the editor?')) {
      editor.value = '';
      debouncedRender();
    }
    return;
  }

  if (action === 'sample') {
    editor.value = SAMPLE_MD;
    debouncedRender();
    editor.focus();
    return;
  }

  const cfg = TOOLBAR_ACTIONS[action];
  if (!cfg) return;

  const start = editor.selectionStart;
  const end   = editor.selectionEnd;
  const sel   = editor.value.slice(start, end);
  let insert, cursorPos;

  if (cfg.insert) {
    // Direct insert (hr, table, codeblock)
    insert = cfg.insert;
    const before = editor.value.slice(0, start);
    const after  = editor.value.slice(end);
    editor.value = before + insert + after;
    cursorPos = start + insert.length;
  } else if (cfg.block) {
    // Block-level: prefix each selected line
    const before  = editor.value.slice(0, start);
    const after   = editor.value.slice(end);
    const lines   = (sel || cfg.placeholder).split('\n');
    insert = lines.map(l => cfg.prefix + l).join('\n');
    editor.value = before + insert + after;
    cursorPos = start + insert.length;
  } else {
    // Inline wrap
    const content = sel || cfg.placeholder;
    insert = cfg.prefix + content + cfg.suffix;
    const before = editor.value.slice(0, start);
    const after  = editor.value.slice(end);
    editor.value = before + insert + after;
    // position cursor to select placeholder if no selection
    if (!sel) {
      const pStart = start + cfg.prefix.length;
      const pEnd   = pStart + cfg.placeholder.length;
      editor.setSelectionRange(pStart, pEnd);
    } else {
      cursorPos = start + insert.length;
    }
  }

  if (cursorPos !== undefined) editor.setSelectionRange(cursorPos, cursorPos);
  editor.focus();
  debouncedRender();
}

/* ── Keyboard Shortcuts ──────────────────── */
editor.addEventListener('keydown', (e) => {
  const mod = e.ctrlKey || e.metaKey;

  if (mod && e.key === 'b') { e.preventDefault(); applyAction('bold'); return; }
  if (mod && e.key === 'i') { e.preventDefault(); applyAction('italic'); return; }
  if (mod && e.key === 'k') { e.preventDefault(); applyAction('link'); return; }
  if (mod && e.key === '1') { e.preventDefault(); applyAction('h1'); return; }
  if (mod && e.key === '2') { e.preventDefault(); applyAction('h2'); return; }
  if (mod && e.key === '3') { e.preventDefault(); applyAction('h3'); return; }

  // Tab → insert 2 spaces
  if (e.key === 'Tab') {
    e.preventDefault();
    const start = editor.selectionStart;
    const end   = editor.selectionEnd;
    editor.value = editor.value.slice(0, start) + '  ' + editor.value.slice(end);
    editor.setSelectionRange(start + 2, start + 2);
    debouncedRender();
    return;
  }

  // Enter → auto-continue list items
  if (e.key === 'Enter') {
    const start = editor.selectionStart;
    const lineStart = editor.value.lastIndexOf('\n', start - 1) + 1;
    const currentLine = editor.value.slice(lineStart, start);

    const ulMatch = currentLine.match(/^([ \t]*)[-*+]\s/);
    const olMatch = currentLine.match(/^([ \t]*)(\d+)\.\s/);

    if (ulMatch) {
      if (currentLine.trim() === '-' || currentLine.trim() === '*' || currentLine.trim() === '+') {
        // Empty list item — break out
        return;
      }
      e.preventDefault();
      const prefix = ulMatch[0];
      const insert = '\n' + prefix;
      editor.value = editor.value.slice(0, start) + insert + editor.value.slice(start);
      editor.setSelectionRange(start + insert.length, start + insert.length);
      debouncedRender();
      return;
    }

    if (olMatch) {
      if (currentLine.trim() === olMatch[2] + '.') return;
      e.preventDefault();
      const nextNum = parseInt(olMatch[2]) + 1;
      const prefix = olMatch[1] + nextNum + '. ';
      const insert = '\n' + prefix;
      editor.value = editor.value.slice(0, start) + insert + editor.value.slice(start);
      editor.setSelectionRange(start + insert.length, start + insert.length);
      debouncedRender();
    }
  }
});

/* ── View Modes ──────────────────────────── */
document.querySelectorAll('.view-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const view = btn.dataset.view;
    state.viewMode = view;
    editorShell.className = 'editor-shell';
    if (view !== 'split') editorShell.classList.add('view-' + view);
  });
});

/* ── Resize Handle ───────────────────────── */
let isResizing = false;

resizeHandle.addEventListener('mousedown', (e) => {
  isResizing = true;
  resizeHandle.classList.add('dragging');
  document.body.style.cursor = 'col-resize';
  document.body.style.userSelect = 'none';
  e.preventDefault();
});

document.addEventListener('mousemove', (e) => {
  if (!isResizing) return;
  const shell = editorShell.getBoundingClientRect();
  const pos   = ((e.clientX - shell.left) / shell.width) * 100;
  const clamped = Math.min(75, Math.max(25, pos));
  editorPane.style.flex  = `0 0 ${clamped}%`;
  previewPane.style.flex = `0 0 ${100 - clamped}%`;
});

document.addEventListener('mouseup', () => {
  if (!isResizing) return;
  isResizing = false;
  resizeHandle.classList.remove('dragging');
  document.body.style.cursor = '';
  document.body.style.userSelect = '';
});

/* ── Theme Toggle ────────────────────────── */
$('btn-theme').addEventListener('click', () => {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', state.theme === 'light' ? 'light' : '');
  localStorage.setItem('mkfok-theme', state.theme);
  toast(state.theme === 'light' ? '☀️ Light mode' : '🌙 Dark mode', 'info');
});

/* ── Copy HTML ───────────────────────────── */
$('btn-copy-html').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(preview.innerHTML);
    toast('✅ HTML copied to clipboard!', 'success');
  } catch {
    toast('❌ Could not access clipboard', 'error');
  }
});

/* ── Download Markdown ───────────────────── */
$('btn-download-md').addEventListener('click', () => {
  const content = editor.value;
  if (!content.trim()) { toast('⚠️ Nothing to export', 'error'); return; }
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = 'document.md';
  a.click();
  URL.revokeObjectURL(url);
  toast('📄 Markdown exported!', 'success');
});

/* ── Fullscreen Preview ──────────────────── */
$('btn-fullscreen-preview').addEventListener('click', () => {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    previewPane.requestFullscreen?.();
  }
});

/* ── Toast ───────────────────────────────── */
function toast(message, type = 'info', duration = 2800) {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = message;
  toastContainer.appendChild(el);
  setTimeout(() => {
    el.classList.add('exit');
    el.addEventListener('animationend', () => el.remove());
  }, duration);
}

/* ── localStorage ────────────────────────── */
function saveToStorage() {
  try {
    localStorage.setItem('mkfok-content', editor.value);
  } catch { /* quota exceeded */ }
}

function loadFromStorage() {
  try {
    return localStorage.getItem('mkfok-content');
  } catch { return null; }
}

/* ── Init ────────────────────────────────── */
(function init() {
  // Restore theme
  const savedTheme = localStorage.getItem('mkfok-theme') || 'dark';
  state.theme = savedTheme;
  if (savedTheme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  }

  // Restore content or load sample
  const saved = loadFromStorage();
  editor.value = saved !== null ? saved : SAMPLE_MD;

  // Initial render
  renderPreview();

  // Hook up input event
  editor.addEventListener('input', debouncedRender);

  // Welcome toast
  setTimeout(() => {
    toast('✨ MarkFok ready! Start typing Markdown…', 'info', 3000);
  }, 600);
})();
