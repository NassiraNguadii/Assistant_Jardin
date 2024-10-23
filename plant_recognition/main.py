# plant_recognition/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from plant_recognition.api.endpoints import router

# Initialize FastAPI app
app = FastAPI(
    title="Plant Recognition Service",
    description="API for plant recognition and health analysis",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update this for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include router
app.include_router(router, prefix="/api/plant-recognition")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)