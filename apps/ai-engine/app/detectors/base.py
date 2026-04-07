from abc import ABC, abstractmethod
import numpy as np
from typing import Any, Dict

class BaseDetector(ABC):
    @abstractmethod
    def detect(self, frame: np.ndarray, config: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Main detection interface.
        :param frame: Preprocessed image frame (RGB)
        :param config: Configuration parameters for specific detection logic
        :return: Detection results dictionary
        """
        pass
