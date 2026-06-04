const colorCard = document.getElementById('colorCard');
const colorCode = document.getElementById('colorCode');
const changeColorBtn = document.getElementById('changeColorBtn');

function generateHexColor() {
  const randomValue = Math.floor(Math.random() * 0xffffff);
  return `#${randomValue.toString(16).padStart(6, '0').toUpperCase()}`;
}

function applyColor() {
  const hex = generateHexColor();
  colorCode.textContent = hex;
  colorCard.style.backgroundColor = hex;

  const textColor = getContrastColor(hex);
  colorCard.style.color = textColor;
}

function getContrastColor(hex) {
  const value = parseInt(hex.slice(1), 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 140 ? '#1b2445' : '#ffffff';
}

changeColorBtn.addEventListener('click', applyColor);

window.addEventListener('DOMContentLoaded', applyColor);
