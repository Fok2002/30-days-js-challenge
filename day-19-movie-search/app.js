const API_KEY = 'bc5397d3'; // Get from https://www.omdbapi.com/
const API_URL = 'https://www.omdbapi.com/';

const movieInput = document.getElementById('movieInput');
const searchBtn = document.getElementById('searchBtn');
const results = document.getElementById('results');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const apiKeyNotice = document.getElementById('apiKeyNotice');

// Event listeners
searchBtn.addEventListener('click', searchMovies);
movieInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchMovies();
    }
});

async function searchMovies() {
    const query = movieInput.value.trim();

    if (!query) {
        showError('Please enter a movie name');
        return;
    }

    if (API_KEY === 'YOUR_API_KEY') {
        showError('API key not configured. Please update it in app.js');
        return;
    }

    // Show loading state
    loading.classList.remove('hidden');
    error.classList.add('hidden');
    results.innerHTML = '';

    try {
        const response = await fetch(
            `${API_URL}?s=${encodeURIComponent(query)}&apikey=${API_KEY}`
        );

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        if (data.Response === 'False') {
            showError(data.Error || 'No movies found');
            return;
        }

        displayResults(data.Search);
    } catch (err) {
        showError('Error fetching data. Please try again later.');
        console.error('Fetch error:', err);
    } finally {
        loading.classList.add('hidden');
    }
}

function displayResults(movies) {
    if (movies.length === 0) {
        results.innerHTML = '<div class="empty-state">No movies found</div>';
        return;
    }

    results.innerHTML = movies
        .map((movie) => createMovieCard(movie))
        .join('');

    // Add click handlers to view full details
    document.querySelectorAll('.movie-card').forEach((card) => {
        card.addEventListener('click', () => {
            const imdbID = card.dataset.imdbId;
            getMovieDetails(imdbID);
        });
    });
}

function createMovieCard(movie) {
    const posterUrl =
        movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster';
    
    return `
        <div class="movie-card" data-imdb-id="${movie.imdbID}">
            <img src="${posterUrl}" alt="${movie.Title}" class="movie-poster" onerror="this.src='https://via.placeholder.com/300x450?text=No+Poster'">
            <div class="movie-info">
                <div class="movie-title">${movie.Title}</div>
                <div class="movie-year">${movie.Year}</div>
                <div class="movie-type">${movie.Type}</div>
            </div>
        </div>
    `;
}

async function getMovieDetails(imdbID) {
    try {
        const response = await fetch(
            `${API_URL}?i=${imdbID}&apikey=${API_KEY}`
        );

        const data = await response.json();

        if (data.Response === 'False') {
            showError('Could not fetch movie details');
            return;
        }

        displayMovieDetail(data);
    } catch (err) {
        showError('Error fetching movie details');
        console.error('Fetch error:', err);
    }
}

function displayMovieDetail(movie) {
    const ratingValue = parseFloat(movie.imdbRating);
    const stars = getStarRating(ratingValue);

    const detailHTML = `
        <div class="movie-detail-overlay" id="detailOverlay">
            <div class="movie-detail-modal">
                <button class="close-btn" id="closeBtn">&times;</button>
                <div class="detail-content">
                    <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster'}" 
                         alt="${movie.Title}" class="detail-poster"
                         onerror="this.src='https://via.placeholder.com/300x450?text=No+Poster'">
                    <div class="detail-info">
                        <h2>${movie.Title}</h2>
                        <p class="detail-year">${movie.Year}</p>
                        
                        <div class="detail-rating">
                            <div class="stars">${stars}</div>
                            <span class="rating-value">${ratingValue}/10</span>
                        </div>

                        <p class="detail-label"><strong>IMDb Rating:</strong> 
                            <span class="imdb-rating">
                                <span class="imdb-logo">IMDb</span>
                                ${movie.imdbRating}
                            </span>
                        </p>
                        
                        <p class="detail-label"><strong>Director:</strong> ${movie.Director}</p>
                        <p class="detail-label"><strong>Actors:</strong> ${movie.Actors}</p>
                        <p class="detail-label"><strong>Genre:</strong> ${movie.Genre}</p>
                        <p class="detail-label"><strong>Runtime:</strong> ${movie.Runtime}</p>
                        <p class="detail-label"><strong>Plot:</strong></p>
                        <p class="detail-plot">${movie.Plot}</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Insert modal and show it
    document.body.insertAdjacentHTML('beforeend', detailHTML);
    const overlay = document.getElementById('detailOverlay');
    const closeBtn = document.getElementById('closeBtn');

    setTimeout(() => overlay.classList.add('show'), 10);

    closeBtn.addEventListener('click', () => {
        overlay.classList.remove('show');
        setTimeout(() => overlay.remove(), 300);
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.classList.remove('show');
            setTimeout(() => overlay.remove(), 300);
        }
    });
}

function getStarRating(rating) {
    const fullStars = Math.floor(rating / 2);
    const hasHalfStar = (rating % 2) >= 1;
    let stars = '★'.repeat(fullStars);
    if (hasHalfStar && fullStars < 5) {
        stars += '⭐';
    }
    return stars;
}

function showError(message) {
    error.textContent = message;
    error.classList.remove('hidden');
    results.innerHTML = '';
}
