// --- API Endpoints ---
const API_BASE = 'https://www.themealdb.com/api/json/v1/1/';

// --- DOM Elements ---
const searchInput = document.getElementById('search-input');
const ingredientInput = document.getElementById('ingredient-input');
const categorySelect = document.getElementById('category-select');
const areaSelect = document.getElementById('area-select');
const searchBtn = document.getElementById('search-btn');
const surpriseBtn = document.getElementById('surprise-btn');
const quickCategories = document.getElementById('quick-categories');
const recipeGrid = document.getElementById('recipe-grid');
const resultsTitle = document.getElementById('results-title');

// Modal Elements
const modalBackdrop = document.getElementById('recipe-modal-backdrop');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalMealTitle = document.getElementById('modal-meal-title');
const modalMealBadges = document.getElementById('modal-meal-badges');
const modalMealImg = document.getElementById('modal-meal-img');
const modalIngredientsList = document.getElementById('modal-ingredients-list');
const modalMealInstructions = document.getElementById('modal-meal-instructions');
const modalSourceBtn = document.getElementById('modal-source-btn');
const modalYoutubeBtn = document.getElementById('modal-youtube-btn');

// Keep track of the button that launched the modal to restore focus
let previousActiveElement = null;

// --- Initialize App ---
document.addEventListener('DOMContentLoaded', () => {
  loadFilters();
  fetchFeaturedRecipes();
  setupEventListeners();
});

// --- Fetch Filter Options (Categories & Areas) ---
async function loadFilters() {
  try {
    // Fetch Categories
    const catRes = await fetch(`${API_BASE}categories.php`);
    const catData = await catRes.json();
    if (catData.categories) {
      catData.categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.strCategory;
        opt.textContent = cat.strCategory;
        categorySelect.appendChild(opt);
      });
    }

    // Fetch Areas (Regions)
    const areaRes = await fetch(`${API_BASE}list.php?a=list`);
    const areaData = await areaRes.json();
    if (areaData.meals) {
      areaData.meals.forEach(meal => {
        if (meal.strArea) {
          const opt = document.createElement('option');
          opt.value = meal.strArea;
          opt.textContent = meal.strArea;
          areaSelect.appendChild(opt);
        }
      });
    }
  } catch (err) {
    console.error('Failed to load filter menus:', err);
  }
}

// --- Setup Event Listeners ---
function setupEventListeners() {
  searchBtn.addEventListener('click', executeSearch);
  
  // Enter key press triggers search
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') executeSearch();
  });
  ingredientInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') executeSearch();
  });

  // Surprise Me Button
  surpriseBtn.addEventListener('click', triggerRandomRecipe);

  // Quick categories scroll list
  quickCategories.addEventListener('click', (e) => {
    const pill = e.target.closest('.category-pill');
    if (!pill) return;

    // Toggle active classes
    quickCategories.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');

    // Update Category selector and trigger search
    const categoryVal = pill.getAttribute('data-category');
    categorySelect.value = categoryVal;
    
    // Clear name and ingredient searches for quick categories
    searchInput.value = '';
    ingredientInput.value = '';
    
    executeSearch();
  });

  // Modal close handlers
  modalCloseBtn.addEventListener('click', closeModal);
  
  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) closeModal();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalBackdrop.classList.contains('active')) {
      closeModal();
    }

    // Modal focus trap
    if (e.key === 'Tab' && modalBackdrop.classList.contains('active')) {
      const focusables = modalBackdrop.querySelectorAll('button, a, input[type="checkbox"]');
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          last.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    }
  });
}

// --- Show Loader ---
function showLoader() {
  recipeGrid.innerHTML = `
    <div class="loader-container">
      <div class="loader-spinner"></div>
      <p>Gathering fresh ingredients...</p>
    </div>
  `;
}

// --- Fetch Featured / Initial Recipes ---
async function fetchFeaturedRecipes() {
  showLoader();
  try {
    const res = await fetch(`${API_BASE}search.php?s=`);
    const data = await res.json();
    renderMeals(data.meals, 'Featured Recipes');
  } catch (err) {
    showErrorState('Failed to fetch recipes. Please check your internet connection.');
  }
}

