const heightInput = document.getElementById('heightInput');
const weightInput = document.getElementById('weightInput');
const bmiValue = document.getElementById('bmiValue');
const bmiCategory = document.getElementById('bmiCategory');
const calculateBtn = document.getElementById('calculateBtn');

function calculateBMI() {
  const heightCm = parseFloat(heightInput.value) || 0;
  const weightKg = parseFloat(weightInput.value) || 0;
  const heightM = heightCm / 100;

  if (heightM <= 0 || weightKg <= 0) {
    bmiValue.textContent = '0.0';
    bmiCategory.textContent = 'Enter values';
    bmiCategory.className = '';
    return;
  }

  const bmi = weightKg / (heightM * heightM);
  const roundedBmi = bmi.toFixed(1);
  const category = getBMICategory(bmi);

  bmiValue.textContent = roundedBmi;
  bmiCategory.textContent = category.label;
  bmiCategory.className = category.class;
}

function getBMICategory(bmi) {
  if (bmi < 18.5) {
    return { label: 'Underweight', class: 'category-underweight' };
  }

  if (bmi < 25) {
    return { label: 'Normal weight', class: 'category-normal' };
  }

  if (bmi < 30) {
    return { label: 'Overweight', class: 'category-overweight' };
  }

  return { label: 'Obesity', class: 'category-obese' };
}

calculateBtn.addEventListener('click', calculateBMI);
[heightInput, weightInput].forEach((input) => {
  input.addEventListener('input', calculateBMI);
});

window.addEventListener('DOMContentLoaded', calculateBMI);
