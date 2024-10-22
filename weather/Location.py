import requests
from datetime import datetime
from typing import Optional
from .models.location import Location
from .exceptions import LocationError
from .settings import Settings
from .utils import is_data_fresh, save_json, load_json

class LocationManager:
    def __init__(self):
        self._location: Optional[Location] = None
        self._cache_file = "location_cache.json"
        self._load_cached_location()

    def _load_cached_location(self):
        """Load location from cache if available and fresh."""
        data = load_json(self._cache_file)
        if data and is_data_fresh(datetime.fromisoformat(data['last_updated'])):
            self._location = Location(**data)

    def get_location(self) -> Location:
        """Get location from cache or fetch new."""
        if self._location and is_data_fresh(self._location.last_updated):
            return self._location

        return self.fetch_location()

    def fetch_location(self) -> Location:
        """Fetch location from IP-based service."""
        try:
            response = requests.get(Settings.get("LOCATION_API_URL"))
            data = response.json()

            self._location = Location(
                latitude=float(data['latitude']),
                longitude=float(data['longitude']),
                city=data['city'],
                country=data['country_name'],
                timezone=data['timezone'],
                last_updated=datetime.now()
            )

            save_json(self._location.to_dict(), self._cache_file)
            return self._location

        except Exception as e:
            raise LocationError(f"Failed to get location: {str(e)}")