// --- Execute Search Router ---
async function executeSearch() {
  const nameQuery = searchInput.value.trim();
  const ingredientQuery = ingredientInput.value.trim();
  const categoryQuery = categorySelect.value;
  const areaQuery = areaSelect.value;

  // Sync quick categories selection with dropdown value
  quickCategories.querySelectorAll('.category-pill').forEach(pill => {
    if (pill.getAttribute('data-category') === categoryQuery) {
      pill.classList.add('active');
    } else {
      pill.classList.remove('active');
    }
  });

  showLoader();

  try {
    // 1. Prioritize Search by Name (Allows local filters on category, area, ingredient)
    if (nameQuery !== '') {
      const res = await fetch(`${API_BASE}search.php?s=${nameQuery}`);
      const data = await res.json();
      
      let meals = data.meals || [];

      // Filter locally by Category
      if (categoryQuery !== '') {
        meals = meals.filter(m => m.strCategory === categoryQuery);
      }
      // Filter locally by Area
      if (areaQuery !== '') {
        meals = meals.filter(m => m.strArea === areaQuery);
      }
      // Filter locally by Main Ingredient
      if (ingredientQuery !== '') {
        meals = meals.filter(m => {
          // Check ingredients 1-20
          for (let i = 1; i <= 20; i++) {
            const ing = m[`strIngredient${i}`];
            if (ing && ing.toLowerCase().includes(ingredientQuery.toLowerCase())) {
              return true;
            }
          }
          return false;
        });
      }

      renderMeals(meals, `Search Results for "${nameQuery}"`);
    }
    // 2. Search by Main Ingredient (MealDB API Filter)
    else if (ingredientQuery !== '') {
      const res = await fetch(`${API_BASE}filter.php?i=${ingredientQuery.toLowerCase().replace(/ /g, '_')}`);
      const data = await res.json();
      renderMeals(data.meals, `Recipes featuring "${ingredientQuery}"`);
    }
    // 3. Search by Category (MealDB API Filter)
    else if (categoryQuery !== '') {
      const res = await fetch(`${API_BASE}filter.php?c=${categoryQuery}`);
      const data = await res.json();
      renderMeals(data.meals, `${categoryQuery} Recipes`);
    }
    // 4. Search by Region/Area (MealDB API Filter)
    else if (areaQuery !== '') {
      const res = await fetch(`${API_BASE}filter.php?a=${areaQuery}`);
      const data = await res.json();
      renderMeals(data.meals, `${areaQuery} Cuisine`);
    }
    // 5. Default Fallback
    else {
      fetchFeaturedRecipes();
    }
  } catch (err) {
    showErrorState('Something went wrong during search. Please try again.');
  }
}

