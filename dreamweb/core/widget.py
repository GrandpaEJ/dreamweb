"""
Widget base class for DreamWeb
"""

from typing import Any, Dict
from abc import ABC, abstractmethod


class Widget(ABC):
    """Base class for all widgets"""
    
    def __init__(self, **kwargs):
        self.props = kwargs
        self.children = kwargs.get('children', [])
        self.key = kwargs.get('key', None)
    
    @abstractmethod
    def to_dict(self) -> Dict[str, Any]:
        """Convert widget to dictionary for serialization"""
        pass
    
    def __repr__(self):
        return f"{self.__class__.__name__}({self.props})"
