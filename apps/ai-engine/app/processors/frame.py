import cv2
import numpy as np
import base64
from typing import Tuple

class FrameProcessor:
    @staticmethod
    def decode_base64(base64_string: str) -> np.ndarray:
        if "," in base64_string:
            base64_string = base64_string.split(",")[1]
        
        encoded_data = base64.b64decode(base64_string)
        nparr = np.frombuffer(encoded_data, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        return frame

    @staticmethod
    def resize(frame: np.ndarray, target_width: int = 640) -> Tuple[np.ndarray, float]:
        h, w = frame.shape[:2]
        ratio = target_width / w
        target_height = int(h * ratio)
        resized_frame = cv2.resize(frame, (target_width, target_height))
        return resized_frame, ratio

    @staticmethod
    def preprocess(frame: np.ndarray) -> np.ndarray:
        # For certain models, we might need RGB
        return cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