// --- Render Recipe Cards in Grid ---
function renderMeals(meals, title = 'Recipes') {
  resultsTitle.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width: 24px; height: 24px; color: var(--primary);">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
    ${title} (${meals ? meals.length : 0})
  `;

  if (!meals || meals.length === 0) {
    recipeGrid.innerHTML = `
      <div class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3>No Recipes Found</h3>
        <p>We couldn't find any recipes matching your filters. Try checking spelling or resetting search variables.</p>
      </div>
    `;
    return;
  }

  recipeGrid.innerHTML = '';
  meals.forEach(meal => {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    
    // Check if category and area badges are returned. If not (when using filter endpoints), we render empty or fetch dynamically later.
    const categoryBadge = meal.strCategory ? `<span class="recipe-badge">${meal.strCategory}</span>` : '';
    const areaBadge = meal.strArea ? `<span class="recipe-badge area">${meal.strArea}</span>` : '';

    card.innerHTML = `
      <div class="recipe-img-container">
        <img class="recipe-img" src="${meal.strMealThumb}" alt="${meal.strMeal}" loading="lazy">
      </div>
      <div class="recipe-card-content">
        ${categoryBadge || areaBadge ? `<div class="recipe-badges">${categoryBadge}${areaBadge}</div>` : ''}
        <h3 class="recipe-title">${meal.strMeal}</h3>
        <div class="recipe-card-footer">
          <button class="btn btn-primary btn-view-recipe" data-id="${meal.idMeal}">
            View Recipe
          </button>
        </div>
      </div>
    `;
    
    // Bind click trigger for view details
    card.querySelector('.btn-view-recipe').addEventListener('click', (e) => {
      previousActiveElement = document.activeElement;
      const id = e.target.getAttribute('data-id');
      openRecipeModal(id);
    });

    recipeGrid.appendChild(card);
  });
}

// --- Trigger Surprise Me (Random Recipe) ---
async function triggerRandomRecipe() {
  showLoader();
  try {
    const res = await fetch(`${API_BASE}random.php`);
    const data = await res.json();
    renderMeals(data.meals, 'Your Surprise Recipe!');
  } catch (err) {
    showErrorState('Failed to fetch a random recipe. Try again!');
  }
}

// --- Show Error State ---
function showErrorState(msg) {
  recipeGrid.innerHTML = `
    <div class="empty-state" style="color: var(--error);">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <h3>Error Loading Recipes</h3>
      <p>${msg}</p>
    </div>
  `;
}

// --- Open Recipe Details Modal ---
async function openRecipeModal(mealId) {
  // Pre-load default values/loading state
  modalMealTitle.textContent = 'Loading Details...';
  modalMealImg.src = '';
  modalMealBadges.innerHTML = '';
  modalIngredientsList.innerHTML = '<li>Gathering ingredients...</li>';
  modalMealInstructions.textContent = 'Preparing instructions...';
  modalSourceBtn.style.display = 'none';
  modalYoutubeBtn.style.display = 'none';

  // Toggle active backdrop class
  modalBackdrop.classList.add('active');
  document.body.style.overflow = 'hidden';

  try {
    const res = await fetch(`${API_BASE}lookup.php?i=${mealId}`);
    const data = await res.json();
    const meal = data.meals ? data.meals[0] : null;

    if (!meal) {
      modalMealTitle.textContent = 'Recipe Not Found';
      modalIngredientsList.innerHTML = '<li>Error loading details</li>';
      return;
    }

    // Populate data
    modalMealTitle.textContent = meal.strMeal;
    modalMealImg.src = meal.strMealThumb;
    modalMealImg.alt = meal.strMeal;

    // Badges
    modalMealBadges.innerHTML = `
      <span class="recipe-badge">${meal.strCategory}</span>
      <span class="recipe-badge area">${meal.strArea}</span>
    `;

    // Process ingredients & measurements list
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ing = meal[`strIngredient${i}`];
      const msr = meal[`strMeasure${i}`];
      if (ing && ing.trim() !== '') {
        ingredients.push(`${msr ? msr.trim() : ''} ${ing.trim()}`);
      }
    }

    // Render interactive checklist
    modalIngredientsList.innerHTML = '';
    ingredients.forEach(item => {
      const li = document.createElement('li');
      li.className = 'ingredient-item';
      
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      
      const text = document.createElement('span');
      text.textContent = item;

      li.appendChild(checkbox);
      li.appendChild(text);

      checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
          li.classList.add('checked');
        } else {
          li.classList.remove('checked');
        }
      });

      // Clicking text also checks/unchecks the box
      li.addEventListener('click', (e) => {
        if (e.target !== checkbox) {
          checkbox.checked = !checkbox.checked;
          checkbox.dispatchEvent(new Event('change'));
        }
      });

      modalIngredientsList.appendChild(li);
    });

    // Populate Instructions
    modalMealInstructions.textContent = meal.strInstructions;

    // Source link configuration
    if (meal.strSource && meal.strSource.trim() !== '') {
      modalSourceBtn.href = meal.strSource;
      modalSourceBtn.style.display = 'inline-flex';
    }

    // YouTube link configuration
    if (meal.strYoutube && meal.strYoutube.trim() !== '') {
      modalYoutubeBtn.href = meal.strYoutube;
      modalYoutubeBtn.style.display = 'inline-flex';
    }

    // Shift focus inside modal
    modalCloseBtn.focus();

  } catch (err) {
    modalMealTitle.textContent = 'Error Loading Details';
    modalIngredientsList.innerHTML = '<li>Check your connection and try again.</li>';
  }
}

// --- Close Recipe Details Modal ---
function closeModal() {
  modalBackdrop.classList.remove('active');
  document.body.style.overflow = '';
  
  // Return focus to triggering button
  if (previousActiveElement) {
    previousActiveElement.focus();
  }
}
