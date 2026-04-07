import cv2
import numpy as np
from shapely.geometry import Polygon, Point
from .classroom import ClassroomDetector
from ..models.loader import loader
from typing import Any, Dict, List

class LabDetector(ClassroomDetector):
    def __init__(self):
        super().__init__()
        self.pose = loader.get_pose()

    def detect(self, frame: np.ndarray, config: Dict[str, Any] = None) -> Dict[str, Any]:
        # Perform Classroom basic detections (person + face mesh)
        classroom_results = super().detect(frame, config)
        
        # Restricted Zones Logic
        restricted_zones = config.get("restricted_zones", [])
        h, w = frame.shape[:2]
        
        for person in classroom_results["detections"]:
            # Perform Pose Detection for each person
            x1, y1, x2, y2 = person["bbox"]
            person_crop = frame[y1:y2, x1:x2]
            
            if person_crop.size == 0:
                continue
            
            # Pose detection
            pose_results = self.pose.process(person_crop)
            is_outside_zone = False
            
            if pose_results.pose_landmarks:
                # Use base point (midpoint of ankles or centroid)
                # For simplicity, we'll use the bounding box center as a representative point
                p_x, p_y = (x1 + x2) / 2, (y2) # Use bottom center (feet)
                
                # Check against restricted zones
                for zone in restricted_zones:
                    poly_points = [(p[0] * w, p[1] * h) for p in zone.get("polygon", [])]
                    if not poly_points:
                        continue
                    
                    zone_poly = Polygon(poly_points)
                    if zone_poly.contains(Point(p_x, p_y)):
                        is_outside_zone = True # Person is inside a restricted zone
                        break
            
            person["restricted_access"] = is_outside_zone
            
        return classroom_results
