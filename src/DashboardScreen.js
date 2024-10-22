import React, { useState, useEffect } from 'react';
<<<<<<< Updated upstream

const DashboardScreen = () => {
    const [location, setLocation] = useState(null);
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [plants] = useState([
        { id: 1, name: 'Tomates', waterNeeds: 2.5, idealTemp: '20-28°C', idealHumidity: '60-80%' },
        { id: 2, name: 'Salades', waterNeeds: 1.8, idealTemp: '15-22°C', idealHumidity: '50-70%' },
        { id: 3, name: 'Basilic', waterNeeds: 1.2, idealTemp: '18-25°C', idealHumidity: '40-60%' }
    ]);

    // Fonction pour obtenir la localisation
    const getCurrentLocation = () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Géolocalisation non supportée'));
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                (error) => {
                    reject(error);
                }
            );
        });
    };

    // Fonction pour obtenir la météo
    const getWeather = async (latitude, longitude) => {
        const API_KEY = 'e206704f3a506fc41e64b42b4e431a66'; // Remplacez par votre clé API
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            // Check if data.main exists
            if (!data.main) {
                throw new Error('Données météo non disponibles');
            }
            return {
                temperature: data.main.temp,
                humidity: data.main.humidity,
                condition: data.weather[0].main,
                rain: data.rain ? data.rain['1h'] : 0
            };
        } catch (error) {
            throw error;
        }
    };

    // Fonction pour calculer les besoins en eau
    const calculateWateringNeeds = (temperature, humidity, rain) => {
        let baseNeeds = 2;

        if (temperature > 30) baseNeeds += 1.5;
        else if (temperature > 25) baseNeeds += 1;
        else if (temperature < 15) baseNeeds -= 0.5;

        if (humidity < 40) baseNeeds += 1;
        else if (humidity > 70) baseNeeds -= 0.5;

        baseNeeds = Math.max(0, baseNeeds - rain);
        return baseNeeds.toFixed(1);
    };

    useEffect(() => {
        const initializeLocationAndWeather = async () => {
            try {
                setLoading(true);
                const userLocation = await getCurrentLocation();
                setLocation(userLocation);

                const weatherData = await getWeather(userLocation.latitude, userLocation.longitude);
                setWeather(weatherData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        initializeLocationAndWeather();
    }, []);

    if (loading) {
        return (
            <div className="p-4 text-center">
                Chargement des données...
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-red-500">
                Erreur: {error}
            </div>
        );
    }

    return (
        <div className="p-4 max-w-2xl mx-auto bg-green-50">
            <h1 className="text-2xl font-bold mb-4 text-green-800">
                Assistant de Jardinage
            </h1>

            {/* Localisation */}
            <div className="mb-4 p-4 border border-green-300 rounded-lg bg-white">
                <h2 className="text-xl font-bold mb-2">Votre localisation</h2>
                <p>Latitude: {location?.latitude.toFixed(4)}</p>
                <p>Longitude: {location?.longitude.toFixed(4)}</p>
            </div>

            {/* Météo */}
            {weather && (
                <div className="mb-4 p-4 border border-green-300 rounded-lg bg-white">
                    <h2 className="text-xl font-bold mb-2">Conditions météo</h2>
                    <p>Température: {weather.temperature}°C</p>
                    <p>Humidité: {weather.humidity}%</p>
                    <p>Condition: {weather.condition}</p>
                    <p>Besoins en eau: {calculateWateringNeeds(weather.temperature, weather.humidity, weather.rain)} L/m²</p>
                </div>
            )}

            {/* Liste des plantes */}
            <div className="mb-4 p-4 border border-green-300 rounded-lg bg-white">
                <h2 className="text-xl font-bold mb-2">Plantes recommandées</h2>
                <div className="grid gap-2">
                    {plants.map(plant => (
                        <div key={plant.id} className="p-2 bg-green-50 rounded">
                            <h3 className="font-bold">{plant.name}</h3>
                            <p>Besoins en eau: {plant.waterNeeds} L/m²/jour</p>
                            <p>Température idéale: {plant.idealTemp}</p>
                            <p>Humidité idéale: {plant.idealHumidity}</p>
                        </div>
                    ))}
                </div>
=======
import { getWeather } from './weatherService';

const DashboardScreen = () => {
    const [weather, setWeather] = useState({
        temperature: null,
        humidity: null,
        condition: 'Chargement...',
        wind_speed: null
    });

    const [nextTasks] = useState([
        { id: 1, task: 'Arroser les tomates', date: '2024-10-16' },
        { id: 2, task: 'Tailler les rosiers', date: '2024-10-18' },
    ]);

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const weatherData = await getWeather();
                setWeather(weatherData);
            } catch (error) {
                console.error('Error:', error);
                let errorMessage = 'Erreur de chargement';
                
                if (error.message.includes('permission')) {
                    errorMessage = 'Veuillez autoriser l\'accès à votre position';
                } else if (error.message.includes('Geolocation')) {
                    errorMessage = 'La géolocalisation n\'est pas supportée';
                }
                
                setWeather(prev => ({
                    ...prev,
                    condition: errorMessage,
                    error: error.message
                }));
            }
        };

        fetchWeather();
        const interval = setInterval(fetchWeather, 30 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{ padding: '1rem', maxWidth: '400px', margin: '0 auto', backgroundColor: '#f0fff4' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#2f855a' }}>
                Tableau de bord
            </h1>

            <div style={{ 
                marginBottom: '1rem', 
                padding: '1rem', 
                border: '1px solid #9ae6b4', 
                borderRadius: '0.5rem', 
                backgroundColor: 'white'
            }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Météo</h2>
                {weather.error ? (
                    <p style={{ color: 'red' }}>{weather.condition}</p>
                ) : (
                    <>
                        <p style={{ fontSize: '1.125rem' }}>
                            {weather.temperature !== null ? `${weather.temperature}°C` : '...'}, 
                            {weather.condition}
                        </p>
                        <p>Humidité : {weather.humidity !== null ? `${weather.humidity}%` : '...'}</p>
                        {weather.wind_speed !== null && (
                            <p>Vent : {weather.wind_speed} km/h</p>
                        )}
                    </>
                )}
            </div>

            {/* Rest of your component remains the same */}
            <div style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #9ae6b4', borderRadius: '0.5rem', backgroundColor: 'white' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Prochaines tâches</h2>
                <ul>
                    {nextTasks.map(task => (
                        <li key={task.id} style={{ marginBottom: '0.5rem' }}>
                            {task.task} - {task.date}
                        </li>
                    ))}
                </ul>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {['Mon jardin', 'Catalogue', 'Arrosage', 'Calendrier'].map((item, index) => (
                    <div key={index} style={{ 
                        padding: '1rem', 
                        border: '1px solid #9ae6b4', 
                        borderRadius: '0.5rem', 
                        backgroundColor: 'white', 
                        textAlign: 'center',
                        cursor: 'pointer'
                    }}>
                        <p>{item}</p>
                    </div>
                ))}
>>>>>>> Stashed changes
            </div>
        </div>
    );
};

export default DashboardScreen;