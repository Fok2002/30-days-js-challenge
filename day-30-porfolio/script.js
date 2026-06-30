// =====================================================
// 30 Days of JavaScript — build log data
// =====================================================
const REPO = "https://github.com/Fok2002/30-days-js-challenge/tree/master/";

const days = [
  { n: 1,  slug: "day-01-todo",                      name: "To-Do List" },
  { n: 2,  slug: "day-02-counter",                    name: "Counter App" },
  { n: 3,  slug: "day-03-clock",                      name: "Digital Clock" },
  { n: 4,  slug: "day-04-color-picker",                name: "Color Picker" },
  { n: 5,  slug: "day-05-accordion",                   name: "Accordion FAQ" },
  { n: 6,  slug: "day-06-tabs",                        name: "Tabs Component" },
  { n: 7,  slug: "day-07-tip-calculator",              name: "Tip Calculator" },

  { n: 8,  slug: "day-08-bmi-calculator",              name: "BMI Calculator" },
  { n: 9,  slug: "day-09-password-generator",          name: "Password Generator" },
  { n: 10, slug: "day-10-quiz-app",                    name: "Quiz App" },
  { n: 11, slug: "day-11-flashcards",                  name: "Flashcards" },
  { n: 12, slug: "day-12-expense-tracker",             name: "Expense Tracker" },
  { n: 13, slug: "day-13-guess-number",                name: "Guess the Number" },
  { n: 14, slug: "day-14-random-quote-generator",      name: "Random Quote Generator" },

  { n: 15, slug: "day-15-weather-app",                 name: "Weather App" },
  { n: 16, slug: "day-16-notes-app",                   name: "Notes App" },
  { n: 17, slug: "day-17-image-slider",                name: "Image Slider/Carousel" },
  { n: 18, slug: "day-18-form-validation",             name: "Form Validation" },
  { n: 19, slug: "day-19-movie-search",                name: "Movie Search" },
  { n: 20, slug: "day-20-dark-light-mode",             name: "Dark/Light Mode Toggle" },
  { n: 21, slug: "day-21-countdown-timer",             name: "Countdown Timer" },

  { n: 22, slug: "day-22-drag-drop-todo",              name: "Drag & Drop To-Do" },
  { n: 23, slug: "day-23-snake-game",                  name: "Snake Game" },
  { n: 24, slug: "day-24-typing-speed-test",           name: "Typing Speed Test" },
  { n: 25, slug: "day-25-markdown-previewer",          name: "Markdown Previewer" },
  { n: 26, slug: "day-26-calculator",                  name: "Calculator" },
  { n: 27, slug: "day-27-photo-gallery",               name: "Photo Gallery + Filter" },
  { n: 28, slug: "day-28-Modal-Toast-Notifications",   name: "Modal + Toast Notifications" },
  { n: 29, slug: "day-29-Recipe-Finder",               name: "Recipe Finder" },

  // Day 30 has no repo subfolder — it's this page.
  { n: 30, slug: null, name: "Portfolio Landing Page", isToday: true },
];

function pad(n) { return n.toString().padStart(2, "0"); }

function renderDay(day) {
  const card = document.createElement(day.slug ? "a" : "div");
  card.className = "day-card" + (day.isToday ? " is-today" : "");

  if (day.slug) {
    card.href = REPO + day.slug;
    card.target = "_blank";
    card.rel = "noopener";
  }

  const num = document.createElement("span");
  num.className = "day-num mono";
  num.textContent = "day " + pad(day.n);

  const name = document.createElement("span");
  name.className = "day-name";
  name.textContent = day.isToday ? day.name + " (you are here)" : day.name;

  card.appendChild(num);
  card.appendChild(name);
  return card;
}

function renderWeek(containerId, range) {
  const container = document.getElementById(containerId);
  if (!container) return;
  days
    .filter(d => d.n >= range[0] && d.n <= range[1])
    .forEach(d => container.appendChild(renderDay(d)));
}

renderWeek("week1", [1, 7]);
renderWeek("week2", [8, 14]);
renderWeek("week3", [15, 21]);
renderWeek("week4", [22, 30]);
