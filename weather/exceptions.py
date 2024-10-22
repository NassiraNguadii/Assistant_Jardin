class WeatherError(Exception):
    """Base exception for weather module"""
    pass

class LocationError(WeatherError):
    """Raised when there's an error getting location"""
    pass

class WeatherAPIError(WeatherError):
    """Raised when there's an error with weather API"""
    pass