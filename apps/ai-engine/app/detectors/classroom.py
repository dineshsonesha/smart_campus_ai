import cv2
import numpy as np
from .base import BaseDetector
from ..models.loader import loader
from ..config import settings
from typing import Any, Dict, List

class ClassroomDetector(BaseDetector):
    def __init__(self):
        self.yolo = loader.get_yolo()
        self.face_mesh = loader.get_face_mesh()
        
        # Generic 3D model points (approximate for solvePnP)
        self.model_points = np.array([
            (0.0, 0.0, 0.0),             # Nose tip (1)
            (0.0, -330.0, -65.0),        # Chin (152)
            (-225.0, 170.0, -135.0),     # Left eye left corner (33)
            (225.0, 170.0, -135.0),      # Right eye right corner (263)
            (-150.0, -150.0, -125.0),    # Left Mouth corner (61)
            (150.0, -150.0, -125.0)      # Right mouth corner (291)
        ])

    def detect(self, frame: np.ndarray, config: Dict[str, Any] = None) -> Dict[str, Any]:
        results = self.yolo(frame, verbose=False)[0]
        persons = []
        
        talking_count = 0
        distracted_count = 0
        
        for box in results.boxes:
            if box.cls[0] == 0: # Person
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                person_crop = frame[y1:y2, x1:x2]
                
                if person_crop.size == 0:
                    continue

                # Process Face
                face_data = self.process_face(person_crop)
                
                attentive = face_data.get("attentive", True)
                is_talking = face_data.get("is_talking", False)
                
                if not attentive:
                    distracted_count += 1
                if is_talking:
                    talking_count += 1
                
                persons.append({
                    "bbox": [x1, y1, x2, y2],
                    "confidence": float(box.conf[0]),
                    "attentive": attentive,
                    "is_talking": is_talking,
                    "pose": face_data.get("pose", {})
                })
        
        total_persons = len(persons)
        attention_percentage = (total_persons - distracted_count) / total_persons * 100 if total_persons > 0 else 100

        return {
            "total_person_count": total_persons,
            "talking_count": talking_count,
            "distracted_count": distracted_count,
            "attention_percentage": round(attention_percentage, 2),
            "detections": persons
        }

    def process_face(self, face_rgb: np.ndarray) -> Dict[str, Any]:
        h, w = face_rgb.shape[:2]
        results = self.face_mesh.process(face_rgb)
        
        if not results.multi_face_landmarks:
            return {"attentive": True, "is_talking": False}

        landmarks = results.multi_face_landmarks[0].landmark
        
        # 1. Head Pose Estimation
        image_points = np.array([
            (landmarks[1].x * w, landmarks[1].y * h),      # Nose tip
            (landmarks[152].x * w, landmarks[152].y * h),  # Chin
            (landmarks[33].x * w, landmarks[33].y * h),    # Left eye
            (landmarks[263].x * w, landmarks[263].y * h),  # Right eye
            (landmarks[61].x * w, landmarks[61].y * h),    # Left mouth corner
            (landmarks[291].x * w, landmarks[291].y * h)   # Right mouth corner
        ], dtype="double")

        # Camera matrix
        focal_length = w
        center = (w/2, h/2)
        camera_matrix = np.array([
            [focal_length, 0, center[0]],
            [0, focal_length, center[1]],
            [0, 0, 1]
        ], dtype="double")

        dist_coeffs = np.zeros((4,1)) # Assuming no lens distortion
        (success, rotation_vector, translation_vector) = cv2.solvePnP(
            self.model_points, image_points, camera_matrix, dist_coeffs, flags=cv2.SOLVEPNP_ITERATIVE
        )

        # Convert to Euler angles
        rmat, _ = cv2.Rodrigues(rotation_vector)
        angles, _, _, _, _, _ = cv2.decomposeProjectionMatrix(np.hstack((rmat, translation_vector)))
        
        pitch, yaw, roll = angles.flatten()
        
        # 2. Talking Detection (Mouth Aspect Ratio)
        # Inner lips (13 upper, 14 lower)
        inner_lip_dist = abs(landmarks[13].y - landmarks[14].y) * h
        # Mouth width (61, 291)
        mouth_width = abs(landmarks[61].x - landmarks[291].x) * w
        
        mar = inner_lip_dist / mouth_width if mouth_width > 0 else 0
        is_talking = mar > settings.TALKING_MAR_THRESHOLD

        attentive = abs(yaw) < settings.ATTENTION_YAW_THRESHOLD and abs(pitch) < settings.ATTENTION_PITCH_THRESHOLD

        return {
            "attentive": attentive,
            "is_talking": is_talking,
            "pose": {"yaw": float(yaw), "pitch": float(pitch), "roll": float(roll)}
        }
