"""
Advanced widgets for DreamWeb (Raw HTML/CSS)
"""

from typing import Any, Dict
from dreamweb.core.widget import Widget


class Html(Widget):
    """Raw HTML widget for advanced users"""
    
    def __init__(self, html: str = "", **kwargs):
        super().__init__(html=html, **kwargs)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'type': 'Html',
            'props': self.props
        }


class Css(Widget):
    """Raw CSS widget for advanced users"""
    
    def __init__(self, css: str = "", **kwargs):
        super().__init__(css=css, **kwargs)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'type': 'Css',
            'props': self.props
        }
