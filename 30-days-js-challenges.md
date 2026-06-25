# 30 Days JavaScript Mini Challenges

A daily vanilla JS challenge series to sharpen your skills.

---

 Day 1 — To-Do List

Goal:Build a functional To-Do List app using only vanilla JavaScript (no libraries, no frameworks).

Features to implement:
- [ ] Add a new task by typing in an input and pressing Enter or clicking a button
- [ ] Display all tasks in a list
- [ ] Mark a task as complete (toggle done/undone with a checkbox or click)
- [ ] Delete a task
- [ ] Filter tasks: All / Active / Completed
- [ ] Persist tasks in `localStorage` so they survive page refresh

Concepts practiced:
- DOM manipulation (`createElement`, `appendChild`, `querySelector`)
- Event listeners (`click`, `keydown`)
- Array methods (`filter`, `map`, `find`)
- `localStorage` (`getItem`, `setItem`, `JSON.parse`, `JSON.stringify`)

Starter file structure:
```
day-01-todo/
├── index.html
├── style.css
└── app.js
```

Stretch goals:
- Edit an existing task inline
- Drag-and-drop to reorder tasks
- Task count badge ("3 items left")

---

 Day 2 — Counter App

Goal: Build a responsive counter with increment, decrement, and reset controls.

Features to implement:
- [x] Render a current count value
- [x] Increment and decrement the counter
- [x] Reset the value to zero
- [ ] Add color or animation feedback for changes

Concepts practiced:
- Event listeners
- DOM updates
- State management in vanilla JS

Starter file structure:
```
day-02-counter/
├── index.html
├── style.css
└── app.js
```

---

 Day 3 — Digital Clock

Goal: Build a live digital clock with an AM/PM toggle and session lifetime display.

Features to implement:
- [ ] Display the current time and date live
- [ ] Add a button to switch between 12-hour and 24-hour time formats
- [ ] Show how long the clock has been running since page load
- [ ] Keep the UI polished with a modern card layout

Concepts practiced:
- `setInterval` for live updates
- Date and time formatting
- Toggle state with button interaction
- Responsive styling

Starter file structure:
```
day-03-clock/
├── index.html
├── style.css
└── app.js
```

---

## Day 4 — Color Picker

Goal: Build a button-driven color picker that changes the background and displays the current hex code.

Features to implement:
- [ ] Generate a random hex color when the button is clicked
- [ ] Change the card background to the selected color
- [ ] Display the color hex code in the UI
- [ ] Adjust text contrast so the label stays readable

Concepts practiced:
- DOM manipulation and event listeners
- Working with random numbers and hex color formatting
- Dynamic styling with JavaScript
- Accessibility via contrast-aware text

Starter file structure:
```
day-04-color-picker/
├── index.html
├── style.css
└── app.js
```

---

Day 5 — TBD

Coming soon...

---

Day 8 — BMI Calculator

Goal: Build a BMI calculator that converts height and weight into a BMI score, then shows the matching health category.

Features to implement:
- [ ] Input height in centimeters and weight in kilograms
- [ ] Compute BMI with `BMI = weight / (height / 100)^2`
- [ ] Render the BMI value with one decimal place
- [ ] Display a category label: Underweight, Normal weight, Overweight, or Obesity
- [ ] Update results live while typing and on button press

Concepts practiced:
- Form inputs and validation
- Numeric calculations and conditional logic
- DOM updates with live feedback
- Responsive layout and result styling

Starter file structure:
```
day-08-bmi-calculator/
├── index.html
├── style.css
└── app.js
```

---

## Day 6 — TBD

coming soon...

---

Day 7 — TBD

Coming soon...

---

Day 8 — TBD

Coming soon...

---

Day 9 — Password Generator

Goal: Build a customizable password generator that lets the user choose length and include numbers and symbols.

Features to implement:
- [ ] Choose password length with a slider or number input
- [ ] Optionally include uppercase letters, numbers, and symbols
- [ ] Generate a secure password on demand
- [ ] Display the result in a readonly field and make it easy to copy

Concepts practiced:
- String manipulation and random selection
- Form controls and event handling
- Clipboard interaction
- Dynamic UI updates

Starter file structure:
```
day-09-password-generator/
├── index.html
├── style.css
└── app.js
```

---

Day 10 — TBD

Coming soon...

---

Day 11 — Flashcards

Goal: Build a flashcard app where clicking a card flips it to reveal the definition.

Features to implement:
- [ ] Render a set of cards with a term on the front and a definition on the back
- [ ] Flip a card when clicked, and allow keyboard interaction via Enter/Space
- [ ] Use CSS transforms to animate the flip
- [ ] Keep the UI clean and responsive for mobile screens

Concepts practiced:
- CSS 3D transforms and transitions
- DOM event handling with click and keyboard events
- Accessible interactive components
- Card layout and responsive grids

Starter file structure:
```
day-11-flashcards/
├── index.html
├── style.css
└── app.js
```

---

Day 12 — TBD

Coming soon...

---

Day 13 — TBD

Coming soon...

---

Day 14 — Random Quote Generator

Goal: Build an inspirational quote card that shows a random quote on demand and lets the user copy it to the clipboard.

Features to implement:
- [x] Show a random quote with author text
- [x] Add a “New Quote” button to load a different quote
- [x] Add a “Copy” button to copy the quote and author text
- [ ] Show a temporary confirmation message after copying

Concepts practiced:
- Arrays and random selection
- DOM updates and event handling
- Clipboard API interaction
- UI feedback and card styling

