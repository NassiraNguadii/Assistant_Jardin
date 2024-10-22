import requests
from datetime import datetime
from typing import Optional, Tuple
from .models.weather import WeatherData
from .models.location import Location
from .exceptions import WeatherAPIError
from .settings import Settings
from .utils import is_data_fresh, save_json, load_json

class WeatherManager:
    def __init__(self):
        self._weather: Optional[WeatherData] = None
        self._cache_file = "weather_cache.json"
        self._load_cached_weather()

    def _load_cached_weather(self):
        """Load weather from cache if available and fresh."""
        data = load_json(self._cache_file)
        if data and is_data_fresh(datetime.fromisoformat(data['last_updated'])):
            self._weather = WeatherData(**data)

    def get_weather(self, location: Location) -> WeatherData:
        """Get weather from cache or fetch new."""
        if self._weather and is_data_fresh(self._weather.last_updated):
            return self._weather

        return self.fetch_weather(location)

    def fetch_weather(self, location: Location) -> WeatherData:
        """Fetch weather data from OpenWeatherMap API."""
        try:
            params = {
                'lat': location.latitude,
                'lon': location.longitude,
                'appid': Settings.get("WEATHER_API_KEY"),
                'units': Settings.get("UNITS")
            }

            response = requests.get(Settings.get("WEATHER_API_URL"), params=params)
            data = response.json()

            self._weather = WeatherData(
                temperature=data['main']['temp'],
                humidity=data['main']['humidity'],
                precipitation=data['rain']['1h'] if 'rain' in data else 0,
                wind_speed=data['wind']['speed'],
                cloud_cover=data['clouds']['all'],
                last_updated=datetime.now()
            )

            save_json(self._weather.to_dict(), self._cache_file)
            return self._weather

        except Exception as e:
            raise WeatherAPIError(f"Failed to get weather data: {str(e)}")

    def should_water_garden(self) -> Tuple[bool, str]:
        """Determine if garden needs watering based on weather conditions."""
        if not self._weather:
            raise WeatherAPIError("Weather data not available")

        if self._weather.precipitation > 5:
            return False, "Recent rainfall sufficient"

        if self._weather.humidity > 80:
            return False, "High humidity, watering not needed"

        if self._weather.temperature > 30:
            return True, "High temperature requires watering"

        return True, "Regular watering recommended"