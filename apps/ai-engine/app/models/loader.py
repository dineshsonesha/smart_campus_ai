import cv2
import mediapipe as mp
from ultralytics import YOLO
import torch
import logging

class ModelLoader:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelLoader, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        logging.info("Initializing Models...")
        
        # 1. Device detection
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        logging.info(f"Using device: {self.device}")

        # 2. YOLOv8
        self.yolo = YOLO("yolov8n.pt")
        self.yolo.to(self.device)
        
        # 3. MediaPipe Face Mesh
        self.mp_face_mesh = mp.solutions.face_mesh.FaceMesh(
            static_image_mode=True,
            max_num_faces=10,
            refine_landmarks=True,
            min_detection_confidence=0.5
        )
        
        # 4. MediaPipe Pose
        self.mp_pose = mp.solutions.pose.Pose(
            static_image_mode=True,
            model_complexity=1,
            min_detection_confidence=0.5
        )
        
        logging.info("Models Loaded Successfully.")

    def get_yolo(self):
        return self.yolo

    def get_face_mesh(self):
        return self.mp_face_mesh

    def get_pose(self):
        return self.mp_pose

loader = ModelLoader()
