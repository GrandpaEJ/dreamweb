"""
Text widgets for DreamWeb
"""

from typing import Any, Dict, Optional, Union
from dreamweb.core.widget import Widget


class Text(Widget):
    """
    Text widget
    
    Parameters:
        text: Text content
        size: Font size (int for px, or "sm", "md", "lg", "xl", "2xl", etc.)
        weight: Font weight ("normal", "medium", "semibold", "bold")
        color: Text color
        align: Text alignment ("left", "center", "right", "justify")
        italic: Italic text (bool)
        underline: Underline text (bool)
        font: Font family
    """
    
    def __init__(
        self,
        text: str = "",
        size: Union[int, str] = "md",
        weight: str = "normal",
        color: str = "black",
        align: str = "left",
        italic: bool = False,
        underline: bool = False,
        font: Optional[str] = None,
        **kwargs
    ):
        super().__init__(
            text=text,
            size=size,
            weight=weight,
            color=color,
            align=align,
            italic=italic,
            underline=underline,
            font=font,
            **kwargs
        )
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'type': 'Text',
            'props': self.props
        }


class Heading(Widget):
    """Heading widget (H1-H6)"""
    
    def __init__(
        self,
        text: str = "",
        level: int = 1,
        color: str = "black",
        weight: str = "bold",
        **kwargs
    ):
        super().__init__(
            text=text,
            level=level,
            color=color,
            weight=weight,
            **kwargs
        )
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'type': 'Heading',
            'props': self.props
        }
