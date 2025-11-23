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


class Router(Widget):
    """
    Client-side page navigation widget
    
    Parameters:
        page: State object for current page
        pages: Dict mapping page names to widgets
    """
    js_module = "widgets/router.js"
    
    def __init__(self, page, pages, **kwargs):
        super().__init__(
            page=page,
            pages=pages,
            **kwargs
        )
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'type': 'Router',
            'props': {
                'page': self.props['page'],
                'pages': self.props['pages'],
            },
            'js_module': self.js_module
        }

