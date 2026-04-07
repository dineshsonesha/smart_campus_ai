import cv2
import numpy as np
from shapely.geometry import Polygon, Point
from .base import BaseDetector
from ..models.loader import loader
from ..config import settings
from typing import Any, Dict, List

class ParkingDetector(BaseDetector):
    def __init__(self):
        self.yolo = loader.get_yolo()
        # YOLOv8 class indices for vehicles: 2 (car), 3 (motorcycle), 5 (bus), 7 (truck)
        self.vehicle_classes = [2, 3, 5, 7]

    def detect(self, frame: np.ndarray, config: Dict[str, Any] = None) -> Dict[str, Any]:
        h, w = frame.shape[:2]
        results = self.yolo(frame, verbose=False)[0]
        
        vehicles = []
        for box in results.boxes:
            if int(box.cls[0]) in self.vehicle_classes:
                # Bounding box coordinates (xyxy)
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                vehicles.append({
                    "bbox": [x1, y1, x2, y2],
                    "confidence": float(box.conf[0]),
                    "label": self.yolo.names[int(box.cls[0])]
                })

        # Process Parking Slots (Config Polygons)
        slots = config.get("slots", [])
        slot_status = []
        occupied_count = 0
        
        for slot in slots:
            slot_id = slot.get("id", "unknown")
            # Convert relative coordinates to absolute pixels
            poly_points = [(p[0] * w, p[1] * h) for p in slot.get("polygon", [])]
            
            if not poly_points:
                continue
                
            slot_poly = Polygon(poly_points)
            is_occupied = False
            
            for vehicle in vehicles:
                # Use vehicle bounding box centroid for simple overlap check
                v_x1, v_y1, v_x2, v_y2 = vehicle["bbox"]
                v_centroid = Point((v_x1 + v_x2) / 2, (v_y1 + v_y2) / 2)
                
                # Check if centroid is in polygon OR significant intersection
                v_poly = Polygon([(v_x1, v_y1), (v_x2, v_y1), (v_x2, v_y2), (v_x1, v_y2)])
                intersection_area = slot_poly.intersection(v_poly).area
                
                # Intersection Over Area (IoA) > threshold
                if intersection_area / slot_poly.area > settings.POLYGON_OVERLAP_THRESHOLD:
                    is_occupied = True
                    break
            
            if is_occupied:
                occupied_count += 1
            
            slot_status.append({
                "id": slot_id,
                "is_occupied": is_occupied
            })

        return {
            "total_vehicle_count": len(vehicles),
            "occupied_slots": occupied_count,
            "empty_slots": len(slots) - occupied_count,
            "slot_status": slot_status,
            "detections": vehicles
        }
