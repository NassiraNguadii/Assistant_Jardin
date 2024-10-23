# api/endpoints.py
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from services.recognition_service import PlantRecognitionService
from services.health_analysis import PlantHealthAnalyzer
import numpy as np
from PIL import Image
import io

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Replace with your React app's URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
recognition_service = PlantRecognitionService()
health_analyzer = PlantHealthAnalyzer()

@app.post("/api/analyze-plant")
async def analyze_plant(file: UploadFile = File(...)):
    # Read and preprocess the image
    image_data = await file.read()
    image = Image.open(io.BytesIO(image_data))
    
    # Get plant recognition results
    species_info = recognition_service.identify_plant(image)
    
    # Analyze plant health
    health_status = health_analyzer.analyze_health(image)
    
    # Combine results
    return {
        "species": species_info,
        "health_analysis": health_status,
        "care_recommendations": health_analyzer.get_care_recommendations(species_info["species"])
    }

# services/recognition_service.py
import torch
import torchvision.transforms as transforms
from PIL import Image
from efficientnet_pytorch import EfficientNet
import json

class PlantRecognitionService:
    def __init__(self):
        # Load pre-trained EfficientNet model
        self.model = EfficientNet.from_pretrained('efficientnet-b0')
        self.model.eval()
        
        # Load plant species labels
        with open('datasets/plant_species.json', 'r') as f:
            self.species_labels = json.load(f)
        
        # Define image transformations
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406],std=[0.229, 0.224, 0.225])
        ])

    def identify_plant(self, image: Image.Image) -> dict:
        # Preprocess image
        img_tensor = self.transform(image).unsqueeze(0)
        
        with torch.no_grad():
            outputs = self.model(img_tensor)
            _, predicted = torch.max(outputs, 1)
            
            species_idx = predicted.item()
            species_info = self.species_labels[species_idx]
            
            # Get confidence scores
            probabilities = torch.nn.functional.softmax(outputs[0], dim=0)
            confidence = probabilities[species_idx].item()
            
            return {
                "species": species_info["name"],
                "confidence": float(confidence),
                "scientific_name": species_info["scientific_name"],
                "common_names": species_info["common_names"]
            }

# services/health_analysis.py
import cv2
import numpy as np
from PIL import Image

class PlantHealthAnalyzer:
    def __init__(self):
        # Load health analysis model or rules
        self.health_thresholds = {
            "leaf_color": {"min": 25, "max": 75},
            "disease_spots": 0.1,
            "leaf_damage": 0.15
        }

    def analyze_health(self, image: Image.Image) -> dict:
        # Convert PIL Image to OpenCV format
        img_cv = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
        # Extract health indicators
        health_indicators = self._extract_health_indicators(img_cv)
        
        # Analyze overall health
        health_status = self._evaluate_health(health_indicators)
        
        return health_status

    def _extract_health_indicators(self, image):
        # Convert to HSV color space
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
        
        # Analyze leaf color (greenness)
        green_mask = cv2.inRange(hsv, (35, 25, 25), (85, 255, 255))
        green_percentage = np.sum(green_mask > 0) / (image.shape[0] * image.shape[1])
        
        # Detect disease spots (simplified)
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        _, spots = cv2.threshold(gray, 50, 255, cv2.THRESH_BINARY_INV)
        spots_percentage = np.sum(spots > 0) / (image.shape[0] * image.shape[1])
        
        return {
            "leaf_color": green_percentage * 100,
            "disease_spots": spots_percentage,
            "leaf_damage": spots_percentage  # Simplified measure
        }

    def _evaluate_health(self, indicators):
        health_score = 0
        issues = []
        
        # Evaluate leaf color
        if indicators["leaf_color"] < self.health_thresholds["leaf_color"]["min"]:
            issues.append("Yellow or pale leaves detected - possible nutrient deficiency")
            health_score += 30
        elif indicators["leaf_color"] > self.health_thresholds["leaf_color"]["max"]:
            health_score += 100
        else:
            health_score += 70

        # Evaluate disease spots
        if indicators["disease_spots"] > self.health_thresholds["disease_spots"]:
            issues.append("Possible disease spots detected")
            health_score -= 30

        # Evaluate leaf damage
        if indicators["leaf_damage"] > self.health_thresholds["leaf_damage"]:
            issues.append("Leaf damage detected")
            health_score -= 20

        return {
            "health_score": max(0, min(100, health_score)),
            "issues": issues,
            "indicators": indicators
        }

    def get_care_recommendations(self, species: str) -> list:
        # Basic care recommendations based on species and health issues
        base_recommendations = [
            "Ensure proper watering - check soil moisture before watering",
            "Maintain adequate sunlight exposure",
            "Monitor for pest infestations regularly"
        ]
        
        # Add species-specific recommendations
        species_recommendations = self._get_species_specific_care(species)
        
        return base_recommendations + species_recommendations

    def _get_species_specific_care(self, species: str) -> list:
        # Implement species-specific care recommendations
        # This could be expanded with a proper database of plant care requirements
        return [
            f"Research optimal soil pH for {species}",
            f"Check typical watering frequency for {species}",
            f"Verify ideal sunlight conditions for {species}"
        ]