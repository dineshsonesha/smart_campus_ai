from fastapi import FastAPI
from .routers import detection
from .config import settings
import logging

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("AI-ENGINE")

app = FastAPI(
    title=settings.APP_NAME,
    description="High-performance AI detection service for Smart-Eye Campus",
    version="0.1.0"
)

# Routes
app.include_router(detection.router)

@app.on_event("startup")
async def startup_event():
    logger.info("Smart-Eye AI Engine is starting up...")
    # Trigger model lazy-load
    from .models.loader import loader
    logger.info(f"Using device: {loader.device}")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Smart-Eye AI Engine is shutting down...")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