Starter file structure:
```
day-14-random-quote-generator/
├── index.html
├── style.css
└── app.js
```

---

Day 15 — TBD

Coming soon...

---

Day 16 — TBD

Coming soon...

---

Day 17 — TBD

Coming soon...

---

Day 18 — Form Validation

Goal: Build a form that validates email input, shows live password strength, and renders inline error messages.

Features to implement:
- [x] Validate email formatting with live feedback
- [x] Show a password strength meter updated while typing
- [x] Mark password requirements as they are met
- [x] Display submission feedback and prevent invalid form submission

Concepts practiced:
- Form validation and input events
- Regular expressions for email/password rules
- Dynamic UI updates with DOM manipulation
- User feedback for form errors and success states

Starter file structure:
```
day-18-form-validation/
├── index.html
├── style.css
└── app.js
```

---

Day 19 — TBD

Coming soon...

---

Day 20 — TBD

Coming soon...

Day 21 — Countdown Timer

Goal: Build a responsive countdown timer where users can set durations in minutes, see active visual feedback, and receive notifications when done.

Features to implement:
- [x] Set custom timer duration in minutes
- [x] Visual countdown timer (MM:SS) with an animated circular progress ring
- [x] Start, pause, resume, and reset controls
- [x] Audio alarm and visual alert overlay when the timer hits zero
- [x] Dynamic tab title updating with remaining time

Concepts practiced:
- SVG circular stroke alignment and mathematical offsets
- Web Audio API for custom sound wave synthesis
- State machine management (running, paused, finished)
- Event loop and cleanup with `setInterval`
- Modal dialog overlays and accessibility

Starter file structure:
```
day-21-countdown-timer/
├── index.html
├── style.css
└── app.js
```

---

Day 22 — Drag & Drop To-Do Board

Goal: Build a highly responsive, polished drag-and-drop to-do board (Kanban board) with reorderable tasks and columns.

Features to implement:
- [x] Create a Kanban board layout with To Do, In Progress, and Completed columns
- [x] Add tasks with custom title, details description, priority level, and tags
- [x] Drag and drop tasks to reorder them within a column or change their status across columns
- [x] Implement touch event listeners to simulate drag and drop on mobile devices
- [x] Filter tasks dynamically via a search bar in real-time
- [x] Persist task list and placement order using `localStorage`

Concepts practiced:
- HTML5 Drag and Drop API (`dragstart`, `dragover`, `drop`, `dragend`)
- Touch Event Simulation (`touchstart`, `touchmove`, `touchend`)
- Dynamic DOM positioning and vertical insert coordinate calculation
- Search query filtering and custom empty-state renderings
- High-fidelity glassmorphism CSS styling and transitions

Starter file structure:
```
day-22-drag-drop-todo/
├── index.html
├── style.css
└── app.js
```

---

Day 23 — Snake Game

Goal: Build a retro-arcade-inspired Snake Game with basic keyboard/WASD controls, persistent high scores, dynamic sound effects, and clean visual feedback.

Features to implement:
- [x] Retro arcade-style game board with custom Canvas grid layout
- [x] Snake movement with basic keyboard arrow keys and WASD inputs
- [x] Smooth collision detection (self-collision and boundary collisions)
- [x] Food spawning logic with check to prevent spawning on the snake's body
- [x] Real-time current score tracking and local storage high score persistence
- [x] Start, Pause, Resume, and Game Over overlays
- [x] Visual feedback such as glowing effects and particle bursts when eating food
- [x] Synthesized sound effects (eat beep, collision, game start) via Web Audio API

Concepts practiced:
- Canvas 2D context drawing (`fillRect`, `arc`, paths, dropshadow/glow effects)
- Keyboard event listener handling with scroll prevention
- Dynamic game loop timing (delta time logic for independent speed)
- Web Audio API for custom sound wave synthesis
- Particle emitter math for visual effect burst animations

Starter file structure:
```
day-23-snake-game/
├── index.html
├── style.css
└── app.js
```

---

Day 24 — TBD

Coming soon...

---

Day 25 — Markdown Previewer

Goal: Build a live Markdown editor with split-pane preview, toolbar shortcuts, real-time stats, and export options.

Features to implement:
- [x] Custom Markdown → HTML parser built from scratch (no libraries)
- [x] Real-time split-pane preview with 80ms debounce
- [x] Rich toolbar: headings, bold, italic, links, images, lists, tables, code blocks
- [x] Keyboard shortcuts: Ctrl+B, Ctrl+I, Ctrl+K, Tab indent, smart list continuation
- [x] Resizable split pane via drag handle
- [x] View modes: split / editor-only / preview-only
- [x] Live stats: word count, char count, lines, reading time
- [x] Light / dark theme toggle with localStorage persistence
- [x] Copy rendered HTML to clipboard
- [x] Export Markdown as `.md` file download
- [x] Line numbers panel synchronized with editor scroll
- [x] Toast notification system

Concepts practiced:
- Custom recursive Markdown parser with regex pipelines
- Debounced `input` events for live preview
- CSS custom properties and dark/light theme switching
- Drag-based resize with `mousemove` / `mouseup` listeners
- Clipboard API and Blob download API
- `localStorage` for content and theme persistence

Starter file structure:
```
day-25-markdown-previewer/
├── index.html
├── style.css
└── app.js
```

---

Day 26 — TBD

Coming soon...

---

Day 27 — TBD

Coming soon...

---

Day 28 — TBD

Coming soon...

---

Day 29 — TBD

Coming soon...

---

Day 30 — TBD

Coming soon...
