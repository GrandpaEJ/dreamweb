"""
Layout widgets for DreamWeb
"""

from typing import Any, Dict, List, Optional, Union
from dreamweb.core.widget import Widget


class Container(Widget):
    """
    A container widget for layout and styling
    
    Parameters:
        width: Width (int for px, str for %, "auto", "full")
        height: Height (int for px, str for %, "auto", "full")
        padding: Padding (int or dict with top/right/bottom/left)
        margin: Margin (int or dict with top/right/bottom/left)
        background: Background color or gradient (e.g., "blue", "#FF5733", "gradient-purple-pink")
        border: Border (int for width, or dict with width/color/style)
        rounded: Border radius (int or bool)
        shadow: Box shadow ("sm", "md", "lg", "xl", "2xl", "none")
        align: Align items ("start", "center", "end", "stretch")
        justify: Justify content ("start", "center", "end", "between", "around")
        direction: Flex direction ("row", "column")
        children: List of child widgets
    """
    
    def __init__(
        self,
        width: Union[int, str] = "auto",
        height: Union[int, str] = "auto",
        padding: Union[int, Dict[str, int]] = 0,
        margin: Union[int, Dict[str, int]] = 0,
        background: Optional[str] = None,
        border: Union[int, Dict[str, Any]] = None,
        rounded: Union[bool, int] = False,
        shadow: Optional[str] = None,
        align: str = "stretch",
        justify: str = "start",
        direction: str = "column",
        children: List[Widget] = None,
        **kwargs
    ):
        super().__init__(
            width=width,
            height=height,
            padding=padding,
            margin=margin,
            background=background,
            border=border,
            rounded=rounded,
            shadow=shadow,
            align=align,
            justify=justify,
            direction=direction,
            children=children or [],
            **kwargs
        )
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'type': 'Container',
            'props': {k: v for k, v in self.props.items() if k != 'children'},
            'children': self.children
        }


class Row(Widget):
    """Horizontal layout widget"""
    
    def __init__(
        self,
        spacing: int = 0,
        align: str = "start",
        justify: str = "start",
        wrap: bool = False,
        children: List[Widget] = None,
        **kwargs
    ):
        super().__init__(
            spacing=spacing,
            align=align,
            justify=justify,
            wrap=wrap,
            children=children or [],
            **kwargs
        )
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'type': 'Row',
            'props': {k: v for k, v in self.props.items() if k != 'children'},
            'children': self.children
        }


class Column(Widget):
    """Vertical layout widget"""
    
    def __init__(
        self,
        spacing: int = 0,
        align: str = "start",
        justify: str = "start",
        children: List[Widget] = None,
        **kwargs
    ):
        super().__init__(
            spacing=spacing,
            align=align,
            justify=justify,
            children=children or [],
            **kwargs
        )
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'type': 'Column',
            'props': {k: v for k, v in self.props.items() if k != 'children'},
            'children': self.children
        }


class Stack(Widget):
    """Stack widgets on top of each other"""
    
    def __init__(self, children: List[Widget] = None, **kwargs):
        super().__init__(children=children or [], **kwargs)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'type': 'Stack',
            'props': {k: v for k, v in self.props.items() if k != 'children'},
            'children': self.children
        }


class Center(Widget):
    """Center a widget"""
    
    def __init__(self, child: Widget = None, **kwargs):
        super().__init__(children=[child] if child else [], **kwargs)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'type': 'Center',
            'props': {k: v for k, v in self.props.items() if k != 'children'},
            'children': self.children
        }


class Spacer(Widget):
    """Flexible space between widgets"""
    
    def __init__(self, size: int = None, **kwargs):
        super().__init__(size=size, **kwargs)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'type': 'Spacer',
            'props': self.props
        }
