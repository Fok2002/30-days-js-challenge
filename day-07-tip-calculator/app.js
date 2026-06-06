const billInput = document.getElementById('billAmount');
const tipInput = document.getElementById('tipPercent');
const totalAmount = document.getElementById('totalAmount');
const calculateBtn = document.getElementById('calculateBtn');

function formatCurrency(value) {
  return `$${value.toFixed(2)}`;
}

function calculateTotal() {
  const billValue = parseFloat(billInput.value) || 0;
  const tipValue = parseFloat(tipInput.value) || 0;
  const tipRate = Math.max(tipValue, 0) / 100;
  const total = billValue + billValue * tipRate;

  totalAmount.textContent = formatCurrency(total);
}

calculateBtn.addEventListener('click', calculateTotal);

[billInput, tipInput].forEach((input) => {
  input.addEventListener('input', calculateTotal);
});

window.addEventListener('DOMContentLoaded', calculateTotal);
