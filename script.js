
const API_KEY = '4763480d33bf0f35b46889853a5a3d75'; 
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

let currentState = {
    city: 'Jakarta',
    unit: 'metric', 
    theme: 'dark'
};

async function fetchWeatherData(city) {
    showLoading(true);
    try {
        const weatherRes = await fetch(`${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=${currentState.unit}`);
        
        if (!weatherRes.ok) throw new Error('CITY NOT FOUND');
        
        const weatherData = await weatherRes.json();

        const { lat, lon } = weatherData.coord;
        const forecastRes = await fetch(`${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${currentState.unit}`);
        const forecastData = await forecastRes.json();

        updateUI(weatherData, forecastData);
        currentState.city = city;
        updateTimestamp();
        
    } catch (error) {
        alert(`SYSTEM ERROR: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

function updateUI(current, forecast) {
    
    const unitSymbol = currentState.unit === 'metric' ? '°C' : '°F';
    const speedSymbol = currentState.unit === 'metric' ? 'm/s' : 'mph';

    document.getElementById('cityName').textContent = `${current.name}, ${current.sys.country}`;
    document.getElementById('tempDisplay').textContent = `${Math.round(current.main.temp)}${unitSymbol}`;
    document.getElementById('weatherDesc').textContent = current.weather[0].description;
    document.getElementById('humidity').textContent = `${current.main.humidity}%`;
    document.getElementById('windSpeed').textContent = `${current.wind.speed} ${speedSymbol}`;
    document.getElementById('tempMin').textContent = `${Math.round(current.main.temp_min)}°`;
    document.getElementById('tempMax').textContent = `${Math.round(current.main.temp_max)}°`;
    
    const iconCode = current.weather[0].icon;
    document.getElementById('weatherIcon').src = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;

    const dailyData = forecast.list.filter(reading => reading.dt_txt.includes("12:00:00"));
    
    const forecastGrid = document.getElementById('forecastGrid');
    forecastGrid.innerHTML = '';

    dailyData.forEach(day => {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const temp = Math.round(day.main.temp);
        
        const card = `
            <div class="forecast-card">
                <div style="color:var(--text-primary)">${dayName}</div>
                <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" width="50" alt="icon">
                <div style="font-weight:bold; font-size:1.2rem;">${temp}°</div>
                <div style="font-size:0.8rem;">${day.weather[0].main}</div>
            </div>
        `;
        forecastGrid.innerHTML += card;
    });
}

function searchCity() {
    const input = document.getElementById('cityInput');
    if (input.value.trim() !== "") {
        fetchWeatherData(input.value);
        input.value = "";
    }
}

function handleEnter(e) {
    if (e.key === 'Enter') searchCity();
}

function toggleUnit() {
    currentState.unit = currentState.unit === 'metric' ? 'imperial' : 'metric';
    fetchWeatherData(currentState.city);
}

function toggleTheme() {
    currentState.theme = currentState.theme === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', currentState.theme);
}

function refreshData() {
    fetchWeatherData(currentState.city);
}

function showLoading(isLoading) {
    const loader = document.getElementById('loadingIndicator');
    const content = document.getElementById('mainContent');
    if (isLoading) {
        loader.style.display = 'block';
        content.style.opacity = '0.5';
    } else {
        loader.style.display = 'none';
        content.style.opacity = '1';
    }
}

function updateTimestamp() {
    const now = new Date();
    document.getElementById('timestamp').textContent = `LAST SYNC: ${now.toLocaleTimeString()}`;
}

function saveToFavorites() {
    let favorites = JSON.parse(localStorage.getItem('weatherFavs')) || [];
    if (!favorites.includes(currentState.city)) {
        if (favorites.length >= 5) favorites.shift();
        favorites.push(currentState.city);
        localStorage.setItem('weatherFavs', JSON.stringify(favorites));
        renderFavorites();
    }
}

function renderFavorites() {
    const container = document.getElementById('favoritesList');
    const favorites = JSON.parse(localStorage.getItem('weatherFavs')) || [];
    container.innerHTML = '';
    
    favorites.forEach(city => {
        const chip = document.createElement('div');
        chip.className = 'fav-chip';
        chip.textContent = city.toUpperCase();
        chip.onclick = () => fetchWeatherData(city);
        container.appendChild(chip);
    });
}

setInterval(() => {
    console.log("Auto-refreshing data...");
    fetchWeatherData(currentState.city);
}, 300000);

window.onload = () => {
    renderFavorites();
    fetchWeatherData('Jakarta');
};