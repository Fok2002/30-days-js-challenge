const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const emailError = document.getElementById('email-error');
const passwordError = document.getElementById('password-error');
const strengthFill = document.getElementById('strength-fill');
const strengthText = document.getElementById('strength-text');
const requirementsList = document.getElementById('password-requirements');
const formFeedback = document.getElementById('form-feedback');
const form = document.querySelector('.form');

const passwordRequirements = [
    {
        key: 'length',
        test: password => password.length >= 8,
        label: 'At least 8 characters',
    },
    {
        key: 'lowercase',
        test: password => /[a-z]/.test(password),
        label: 'One lowercase letter',
    },
    {
        key: 'uppercase',
        test: password => /[A-Z]/.test(password),
        label: 'One uppercase letter',
    },
    {
        key: 'number',
        test: password => /[0-9]/.test(password),
        label: 'One number',
    },
    {
        key: 'special',
        test: password => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
        label: 'One special character',
    },
];

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email) {
    return emailPattern.test(email.trim());
}

function getPasswordValidity(password) {
    return passwordRequirements.map(req => ({
        key: req.key,
        valid: req.test(password),
    }));
}

function getStrengthLevel(password) {
    const validItems = getPasswordValidity(password).filter(item => item.valid).length;

    if (password.length === 0) {
        return { score: 0, label: 'Too weak', color: '#ff5e62' };
    }

    if (validItems <= 2) {
        return { score: 40, label: 'Weak', color: '#ff5e62' };
    }

    if (validItems === 3 || validItems === 4) {
        return { score: 70, label: 'Medium', color: '#f7b500' };
    }

    return { score: 100, label: 'Strong', color: '#2f9f68' };
}

function updatePasswordStrength(password) {
    const { score, label, color } = getStrengthLevel(password);
    strengthFill.style.width = `${score}%`;
    strengthFill.style.background = `linear-gradient(90deg, ${color} 0%, ${shadeColor(color, -20)} 100%)`;
    strengthText.textContent = label;
    strengthText.style.color = color;

    const validity = getPasswordValidity(password);
    requirementsList.querySelectorAll('li').forEach(li => {
        const key = li.dataset.req;
        const valid = validity.find(item => item.key === key)?.valid;
        li.classList.toggle('valid', valid);
    });
}

function shadeColor(color, percent) {
    const hex = color.replace('#', '');
    const num = parseInt(hex, 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + percent));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + percent));
    const b = Math.min(255, Math.max(0, (num & 0x0000ff) + percent));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function showError(element, message) {
    element.textContent = message;
}

function clearError(element) {
    element.textContent = '';
}

function validateForm() {
    let isValid = true;
    const emailValue = emailInput.value.trim();
    const passwordValue = passwordInput.value;

    if (!emailValue) {
        showError(emailError, 'Email is required.');
        isValid = false;
    } else if (!validateEmail(emailValue)) {
        showError(emailError, 'Enter a valid email address.');
        isValid = false;
    } else {
        clearError(emailError);
    }

    const passwordValidity = getPasswordValidity(passwordValue);
    const allPasswordValid = passwordValidity.every(item => item.valid);

    if (!passwordValue) {
        showError(passwordError, 'Password is required.');
        isValid = false;
    } else if (!allPasswordValid) {
        showError(passwordError, 'Use a stronger password by completing all requirements.');
        isValid = false;
    } else {
        clearError(passwordError);
    }

    return isValid;
}

emailInput.addEventListener('input', () => {
    const value = emailInput.value;
    if (!value) {
        showError(emailError, 'Email is required.');
    } else if (!validateEmail(value)) {
        showError(emailError, 'Enter a valid email address.');
    } else {
        clearError(emailError);
    }
    formFeedback.textContent = '';
    formFeedback.className = 'form-feedback';
});

passwordInput.addEventListener('input', () => {
    updatePasswordStrength(passwordInput.value);
    const value = passwordInput.value;

    if (!value) {
        showError(passwordError, 'Password is required.');
    } else {
        const validItems = getPasswordValidity(value).filter(item => item.valid).length;
        if (validItems < passwordRequirements.length) {
            showError(passwordError, 'Use a stronger password by completing all requirements.');
        } else {
            clearError(passwordError);
        }
    }
    formFeedback.textContent = '';
    formFeedback.className = 'form-feedback';
});

form.addEventListener('submit', event => {
    event.preventDefault();
    const isFormValid = validateForm();

    if (isFormValid) {
        formFeedback.textContent = 'Your information is valid! Form submitted successfully.';
        formFeedback.className = 'form-feedback success';
        form.reset();
        updatePasswordStrength('');
    } else {
        formFeedback.textContent = 'Please fix the highlighted fields to continue.';
        formFeedback.className = 'form-feedback error';
    }
});

// Initialize the strength UI with empty state.
updatePasswordStrength('');
