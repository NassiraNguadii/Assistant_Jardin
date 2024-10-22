import React, { useState, useEffect } from 'react';
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
            </div>
        </div>
    );
};

export default DashboardScreen;