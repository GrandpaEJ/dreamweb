"""
Navigation widgets for DreamWeb
"""

from typing import Any, Dict
from dreamweb.core.widget import Widget


class Link(Widget):
    """Link widget"""
    
    def __init__(
        self,
        text: str = "",
        to: str = "#",
        color: str = "blue",
        underline: bool = True,
        **kwargs
    ):
        super().__init__(
            text=text,
            to=to,
            color=color,
            underline=underline,
            **kwargs
        )
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'type': 'Link',
            'props': self.props
        }
