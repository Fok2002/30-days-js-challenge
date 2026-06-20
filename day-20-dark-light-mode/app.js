// Dark/Light Mode Toggle with localStorage

const themeToggle = document.getElementById('themeToggle');
const htmlElement = document.documentElement;
const body = document.body;

const THEME_KEY = 'theme-preference';
const DARK_MODE = 'dark-mode';
const LIGHT_MODE = 'light-mode';

// Initialize theme on page load
function initializeTheme() {
    // Prevent flash of wrong theme
    body.classList.add('no-transition');

    // Check localStorage for saved preference
    const savedTheme = localStorage.getItem(THEME_KEY);

    // Check system preference if no saved preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Determine which theme to use
    const themeToUse = savedTheme || (prefersDark ? DARK_MODE : LIGHT_MODE);

    // Apply the theme
    applyTheme(themeToUse);

    // Re-enable transitions after initial load
    setTimeout(() => {
        body.classList.remove('no-transition');
    }, 0);
}

// Apply theme to the document
function applyTheme(theme) {
    if (theme === DARK_MODE) {
        body.classList.add(DARK_MODE);
        updateToggleButton('☀️');
    } else {
        body.classList.remove(DARK_MODE);
        updateToggleButton('🌙');
    }

    // Save preference to localStorage
    localStorage.setItem(THEME_KEY, theme);
}

// Update the toggle button icon
function updateToggleButton(icon) {
    const iconElement = themeToggle.querySelector('.icon');
    iconElement.textContent = icon;
}

// Toggle theme when button is clicked
themeToggle.addEventListener('click', () => {
    const isDarkMode = body.classList.contains(DARK_MODE);
    const newTheme = isDarkMode ? LIGHT_MODE : DARK_MODE;
    applyTheme(newTheme);
});

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    // Only auto-switch if user hasn't set a preference
    if (!localStorage.getItem(THEME_KEY)) {
        const newTheme = e.matches ? DARK_MODE : LIGHT_MODE;
        applyTheme(newTheme);
    }
});

// Initialize theme when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeTheme);
} else {
    initializeTheme();
}
