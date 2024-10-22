import React, { useState } from 'react';

const DashboardScreen = () => {
    const [weather, setWeather] = useState({
        temperature: 22,
        humidity: 60,
        condition: 'Ensoleillé'
    });

    const [nextTasks, setNextTasks] = useState([
        { id: 1, task: 'Arroser les tomates', date: '2024-10-16' },
        { id: 2, task: 'Tailler les rosiers', date: '2024-10-18' },
    ]);

    return (
        <div style={{ padding: '1rem', maxWidth: '400px', margin: '0 auto', backgroundColor: '#f0fff4' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#2f855a' }}>Tableau de bord</h1>

            <div style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #9ae6b4', borderRadius: '0.5rem', backgroundColor: 'white' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Météo</h2>
                <p style={{ fontSize: '1.125rem' }}>{weather.temperature}°C, {weather.condition}</p>
                <p>Humidité : {weather.humidity}%</p>
            </div>

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
                    <div key={index} style={{ padding: '1rem', border: '1px solid #9ae6b4', borderRadius: '0.5rem', backgroundColor: 'white', textAlign: 'center' }}>
                        <p>{item}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DashboardScreen;