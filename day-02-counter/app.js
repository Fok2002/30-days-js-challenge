const countEl = document.getElementById('count');
const decrementBtn = document.getElementById('decrement');
const resetBtn = document.getElementById('reset');
const incrementBtn = document.getElementById('increment');

let value = 0;

function updateDisplay() {
  countEl.textContent = value;
  countEl.style.color = value === 0 ? 'var(--warning)' : 'var(--text)';
}

function increment() {
  value += 1;
  updateDisplay();
}

function decrement() {
  value -= 1;
  updateDisplay();
}

function reset() {
  value = 0;
  updateDisplay();
}

incrementBtn.addEventListener('click', increment);
decrementBtn.addEventListener('click', decrement);
resetBtn.addEventListener('click', reset);

updateDisplay();
