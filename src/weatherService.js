// src/weatherService.js
const API_KEY = process.env.REACT_APP_WEATHER_API_KEY;

const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by your browser'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => resolve(position),
            (err) => reject(err),
            { timeout: 10000 }
        );
    });
};

export const getWeather = async () => {
    try {
        // Get location from browser
        const position = await getCurrentPosition();
        const { latitude, longitude } = position.coords;
        
        // Fetch weather data directly
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`;
        const weatherResponse = await fetch(weatherUrl);
        
        if (!weatherResponse.ok) {
            throw new Error(`Weather API error: ${weatherResponse.status}`);
        }
        
        const weatherData = await weatherResponse.json();
        console.log('Weather data received:', weatherData);

        return {
            temperature: Math.round(weatherData.main.temp),
            humidity: weatherData.main.humidity,
            condition: getConditionInFrench(weatherData.weather[0].main),
            wind_speed: Math.round(weatherData.wind.speed * 3.6) // Convert m/s to km/h
        };
    } catch (error) {
        console.error('Error fetching weather:', error);
        throw error;
    }
};

const getConditionInFrench = (condition) => {
    const translations = {
        'Clear': 'Ensoleillé',
        'Clouds': 'Nuageux',
        'Rain': 'Pluvieux',
        'Drizzle': 'Bruine',
        'Thunderstorm': 'Orageux',
        'Snow': 'Neigeux',
        'Mist': 'Brumeux',
        'Fog': 'Brouillard'
    };
    return translations[condition] || condition;
};