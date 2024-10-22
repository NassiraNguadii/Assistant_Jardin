from dataclasses import dataclass
from datetime import datetime

@dataclass
class Location:
    latitude: float
    longitude: float
    city: str
    country: str
    timezone: str
    last_updated: datetime = None

    def to_dict(self):
        return {
            "latitude": self.latitude,
            "longitude": self.longitude,
            "city": self.city,
            "country": self.country,
            "timezone": self.timezone,
            "last_updated": self.last_updated.isoformat() if self.last_updated else None
        }