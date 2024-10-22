class Settings:
    DEFAULT_CONFIG: Dict = {
        "WEATHER_API_KEY": os.getenv("WEATHER_API_KEY", ""),
        "WEATHER_API_URL": "http://api.openweathermap.org/data/2.5/weather",
        "LOCATION_API_URL": "https://ipapi.co/json/",
        "CACHE_DURATION": 1800,  # 30 minutes in seconds
        "UNITS": "metric"
    }

    @classmethod
    def get(cls, key: str):
        return cls.DEFAULT_CONFIG.get(key)