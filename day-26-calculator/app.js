const display = document.getElementById('display');
const expression = document.getElementById('expression');
const keypad = document.querySelector('.keypad');

const state = {
  current: '0',
  previous: null,
  operator: null,
  waitingForOperand: false,
  justEvaluated: false,
};

function updateDisplay() {
  display.textContent = formatNumber(state.current);
  adaptFontSize(state.current.length);

  if (state.operator && state.previous !== null) {
    expression.textContent = `${formatNumber(state.previous)} ${state.operator}`;
  } else {
    expression.textContent = ' ';
  }

  document.querySelectorAll('.btn-op').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.value === state.operator && state.waitingForOperand);
  });
}

function formatNumber(str) {
  if (str === 'Error') return 'Error';
  const [int, dec] = str.split('.');
  const formatted = Number(int).toLocaleString('en-US');
  return dec !== undefined ? `${formatted}.${dec}` : formatted;
}

function adaptFontSize(len) {
  if (len > 12) display.style.fontSize = '1.6rem';
  else if (len > 9) display.style.fontSize = '2rem';
  else display.style.fontSize = '';
}

function inputDigit(digit) {
  if (state.justEvaluated) {
    state.current = digit;
    state.justEvaluated = false;
  } else if (state.waitingForOperand) {
    state.current = digit;
    state.waitingForOperand = false;
  } else {
    state.current = state.current === '0' ? digit : state.current + digit;
  }
}

function inputDecimal() {
  if (state.justEvaluated || state.waitingForOperand) {
    state.current = '0.';
    state.waitingForOperand = false;
    state.justEvaluated = false;
    return;
  }
  if (!state.current.includes('.')) {
    state.current += '.';
  }
}

function setOperator(op) {
  const value = parseFloat(state.current);

  if (state.operator && !state.waitingForOperand) {
    const result = calculate(parseFloat(state.previous), value, state.operator);
    if (result === null) { handleError(); return; }
    state.current = String(result);
    state.previous = String(result);
  } else {
    state.previous = state.current;
  }

  state.operator = op;
  state.waitingForOperand = true;
  state.justEvaluated = false;
}

function equals() {
  if (state.operator === null || state.previous === null) return;
  const a = parseFloat(state.previous);
  const b = parseFloat(state.current);
  const result = calculate(a, b, state.operator);
  if (result === null) { handleError(); return; }

  expression.textContent = `${formatNumber(state.previous)} ${state.operator} ${formatNumber(state.current)} =`;
  state.current = String(result);
  state.previous = null;
  state.operator = null;
  state.waitingForOperand = false;
  state.justEvaluated = true;
}

function calculate(a, b, op) {
  switch (op) {
    case '+': return round(a + b);
    case '−': return round(a - b);
    case '×': return round(a * b);
    case '÷': return b === 0 ? null : round(a / b);
  }
  return null;
}

function round(n) {
  return Math.round(n * 1e10) / 1e10;
}

function handleError() {
  state.current = 'Error';
  state.previous = null;
  state.operator = null;
  state.waitingForOperand = false;
  state.justEvaluated = true;
}

function clear() {
  state.current = '0';
  state.previous = null;
  state.operator = null;
  state.waitingForOperand = false;
  state.justEvaluated = false;
}

function toggleSign() {
  if (state.current === '0' || state.current === 'Error') return;
  state.current = state.current.startsWith('-')
    ? state.current.slice(1)
    : '-' + state.current;
}

function percent() {
  const value = parseFloat(state.current);
  if (isNaN(value)) return;
  if (state.previous !== null && state.operator) {
    state.current = String(round(parseFloat(state.previous) * value / 100));
  } else {
    state.current = String(round(value / 100));
  }
  state.justEvaluated = true;
}

function backspace() {
  if (state.justEvaluated || state.waitingForOperand) return;
  if (state.current.length <= 1 || (state.current.startsWith('-') && state.current.length === 2)) {
    state.current = '0';
  } else {
    state.current = state.current.slice(0, -1);
  }
}

// ── Click handler ──
keypad.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn');
  if (!btn) return;

  const { action, value } = btn.dataset;

  switch (action) {
    case 'digit':    inputDigit(value); break;
    case 'decimal':  inputDecimal(); break;
    case 'operator': setOperator(value); break;
    case 'equals':   equals(); break;
    case 'clear':    clear(); break;
    case 'toggle-sign': toggleSign(); break;
    case 'percent':  percent(); break;
  }

  updateDisplay();
});

// ── Keyboard handler ──
const KEY_MAP = {
  '0': () => inputDigit('0'),
  '1': () => inputDigit('1'),
  '2': () => inputDigit('2'),
  '3': () => inputDigit('3'),
  '4': () => inputDigit('4'),
  '5': () => inputDigit('5'),
  '6': () => inputDigit('6'),
  '7': () => inputDigit('7'),
  '8': () => inputDigit('8'),
  '9': () => inputDigit('9'),
  '.': () => inputDecimal(),
  ',': () => inputDecimal(),
  '+': () => setOperator('+'),
  '-': () => setOperator('−'),
  '*': () => setOperator('×'),
  '/': () => setOperator('÷'),
  'Enter': () => equals(),
  '=': () => equals(),
  'Backspace': () => backspace(),
  'Escape': () => clear(),
  'Delete': () => clear(),
  '%': () => percent(),
};

document.addEventListener('keydown', (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const handler = KEY_MAP[e.key];
  if (!handler) return;
  e.preventDefault();
  handler();
  updateDisplay();

  // flash the matching button for visual feedback
  const opMap = { '+': '+', '-': '−', '*': '×', '/': '÷' };
  const displayKey = opMap[e.key] ?? e.key;
  const btn = keypad.querySelector(`[data-value="${displayKey}"]`)
    ?? keypad.querySelector(`[data-action="${
      e.key === 'Escape' || e.key === 'Delete' ? 'clear'
      : e.key === 'Enter' || e.key === '=' ? 'equals'
      : e.key === 'Backspace' ? ''
      : ''
    }"]`);

  if (btn) {
    btn.classList.add('key-flash');
    btn.addEventListener('animationend', () => btn.classList.remove('key-flash'), { once: true });
  }
});

updateDisplay();
