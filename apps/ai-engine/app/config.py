from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    APP_NAME: str = "Smart-Eye AI Engine"
    DEBUG: bool = False
    
    # Model Config
    YOLO_MODEL: str = "yolov8n.pt"
    MAX_CONCURRENCY: int = 4
    
    # Detection Thresholds
    ATTENTION_YAW_THRESHOLD: float = 20.0
    ATTENTION_PITCH_THRESHOLD: float = 15.0
    TALKING_MAR_THRESHOLD: float = 0.3
    POLYGON_OVERLAP_THRESHOLD: float = 0.3

    class Config:
        env_file = ".env"

settings = Settings()
