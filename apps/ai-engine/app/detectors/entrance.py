import cv2
import numpy as np
from .base import BaseDetector
from ..models.loader import loader
from typing import Any, Dict, List

class EntranceDetector(BaseDetector):
    def __init__(self):
        self.yolo = loader.get_yolo()

    def detect(self, frame: np.ndarray, config: Dict[str, Any] = None) -> Dict[str, Any]:
        h, w = frame.shape[:2]
        results = self.yolo(frame, verbose=False)[0]
        
        persons = []
        zone_counts = {"left": 0, "center": 0, "right": 0}
        
        for box in results.boxes:
            if box.cls[0] == 0: # Person
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                confidence = float(box.conf[0])
                
                # Zone Assignment (3 horizontal zones)
                centroid_x = (x1 + x2) / 2
                if centroid_x < w / 3:
                    zone = "left"
                elif centroid_x < 2 * w / 3:
                    zone = "center"
                else:
                    zone = "right"
                    
                zone_counts[zone] += 1
                persons.append({
                    "bbox": [x1, y1, x2, y2],
                    "confidence": confidence,
                    "zone": zone
                })

        total_count = len(persons)
        
        # Density Level Calculation
        # Low < 5, Medium 5-15, High > 15
        density_level = "LOW"
        if total_count > 15:
            density_level = "HIGH"
        elif total_count > 5:
            density_level = "MEDIUM"
            
        return {
            "total_person_count": total_count,
            "density_level": density_level,
            "zone_density": zone_counts,
            "detections": persons
        }
