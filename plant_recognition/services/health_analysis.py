# plant_recognition/services/health_analysis.py

import logging
from PIL import Image
import numpy as np
from pathlib import Path

class HealthAnalysisService:
    """Service for analyzing plant health from images"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.logger.info("Health Analysis Service initialized")

    def analyze_health(self, image_path: str) -> dict:
        """
        Analyze plant health from an image
        Args:
            image_path: Path to the image file
        Returns:
            Dictionary containing health analysis results
        """
        try:
            # Open and convert image to RGB
            image = Image.open(image_path).convert('RGB')
            
            # Convert to numpy array for analysis
            img_array = np.array(image)
            
            # Extract color features
            avg_colors = np.mean(img_array, axis=(0, 1))
            std_colors = np.std(img_array, axis=(0, 1))
            
            # Simple health metrics based on color analysis
            # This is a basic implementation - you can enhance it based on your needs
            green_intensity = avg_colors[1] / 255.0  # Green channel
            color_variation = np.mean(std_colors) / 255.0
            
            # Calculate health score (simple example)
            health_score = (green_intensity * 0.7 + color_variation * 0.3) * 100
            
            # Determine health status
            if health_score > 70:
                status = "healthy"
            elif health_score > 40:
                status = "moderate"
            else:
                status = "needs_attention"
                
            # Generate analysis result
            return {
                "status": status,
                "health_score": round(health_score, 2),
                "metrics": {
                    "green_intensity": round(green_intensity * 100, 2),
                    "color_variation": round(color_variation * 100, 2)
                },
                "recommendations": self._get_recommendations(status)
            }
            
        except Exception as e:
            self.logger.error(f"Error analyzing plant health: {e}")
            raise
            
    def _get_recommendations(self, status: str) -> list:
        """Get recommendations based on health status"""
        recommendations = {
            "healthy": [
                "Continue current care routine",
                "Monitor for any changes",
                "Regular watering and maintenance"
            ],
            "moderate": [
                "Check watering schedule",
                "Ensure adequate sunlight",
                "Consider soil nutrients"
            ],
            "needs_attention": [
                "Urgent: Check for signs of disease",
                "Adjust watering immediately",
                "Consider repotting or fertilizing",
                "Monitor closely for next few days"
            ]
        }
        return recommendations.get(status, ["Unable to provide recommendations"])