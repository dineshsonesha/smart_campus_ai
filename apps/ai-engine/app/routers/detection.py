from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any, Dict, List, Optional
from ..processors.frame import FrameProcessor
from ..models.registry import DetectorRegistry
from ..models.loader import loader
import time

router = APIRouter()

class DetectionRequest(BaseModel):
    device_id: str
    category: str
    frame: str # Base64 encoded JPEG
    config: Optional[Dict[str, Any]] = None

@router.post("/detect")
async def detect(request: DetectionRequest):
    start_time = time.time()
    
    # Get Detector
    detector = DetectorRegistry.get_detector(request.category)
    if not detector:
        raise HTTPException(status_code=400, detail=f"Category '{request.category}' not supported.")

    # Process Frame
    try:
        frame_bgr = FrameProcessor.decode_base64(request.frame)
        if frame_bgr is None:
            raise ValueError("Invalid frame data")
            
        frame_resized, ratio = FrameProcessor.resize(frame_bgr)
        frame_rgb = FrameProcessor.preprocess(frame_resized)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Frame processing error: {str(e)}")

    # Detect
    try:
        results = detector.detect(frame_rgb, request.config or {})
        
        # Add metadata
        results["processing_time_ms"] = (time.time() - start_time) * 1000
        results["device_id"] = request.device_id
        results["category"] = request.category
        
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Detection error: {str(e)}")

@router.get("/health")
async def health():
    return {
        "status": "ok",
        "device": loader.device,
        "models_loaded": {
            "yolo": True,
            "face_mesh": True,
            "pose": True
        }
    }

@router.get("/models")
async def list_models():
    return {
        "categories": DetectorRegistry.list_categories(),
        "versions": {
            "yolov8": "n",
            "mediapipe": "FaceMesh/Pose"
        }
    }
