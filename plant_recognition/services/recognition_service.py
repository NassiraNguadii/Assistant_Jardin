# plant_recognition/services/recognition_service.py

import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import json
from pathlib import Path
import logging

class PlantRecognitionService:
    def __init__(self, model_path: str = None, labels_path: str = None):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = self._initialize_model()
        self.transform = self._get_transforms()
        self.labels = self._load_labels(labels_path) if labels_path else []
        
        if model_path and Path(model_path).exists():
            self.load_model_weights(model_path)
            
        logging.info(f"Plant Recognition Service initialized using {self.device}")

    def _initialize_model(self):
        """Initialize EfficientNet model with custom classification head"""
        model = models.efficientnet_b0(pretrained=True)
        
        # Modify the classifier for our specific number of plant classes
        num_features = model.classifier[1].in_features
        model.classifier[1] = nn.Linear(num_features, 1000)  # Adjust based on your classes
        
        model = model.to(self.device)
        model.eval()
        return model

    def _get_transforms(self):
        """Define image transformations for inference"""
        return transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])

    def _load_labels(self, labels_path: str) -> list:
        """Load plant species labels"""
        try:
            with open(labels_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            logging.error(f"Error loading labels: {e}")
            return []

    def load_model_weights(self, model_path: str):
        """Load trained model weights"""
        try:
            state_dict = torch.load(model_path, map_location=self.device)
            self.model.load_state_dict(state_dict)
            logging.info("Model weights loaded successfully")
        except Exception as e:
            logging.error(f"Error loading model weights: {e}")
            raise

    def preprocess_image(self, image_path: str):
        """Preprocess image for model inference"""
        try:
            image = Image.open(image_path).convert('RGB')
            tensor = self.transform(image)
            return tensor.unsqueeze(0).to(self.device)
        except Exception as e:
            logging.error(f"Error preprocessing image: {e}")
            raise

    def predict(self, image_path: str) -> dict:
        """
        Perform plant recognition on an image
        Returns: dict with species prediction and confidence
        """
        try:
            # Preprocess image
            input_tensor = self.preprocess_image(image_path)
            
            # Perform inference
            with torch.no_grad():
                output = self.model(input_tensor)
                probabilities = torch.nn.functional.softmax(output[0], dim=0)
                
            # Get top prediction
            confidence, class_idx = torch.max(probabilities, dim=0)
            
            # Get prediction details
            species = self.labels[class_idx] if self.labels else f"Class_{class_idx}"
            
            return {
                "species": species,
                "confidence": float(confidence),
                "health_status": self.assess_plant_health(input_tensor),
                "growing_stage": self.determine_growing_stage(input_tensor)
            }
            
        except Exception as e:
            logging.error(f"Error during prediction: {e}")
            raise

    def assess_plant_health(self, image_tensor: torch.Tensor) -> dict:
        """Assess plant health based on visual features"""
        try:
            # Extract features using model's convolutional layers
            features = self.model.features(image_tensor)
            
            # Simple health assessment based on color distribution
            # This is a placeholder - you'd want to develop more sophisticated metrics
            avg_features = torch.mean(features, dim=[2, 3])[0]
            
            # Simple health scoring based on feature activation
            health_score = float(torch.mean(avg_features))
            
            return {
                "status": "healthy" if health_score > 0.5 else "needs_attention",
                "score": health_score,
                "issues": []  # Add detected issues here
            }
        except Exception as e:
            logging.error(f"Error in health assessment: {e}")
            return {"status": "unknown", "score": 0.0, "issues": []}

    def determine_growing_stage(self, image_tensor: torch.Tensor) -> str:
        """Determine plant growing stage"""
        try:
            # This is a placeholder - implement your growing stage detection logic
            features = self.model.features(image_tensor)
            avg_activation = torch.mean(features).item()
            
            # Simple stage determination based on feature activation
            if avg_activation > 0.7:
                return "mature"
            elif avg_activation > 0.4:
                return "growing"
            else:
                return "young"
        except Exception as e:
            logging.error(f"Error determining growing stage: {e}")
            return "unknown"