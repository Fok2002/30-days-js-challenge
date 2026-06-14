// OpenWeather API Configuration
// Get your free API key from: https://openweathermap.org/api
const API_KEY = '30a1e0363298897de5abccb98f8d86f5'; // OpenWeather API key
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const weatherContainer = document.getElementById('weatherContainer');
const errorMessage = document.getElementById('errorMessage');
const loading = document.getElementById('loading');

// Event Listeners
searchBtn.addEventListener('click', searchWeather);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchWeather();
    }
});

/**
 * Search for weather by city name
 */
async function searchWeather() {
    const cityName = searchInput.value.trim();
    
    if (!cityName) {
        showError('Please enter a city name');
        return;
    }

    if (API_KEY === 'YOUR_API_KEY_HERE') {
        showError('Please add your OpenWeather API key in the app.js file');
        return;
    }

    showLoading(true);
    clearError();

    try {
        // Get coordinates from city name
        const coordsData = await fetch(
            `${BASE_URL}/find?q=${encodeURIComponent(cityName)}&appid=${API_KEY}&units=metric`
        ).then(res => res.json());

        if (!coordsData.list || coordsData.list.length === 0) {
            showError('City not found. Please try another search.');
            showLoading(false);
            return;
        }

        const city = coordsData.list[0];
        const { coord: { lat, lon }, name, sys: { country } } = city;

        // Get detailed weather data
        const weatherData = await fetch(
            `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        ).then(res => res.json());

        // Get UV Index (requires separate API call)
        const uvData = await fetch(
            `${BASE_URL}/uvi?lat=${lat}&lon=${lon}&appid=${API_KEY}`
        ).then(res => res.json());

        displayWeather(weatherData, uvData, name, country);
        searchInput.value = '';
    } catch (error) {
        showError('Failed to fetch weather data. Please try again.');
        console.error('Error:', error);
    } finally {
        showLoading(false);
    }
}

/**
 * Display weather information on the page
 */
function displayWeather(weatherData, uvData, cityName, country) {
    const { main, weather, wind, clouds, sys, visibility, dt, timezone } = weatherData;

    // Update city info
    document.getElementById('cityName').textContent = `${cityName}, ${country}`;
    document.getElementById('weatherDescription').textContent = 
        weather[0].main + ' - ' + weather[0].description;

    // Update temperature info
    document.getElementById('temperature').textContent = Math.round(main.temp);
    document.getElementById('feelsLike').textContent = Math.round(main.feels_like);

    // Update weather icon
    const iconUrl = `https://openweathermap.org/img/wn/${weather[0].icon}@4x.png`;
    document.getElementById('weatherIcon').src = iconUrl;

    // Update details
    document.getElementById('humidity').textContent = main.humidity;
    document.getElementById('pressure').textContent = main.pressure;
    document.getElementById('windSpeed').textContent = wind.speed.toFixed(1);
    document.getElementById('visibility').textContent = (visibility / 1000).toFixed(1);
    document.getElementById('uvIndex').textContent = uvData.value ? uvData.value.toFixed(1) : 'N/A';

    // Update sunrise and sunset
    const sunriseTime = new Date(sys.sunrise * 1000);
    const sunsetTime = new Date(sys.sunset * 1000);
    
    document.getElementById('sunrise').textContent = formatTime(sunriseTime);
    document.getElementById('sunset').textContent = formatTime(sunsetTime);

    // Show weather container and hide error
    weatherContainer.classList.remove('hidden');
    errorMessage.classList.add('hidden');
}

/**
 * Format time from Date object
 */
function formatTime(date) {
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

/**
 * Show loading state
 */
function showLoading(isLoading) {
    if (isLoading) {
        loading.classList.remove('hidden');
        weatherContainer.classList.add('hidden');
    } else {
        loading.classList.add('hidden');
    }
}

/**
 * Show error message
 */
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    weatherContainer.classList.add('hidden');
}

/**
 * Clear error message
 */
function clearError() {
    errorMessage.textContent = '';
    errorMessage.classList.add('hidden');
}

// Optional: Load weather for a default city on page load
window.addEventListener('load', () => {
    // Uncomment to load default city
    // searchInput.value = 'London';
    // searchWeather();
});
