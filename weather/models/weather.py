from dataclasses import dataclass
from datetime import datetime

@dataclass
class WeatherData:
    temperature: float
    humidity: float
    precipitation: float
    wind_speed: float
    cloud_cover: float
    last_updated: datetime = None

    def to_dict(self):
        return {
            "temperature": self.temperature,
            "humidity": self.humidity,
            "precipitation": self.precipitation,
            "wind_speed": self.wind_speed,
            "cloud_cover": self.cloud_cover,
            "last_updated": self.last_updated.isoformat() if self.last_updated else None
        }
