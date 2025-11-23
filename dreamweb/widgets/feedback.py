"""
Feedback widgets for DreamWeb (Toast, Modal, etc.)
"""

from typing import Any, Dict, Optional
from dreamweb.core.widget import Widget


class Toast(Widget):
    """
    Show temporary notification messages
    
    Parameters:
        message: Message to display
        duration: Duration in milliseconds (default: 3000)
        position: Position on screen (default: "top-right")
    """
    js_module = "widgets/toast.js"
    
    def __init__(
        self,
        message: str,
        duration: int = 3000,
        position: str = "top-right",
        **kwargs
    ):
        super().__init__(
            message=message,
            duration=duration,
            position=position,
            **kwargs
        )
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'type': 'Toast',
            'props': self.props,
            'js_module': self.js_module
        }
