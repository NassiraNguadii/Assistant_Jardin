import React, { useState, useEffect } from 'react';
import { Camera, Home, BookOpen, Droplet, Calendar, Loader2 } from 'lucide-react';
import { getWeather } from './weatherService';

const DashboardScreen = () => {
    const [weather, setWeather] = useState({
        temperature: null,
        humidity: null,
        condition: 'Chargement...',
        wind_speed: null,
        precipitation: null,
        cloud_cover: null,
        location: {
            city: 'Chargement...',
            country: ''
        }
    });

    const [nextTasks] = useState([
        { id: 1, task: 'Arroser les tomates', date: '2024-10-16' },
        { id: 2, task: 'Tailler les rosiers', date: '2024-10-18' },
    ]);

    const [currentView, setCurrentView] = useState('dashboard');
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [showRecognition, setShowRecognition] = useState(false);

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const weatherData = await getWeather();
                setWeather(weatherData);
            } catch (error) {
                console.error('Error:', error);
                setWeather(prev => ({
                    ...prev,
                    condition: 'Erreur de chargement',
                    error: error.message
                }));
            }
        };

        fetchWeather();
        const interval = setInterval(fetchWeather, 30 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const handleNavigate = (view) => {
        setCurrentView(view);
        console.log(`Navigating to: ${view}`);
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
            setAnalysisResult(null);
        }
    };

    const analyzePlant = async () => {
        if (!selectedImage) return;
    
        setAnalyzing(true);
        const formData = new FormData();
        formData.append('file', selectedImage);
    
        try {
            const response = await fetch('http://localhost:8000/api/analyze-plant', {
                method: 'POST',
                body: formData,
            });
            
            const result = await response.json();
            setAnalysisResult(result);
        } catch (error) {
            console.error('Error:', error);
            setAnalysisResult({ error: 'Erreur lors de l\'analyse' });
        } finally {
            setAnalyzing(false);
        }
    };

    const navigationItems = [
        { name: 'Mon jardin', icon: Home, view: 'garden' },
        { name: 'Catalogue', icon: BookOpen, view: 'catalog' },
        { name: 'Arrosage', icon: Droplet, view: 'watering' },
        { name: 'Calendrier', icon: Calendar, view: 'calendar' },
    ];

    return (
        <div className="p-4 max-w-md mx-auto bg-green-50">
            <h1 className="text-2xl font-bold mb-4 text-green-700">
                Tableau de bord
            </h1>

            {/* Weather Card */}
            <div className="mb-4 p-4 border border-green-300 rounded-lg bg-white shadow-sm">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-bold">Météo</h2>
                    <span className="text-sm text-gray-600">
                        {weather.location?.city}, {weather.location?.country}
                    </span>
                </div>
                {weather.error ? (
                    <p className="text-red-500">{weather.condition}</p>
                ) : (
                    <div className="space-y-2">
                        <p className="text-lg">
                            {weather.temperature !== null ? `${weather.temperature}°C` : '...'}, 
                            {weather.condition}
                        </p>
                        <p>Humidité : {weather.humidity !== null ? `${weather.humidity}%` : '...'}</p>
                        {weather.wind_speed !== null && (
                            <p>Vent : {weather.wind_speed} km/h</p>
                        )}
                        {weather.precipitation !== null && (
                            <p>Précipitations : {weather.precipitation} mm</p>
                        )}
                        {weather.cloud_cover !== null && (
                            <p>Couverture nuageuse : {weather.cloud_cover}%</p>
                        )}
                    </div>
                )}
            </div>

            {/* Plant Recognition Section */}
            <div className="mb-4">
                {!showRecognition ? (
                    <button
                        onClick={() => setShowRecognition(true)}
                        className="w-full mb-4 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                        <Camera className="w-5 h-5" />
                        Identifier une plante
                    </button>
                ) : (
                    <div className="p-4 border border-green-300 rounded-lg bg-white shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Identification de plante</h2>
                            <button 
                                onClick={() => setShowRecognition(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>

                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                            id="plant-photo-input"
                        />
                        
                        <label
                            htmlFor="plant-photo-input"
                            className="w-full mb-4 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <Camera className="w-5 h-5" />
                            Prendre une photo
                        </label>

                        {previewUrl && (
                            <div className="mt-4">
                                <img
                                    src={previewUrl}
                                    alt="Aperçu"
                                    className="w-full h-48 object-cover rounded-lg"
                                />
                                <button
                                    onClick={analyzePlant}
                                    disabled={analyzing}
                                    className="w-full mt-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 flex items-center justify-center gap-2"
                                >
                                    {analyzing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Analyse en cours...
                                        </>
                                    ) : (
                                        'Analyser la plante'
                                    )}
                                </button>
                            </div>
                        )}

                        {analysisResult && (
                            <div className="mt-4">
                                {analysisResult.error ? (
                                    <div className="p-4 bg-red-50 text-red-700 rounded-lg">
                                        {analysisResult.error}
                                    </div>
                                ) : (
                                    <PlantAnalysisResults analysisResult={analysisResult} />
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Tasks Card */}
            <div className="mb-4 p-4 border border-green-300 rounded-lg bg-white shadow-sm">
                <h2 className="text-xl font-bold mb-2">Prochaines tâches</h2>
                <ul>
                    {nextTasks.map(task => (
                        <li key={task.id} className="mb-2">
                            {task.task} - {task.date}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Navigation Grid */}
            <div className="grid grid-cols-2 gap-4">
                {navigationItems.map((item, index) => (
                    <button
                        key={index}
                        onClick={() => handleNavigate(item.view)}
                        className="p-4 border border-green-300 rounded-lg bg-white hover:bg-green-50 transition-colors flex flex-col items-center gap-2 shadow-sm"
                    >
                        <item.icon className="w-6 h-6 text-green-600" />
                        <p>{item.name}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default DashboardScreen;