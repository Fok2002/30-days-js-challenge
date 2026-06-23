/**
 * TypeRacer Pro — Day 24: Typing Speed Test
 * Features: WPM, Accuracy, Live Chart, Difficulty Modes, Personal Bests
 */

/* =============================================
   QUOTE BANKS
   ============================================= */
const QUOTES = {
  easy: [
    { text: "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.", category: "Classic" },
    { text: "To be or not to be that is the question whether tis nobler in the mind to suffer.", category: "Literature" },
    { text: "Life is what happens when you are busy making other plans. Keep it simple.", category: "Wisdom" },
    { text: "The only way to do great work is to love what you do. Stay hungry stay foolish.", category: "Inspiration" },
    { text: "In the middle of every difficulty lies opportunity. Never give up on your dreams.", category: "Motivation" },
    { text: "It does not matter how slowly you go as long as you do not stop moving forward.", category: "Wisdom" },
    { text: "The journey of a thousand miles begins with a single step. Take it one day at a time.", category: "Philosophy" },
    { text: "Success is not final failure is not fatal it is the courage to continue that counts.", category: "Inspiration" },
  ],
  medium: [
    { text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.", category: "Programming" },
    { text: "First solve the problem then write the code. Simplicity is the soul of efficiency in software development.", category: "Engineering" },
    { text: "Programs must be written for people to read and only incidentally for machines to execute.", category: "Computer Science" },
    { text: "The best error message is the one that never shows up. Write defensive code and test thoroughly.", category: "Development" },
    { text: "Debugging is twice as hard as writing the code in the first place. Therefore if you write the code as cleverly as possible you are not smart enough to debug it.", category: "Programming" },
    { text: "Talk is cheap. Show me the code. Clean code always looks like it was written by someone who cares.", category: "Engineering" },
    { text: "Software is a great combination between artistry and engineering. Every function tells a story.", category: "Technology" },
    { text: "There are only two kinds of programming languages: the ones people complain about and the ones nobody uses.", category: "Humor" },
  ],
  hard: [
    { text: "The most disastrous thing that you can ever learn is your first programming language. Subsequent languages are easier to acquire but the concepts you internalize in your first language shape how you think about computation.", category: "Advanced" },
    { text: "Premature optimization is the root of all evil. Yet we must not pass it by entirely: approximately 97% of the time we should forget about small efficiencies.", category: "Computer Science" },
    { text: "Object-oriented programming is an exceptionally bad idea which could only have originated in California. Functional programming avoids the complexities of mutable state.", category: "Programming Paradigms" },
    { text: "The purpose of abstracting is not to be vague but to create a new semantic level in which one can be absolutely precise. Abstraction and concreteness must coexist.", category: "Theory" },
    { text: "Algorithmic complexity is the measure of computational resources required. O(n log n) is often the sweet spot between O(n²) brute-force approaches and O(n) specialized solutions.", category: "Algorithms" },
    { text: "Concurrency is about dealing with lots of things at once. Parallelism is about doing lots of things at once. They are related but not the same. A single-threaded program can be concurrent.", category: "Systems" },
    { text: "The von Neumann bottleneck is the limitation of computational speed caused by the instruction fetch-decode-execute cycle accessing shared memory through a limited bandwidth bus.", category: "Architecture" },
  ]
};

/* =============================================
   STATE
   ============================================= */
let state = {
  // Config
  difficulty: 'easy',
  totalTime: 30,

  // Game State
  phase: 'idle', // 'idle' | 'running' | 'done'
  quote: null,
  charIndex: 0,
  totalTyped: 0,
  totalErrors: 0,
  currentErrors: 0, // errors in current word attempt
  streak: 0,
  bestStreak: 0,

  // Timing
  startTime: null,
  elapsed: 0,
  timerInterval: null,
  chartInterval: null,

  // Snapshot tracking
  wpmHistory: [],   // [{time, wpm}] every second

  // Personal Bests (per difficulty+time combo)
  personalBests: {},
};

/* =============================================
   DOM REFERENCES
   ============================================= */
const $ = id => document.getElementById(id);

const DOM = {
  quoteText:      $('quote-text'),
  quoteCategory:  $('quote-category'),
  typingInput:    $('typing-input'),
  inputWrapper:   $('input-wrapper'),
  inputStatus:    $('status-icon'),
  cursorDot:      document.querySelector('.cursor-dot'),

  // Stats
  liveWpm:        $('live-wpm'),
  liveAccuracy:   $('live-accuracy'),
  liveTimer:      $('live-timer'),
  liveStreak:     $('live-streak'),

  // Chart
  chartCapsule:   $('chart-capsule'),
  wpmChart:       $('wpm-chart'),

  // Results
  overlay:        $('results-overlay'),
  resultEmoji:    $('results-emoji'),
  resultTitle:    $('results-title'),
  resultSubtitle: $('results-subtitle'),
  resultWpm:      $('result-wpm'),
  resultAccuracy: $('result-accuracy'),
  resultChars:    $('result-chars'),
  resultErrors:   $('result-errors'),
  resultTime:     $('result-time'),
  resultStreak:   $('result-streak'),
  pbSection:      $('pb-section'),
  pbComparison:   $('pb-comparison'),
  resultChart:    $('result-chart'),

  // Buttons
  restartBtn:     $('restart-btn'),
  newQuoteBtn:    $('new-quote-btn'),
  retryBtn:       $('retry-btn'),
  newTestBtn:     $('new-test-btn'),
};

/* =============================================
   PERSONAL BESTS
   ============================================= */
function pbKey() {
  return `${state.difficulty}_${state.totalTime}`;
}

function loadPBs() {
  try {
    const raw = localStorage.getItem('typeracer_pbs');
    state.personalBests = raw ? JSON.parse(raw) : {};
  } catch { state.personalBests = {}; }
}

function savePBs() {
  try {
    localStorage.setItem('typeracer_pbs', JSON.stringify(state.personalBests));
  } catch {}
}

function getCurrentPB() {
  return state.personalBests[pbKey()] || null;
}

function updatePB(wpm, accuracy) {
  const key = pbKey();
  const current = state.personalBests[key];
  if (!current || wpm > current.wpm) {
    state.personalBests[key] = { wpm, accuracy, date: Date.now() };
    savePBs();
    return true;
  }
  return false;
}

/* =============================================
   QUOTE SELECTION
   ============================================= */
let lastQuoteIndex = -1;

function pickQuote() {
  const pool = QUOTES[state.difficulty];
  let idx;
  do { idx = Math.floor(Math.random() * pool.length); }
  while (idx === lastQuoteIndex && pool.length > 1);
  lastQuoteIndex = idx;
  return pool[idx];
}

/* =============================================
   RENDER QUOTE
   ============================================= */
function renderQuote() {
  const quote = state.quote;
  DOM.quoteText.innerHTML = '';
  DOM.quoteCategory.textContent = quote.category;

  quote.text.split('').forEach((ch, i) => {
    const span = document.createElement('span');
    span.classList.add('char');
    span.textContent = ch;
    span.dataset.index = i;
    if (i === 0) span.classList.add('current');
    DOM.quoteText.appendChild(span);
  });
}

function getCharSpan(index) {
  return DOM.quoteText.querySelector(`[data-index="${index}"]`);
}

/* =============================================
   GAME INIT
   ============================================= */
function initGame(keepQuote = false) {
  clearTimers();

  state.phase        = 'idle';
  state.charIndex    = 0;
  state.totalTyped   = 0;
  state.totalErrors  = 0;
  state.currentErrors = 0;
  state.streak       = 0;
  state.bestStreak   = 0;
  state.startTime    = null;
  state.elapsed      = 0;
  state.wpmHistory   = [];

  if (!keepQuote) state.quote = pickQuote();

  renderQuote();
  resetStats();
  resetInput();
  resetChart();

  DOM.overlay.classList.remove('visible');
  DOM.chartCapsule.classList.remove('active');
  DOM.liveTimer.textContent = state.totalTime;
  DOM.liveTimer.classList.remove('urgent');
}

function resetStats() {
  DOM.liveWpm.textContent = '0';
  DOM.liveAccuracy.textContent = '100';
  DOM.liveTimer.textContent = state.totalTime;
  DOM.liveStreak.textContent = '0';
  DOM.cursorDot.classList.remove('live');
}

function resetInput() {
  DOM.typingInput.value = '';
  DOM.typingInput.disabled = false;
  DOM.typingInput.placeholder = 'Click here and start typing...';
  DOM.inputStatus.textContent = '⌨';
  document.querySelector('.quote-panel').classList.remove('focused');
}

function resetChart() {
  const ctx = DOM.wpmChart.getContext('2d');
  ctx.clearRect(0, 0, DOM.wpmChart.width, DOM.wpmChart.height);
}

/* =============================================
   START GAME
   ============================================= */
function startGame() {
  state.phase     = 'running';
  state.startTime = Date.now();

  DOM.cursorDot.classList.add('live');
  DOM.chartCapsule.classList.add('active');
  document.querySelector('.quote-panel').classList.add('focused');

  // Countdown timer
  state.timerInterval = setInterval(() => {
    state.elapsed = Math.floor((Date.now() - state.startTime) / 1000);
    const remaining = state.totalTime - state.elapsed;

    DOM.liveTimer.textContent = remaining;

    if (remaining <= 5) {
      DOM.liveTimer.classList.add('urgent');
    }

    if (remaining <= 0) {
      finishGame();
    }
  }, 200);

  // WPM snapshot every second for chart
  state.chartInterval = setInterval(() => {
    const sec = Math.floor((Date.now() - state.startTime) / 1000);
    const wpm = calcWPM();
    state.wpmHistory.push({ time: sec, wpm });
    drawLiveChart();
    animateWPM();
  }, 1000);
}

/* =============================================
   CALC METRICS
   ============================================= */
function calcWPM() {
  if (!state.startTime) return 0;
  const minutes = (Date.now() - state.startTime) / 60000;
  if (minutes <= 0) return 0;
  // Standard: every 5 chars = 1 word
  const words = state.charIndex / 5;
  return Math.round(words / minutes);
}

function calcAccuracy() {
  if (state.totalTyped === 0) return 100;
  return Math.max(0, Math.round(((state.totalTyped - state.totalErrors) / state.totalTyped) * 100));
}

/* =============================================
   INPUT HANDLER
   ============================================= */
DOM.typingInput.addEventListener('focus', () => {
  document.querySelector('.quote-panel').classList.add('focused');
});

DOM.typingInput.addEventListener('blur', () => {
  if (state.phase !== 'running') {
    document.querySelector('.quote-panel').classList.remove('focused');
  }
});

DOM.typingInput.addEventListener('input', handleInput);

function handleInput(e) {
  if (state.phase === 'done') return;

  const inputVal = DOM.typingInput.value;

  // Start on first keypress
  if (state.phase === 'idle' && inputVal.length > 0) {
    startGame();
  }

  if (state.phase !== 'running') return;

  const expectedChar = state.quote.text[state.charIndex];
  const typedChar    = inputVal[inputVal.length - 1];

  if (!typedChar) {
    // Backspace — move back
    if (state.charIndex > 0) {
      state.charIndex--;
      const prev = getCharSpan(state.charIndex);
      if (prev) {
        prev.classList.remove('correct', 'incorrect');
        // Re-set current
        const cur = getCharSpan(state.charIndex + 1);
        if (cur) cur.classList.remove('current');
        prev.classList.add('current');
      }
    }
    DOM.typingInput.value = '';
    updateLiveStats();
    return;
  }

  // Clear input for next char
  DOM.typingInput.value = '';

  state.totalTyped++;

  const curSpan = getCharSpan(state.charIndex);

  if (typedChar === expectedChar) {
    // Correct
    curSpan.classList.remove('current', 'incorrect');
    curSpan.classList.add('correct');
    state.streak++;
    if (state.streak > state.bestStreak) state.bestStreak = state.streak;
    state.charIndex++;

    // Move current marker
    const next = getCharSpan(state.charIndex);
    if (next) {
      next.classList.add('current');
    } else {
      // Completed quote!
      finishGame();
      return;
    }
    DOM.inputStatus.textContent = '✅';
  } else {
    // Incorrect
    curSpan.classList.add('incorrect');
    state.totalErrors++;
    state.streak = 0;
    shakeInput();
    DOM.inputStatus.textContent = '❌';
    setTimeout(() => {
      if (state.phase === 'running') DOM.inputStatus.textContent = '⌨';
    }, 500);
  }

  // Scroll current char into view
  const currentSpan = getCharSpan(state.charIndex);
  if (currentSpan) currentSpan.scrollIntoView({ block: 'nearest' });

  updateLiveStats();
}

function shakeInput() {
  DOM.typingInput.classList.remove('error-shake');
  // Force reflow
  void DOM.typingInput.offsetWidth;
  DOM.typingInput.classList.add('error-shake');
}

function updateLiveStats() {
  const wpm = calcWPM();
  const acc = calcAccuracy();

  DOM.liveWpm.textContent = wpm;
  DOM.liveAccuracy.textContent = acc;
  DOM.liveStreak.textContent = state.streak;

  // Color accuracy
  if (acc >= 95) {
    DOM.liveAccuracy.style.color = 'var(--accent)';
  } else if (acc >= 80) {
    DOM.liveAccuracy.style.color = 'var(--warning)';
  } else {
    DOM.liveAccuracy.style.color = 'var(--danger)';
  }
}

function animateWPM() {
  DOM.liveWpm.classList.remove('wpm-up');
  void DOM.liveWpm.offsetWidth;
  DOM.liveWpm.classList.add('wpm-up');
}

/* =============================================
   FINISH GAME
   ============================================= */
function finishGame() {
  state.phase = 'done';
  clearTimers();

  DOM.typingInput.disabled = true;
  DOM.typingInput.placeholder = '';
  DOM.cursorDot.classList.remove('live');
  DOM.liveTimer.textContent = '0';
  DOM.liveTimer.classList.remove('urgent');

  const finalWPM      = calcWPM();
  const finalAccuracy = calcAccuracy();
  const elapsed       = Math.min(state.elapsed || state.totalTime, state.totalTime);
  const isNewPB       = updatePB(finalWPM, finalAccuracy);
  const prevPB        = isNewPB ? (state.personalBests[pbKey()]
    ? { wpm: state.personalBests[pbKey()].wpm - 0, accuracy: state.personalBests[pbKey()].accuracy } // just saved
    : null) : getCurrentPB();

  // Emit last WPM point
  if (state.startTime) {
    state.wpmHistory.push({ time: elapsed, wpm: finalWPM });
  }

  showResults({ wpm: finalWPM, accuracy: finalAccuracy, elapsed, isNewPB, prevPB });
}

/* =============================================
   RESULTS DISPLAY
   ============================================= */
function showResults({ wpm, accuracy, elapsed, isNewPB }) {
  const { emoji, title, subtitle } = getRating(wpm, accuracy);

  DOM.resultEmoji.textContent    = emoji;
  DOM.resultTitle.textContent    = title;
  DOM.resultSubtitle.textContent = subtitle;
  DOM.resultWpm.textContent      = wpm;
  DOM.resultAccuracy.textContent = `${accuracy}%`;
  DOM.resultChars.textContent    = state.charIndex;
  DOM.resultErrors.textContent   = state.totalErrors;
  DOM.resultTime.textContent     = `${elapsed}s`;
  DOM.resultStreak.textContent   = state.bestStreak;

  // Personal Best
  if (isNewPB) {
    DOM.pbSection.classList.add('visible');
    const pb = state.personalBests[pbKey()];
    DOM.pbComparison.innerHTML = `
      <div>Best WPM<br><span>${wpm}</span></div>
      <div>Best Accuracy<br><span>${accuracy}%</span></div>
    `;
  } else {
    DOM.pbSection.classList.remove('visible');
  }

  drawResultChart();

  setTimeout(() => {
    DOM.overlay.classList.add('visible');
  }, 200);
}

function getRating(wpm, accuracy) {
  if (wpm >= 100 && accuracy >= 95) return { emoji: '🚀', title: 'Speed Demon!',     subtitle: 'Absolutely elite performance — top 1%' };
  if (wpm >= 80  && accuracy >= 90) return { emoji: '⚡', title: 'Lightning Fast!',   subtitle: 'Exceptional speed and precision' };
  if (wpm >= 60  && accuracy >= 85) return { emoji: '🔥', title: 'On Fire!',          subtitle: 'Great speed and solid accuracy' };
  if (wpm >= 45  && accuracy >= 80) return { emoji: '💪', title: 'Solid Typist!',     subtitle: 'Good speed, keep practicing for higher accuracy' };
  if (wpm >= 30  && accuracy >= 75) return { emoji: '👍', title: 'Getting There!',    subtitle: 'You\'re improving — practice makes perfect' };
  if (accuracy < 70)               return { emoji: '🎯', title: 'Focus on Accuracy!', subtitle: 'Slow down a bit, aim for fewer errors' };
  return                                    { emoji: '🌱', title: 'Keep Practicing!',  subtitle: 'Every keystroke counts — you\'ll get faster!' };
}

/* =============================================
   LIVE CHART
   ============================================= */
function drawLiveChart() {
  const canvas = DOM.wpmChart;
  const ctx    = canvas.getContext('2d');
  const W      = canvas.clientWidth  || canvas.width;
  const H      = canvas.clientHeight || canvas.height;
  canvas.width  = W;
  canvas.height = H;

  ctx.clearRect(0, 0, W, H);

  const history = state.wpmHistory;
  if (history.length < 2) return;

  const maxWPM  = Math.max(...history.map(p => p.wpm), 1);
  const padding = 4;

  // Draw gradient area
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, 'rgba(124, 106, 247, 0.45)');
  grad.addColorStop(1, 'rgba(124, 106, 247, 0)');

  ctx.beginPath();
  history.forEach((point, i) => {
    const x = padding + (i / (history.length - 1)) * (W - padding * 2);
    const y = H - padding - (point.wpm / maxWPM) * (H - padding * 2);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.lineTo(W - padding, H);
  ctx.lineTo(padding, H);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Draw line
  ctx.beginPath();
  ctx.strokeStyle = '#7c6af7';
  ctx.lineWidth   = 2;
  ctx.lineJoin    = 'round';
  ctx.lineCap     = 'round';
  history.forEach((point, i) => {
    const x = padding + (i / (history.length - 1)) * (W - padding * 2);
    const y = H - padding - (point.wpm / maxWPM) * (H - padding * 2);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Draw last dot
  const last = history[history.length - 1];
  const lx   = W - padding;
  const ly   = H - padding - (last.wpm / maxWPM) * (H - padding * 2);
  ctx.beginPath();
  ctx.arc(lx, ly, 4, 0, Math.PI * 2);
  ctx.fillStyle = '#7c6af7';
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

/* =============================================
   RESULT CHART
   ============================================= */
function drawResultChart() {
  const canvas = DOM.resultChart;
  const ctx    = canvas.getContext('2d');
  const W      = canvas.clientWidth  || canvas.width;
  const H      = canvas.clientHeight || canvas.height;
  canvas.width  = W;
  canvas.height = H;

  ctx.clearRect(0, 0, W, H);

  const history = state.wpmHistory;
  if (history.length < 2) {
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.font = '13px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Not enough data for chart', W / 2, H / 2);
    return;
  }

  const maxWPM  = Math.max(...history.map(p => p.wpm), 1);
  const padding = { top: 10, right: 10, bottom: 24, left: 36 };
  const chartW  = W - padding.left - padding.right;
  const chartH  = H - padding.top  - padding.bottom;

  // Y-axis grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth   = 1;
  [0, 0.25, 0.5, 0.75, 1].forEach(t => {
    const y = padding.top + chartH - t * chartH;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(W - padding.right, y);
    ctx.stroke();

    // Y labels
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.font      = '10px JetBrains Mono, monospace';
    ctx.textAlign = 'right';
    ctx.fillText(Math.round(maxWPM * t), padding.left - 4, y + 4);
  });

  // X-axis labels
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.font      = '10px JetBrains Mono, monospace';
  ctx.textAlign = 'center';
  const step = Math.max(1, Math.floor(history.length / 5));
  history.forEach((point, i) => {
    if (i % step === 0 || i === history.length - 1) {
      const x = padding.left + (i / (history.length - 1)) * chartW;
      ctx.fillText(`${point.time}s`, x, H - 6);
    }
  });

  // Fill area
  const grad = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
  grad.addColorStop(0, 'rgba(124, 106, 247, 0.5)');
  grad.addColorStop(1, 'rgba(124, 106, 247, 0)');

  ctx.beginPath();
  history.forEach((point, i) => {
    const x = padding.left + (i / (history.length - 1)) * chartW;
    const y = padding.top  + chartH - (point.wpm / maxWPM) * chartH;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.lineTo(padding.left + chartW, padding.top + chartH);
  ctx.lineTo(padding.left, padding.top + chartH);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Line
  ctx.beginPath();
  ctx.strokeStyle = '#7c6af7';
  ctx.lineWidth   = 2.5;
  ctx.lineJoin    = 'round';
  ctx.lineCap     = 'round';
  history.forEach((point, i) => {
    const x = padding.left + (i / (history.length - 1)) * chartW;
    const y = padding.top  + chartH - (point.wpm / maxWPM) * chartH;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Data point dots
  history.forEach((point, i) => {
    const x = padding.left + (i / (history.length - 1)) * chartW;
    const y = padding.top  + chartH - (point.wpm / maxWPM) * chartH;
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fillStyle   = '#7c6af7';
    ctx.fill();
    ctx.strokeStyle = 'var(--bg-surface)';
    ctx.lineWidth   = 1.5;
    ctx.stroke();
  });
}

/* =============================================
   TIMER CLEANUP
   ============================================= */
function clearTimers() {
  clearInterval(state.timerInterval);
  clearInterval(state.chartInterval);
  state.timerInterval = null;
  state.chartInterval = null;
}

/* =============================================
   DIFFICULTY CONTROLS
   ============================================= */
document.querySelectorAll('.diff-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.difficulty = btn.dataset.difficulty;
    initGame(false);
  });
});

/* =============================================
   TIME CONTROLS
   ============================================= */
document.querySelectorAll('.time-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.totalTime = parseInt(btn.dataset.time, 10);
    initGame(true);
  });
});

/* =============================================
   BUTTON CONTROLS
   ============================================= */
DOM.restartBtn.addEventListener('click', () => initGame(true));
DOM.newQuoteBtn.addEventListener('click', () => initGame(false));
DOM.retryBtn.addEventListener('click', () => initGame(true));
DOM.newTestBtn.addEventListener('click', () => initGame(false));

/* =============================================
   KEYBOARD SHORTCUTS
   ============================================= */
document.addEventListener('keydown', e => {
  // Tab + Enter to restart
  if (e.key === 'Enter' && e.target === DOM.typingInput) {
    if (state.phase === 'done') initGame(true);
  }
  // Escape to reset
  if (e.key === 'Escape') {
    initGame(true);
    DOM.typingInput.focus();
  }
  // Tab to focus input
  if (e.key === 'Tab') {
    e.preventDefault();
    DOM.typingInput.focus();
  }
});

/* =============================================
   CLICK TO FOCUS
   ============================================= */
DOM.quoteText.addEventListener('click', () => {
  if (state.phase !== 'done') DOM.typingInput.focus();
});

/* =============================================
   RESIZE — redraw chart
   ============================================= */
window.addEventListener('resize', () => {
  if (state.phase === 'running') drawLiveChart();
});

/* =============================================
   BOOT
   ============================================= */
loadPBs();
initGame(false);

// Auto-focus input after slight delay
setTimeout(() => DOM.typingInput.focus(), 300);
