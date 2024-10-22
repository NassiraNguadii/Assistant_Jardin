from datetime import datetime, timedelta
from typing import Any
import json

def is_data_fresh(timestamp: datetime, max_age: int = 1800) -> bool:
    """Check if data is newer than max_age seconds."""
    if not timestamp:
        return False
    return (datetime.now() - timestamp) < timedelta(seconds=max_age)

def save_json(data: Any, filename: str):
    """Save data to JSON file."""
    with open(filename, 'w') as f:
        json.dump(data, f, indent=4)

def load_json(filename: str) -> Any:
    """Load data from JSON file."""
    try:
        with open(filename, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return None

