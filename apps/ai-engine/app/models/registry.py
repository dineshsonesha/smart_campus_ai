from ..detectors.classroom import ClassroomDetector
from ..detectors.parking import ParkingDetector
from ..detectors.entrance import EntranceDetector
from ..detectors.lab import LabDetector
from ..detectors.base import BaseDetector
from typing import Dict, Type

class DetectorRegistry:
    _detectors: Dict[str, BaseDetector] = {
        "classroom": ClassroomDetector(),
        "parking": ParkingDetector(),
        "entrance": EntranceDetector(),
        "lab": LabDetector()
    }

    @classmethod
    def get_detector(cls, category: str) -> BaseDetector:
        return cls._detectors.get(category.lower())

    @classmethod
    def list_categories(cls):
        return list(cls._detectors.keys())
