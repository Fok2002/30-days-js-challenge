const passwordOutput = document.getElementById('passwordOutput');
const lengthRange = document.getElementById('lengthRange');
const lengthValue = document.getElementById('lengthValue');
const includeUppercase = document.getElementById('includeUppercase');
const includeNumbers = document.getElementById('includeNumbers');
const includeSymbols = document.getElementById('includeSymbols');
const passwordForm = document.getElementById('passwordForm');
const copyBtn = document.getElementById('copyBtn');

const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()-_=+[]{}|;:,.<>?/~`';

function updateLengthDisplay() {
  lengthValue.textContent = lengthRange.value;
}

function getSelectedCharset() {
  let charset = LOWERCASE;

  if (includeUppercase.checked) {
    charset += UPPERCASE;
  }

  if (includeNumbers.checked) {
    charset += NUMBERS;
  }

  if (includeSymbols.checked) {
    charset += SYMBOLS;
  }

  return charset;
}

function generatePassword() {
  const length = Number(lengthRange.value);
  const charset = getSelectedCharset();

  if (!charset.length) {
    return '';
  }

  const passwordChars = [];
  const requiredSets = [];

  if (includeUppercase.checked) requiredSets.push(UPPERCASE);
  if (includeNumbers.checked) requiredSets.push(NUMBERS);
  if (includeSymbols.checked) requiredSets.push(SYMBOLS);

  // Ensure at least one character from each selected group
  requiredSets.forEach((set) => {
    passwordChars.push(set[Math.floor(Math.random() * set.length)]);
  });

  while (passwordChars.length < length) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    passwordChars.push(charset[randomIndex]);
  }

  return shuffleArray(passwordChars).join('');
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function handleGenerate(event) {
  event.preventDefault();
  const password = generatePassword();
  passwordOutput.value = password;
}

async function handleCopy() {
  if (!passwordOutput.value) {
    return;
  }

  try {
    await navigator.clipboard.writeText(passwordOutput.value);
    copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      copyBtn.textContent = 'Copy';
    }, 1500);
  } catch (error) {
    passwordOutput.select();
    document.execCommand('copy');
  }
}

lengthRange.addEventListener('input', updateLengthDisplay);
passwordForm.addEventListener('submit', handleGenerate);
copyBtn.addEventListener('click', handleCopy);

window.addEventListener('DOMContentLoaded', () => {
  updateLengthDisplay();
  passwordOutput.value = generatePassword();
});
