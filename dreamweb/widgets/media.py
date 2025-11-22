"""
Media widgets for DreamWeb
"""

from typing import Any, Dict, Optional, Union
from dreamweb.core.widget import Widget


class Image(Widget):
    """Image widget"""
    
    def __init__(
        self,
        src: str = "",
        width: Union[int, str] = "auto",
        height: Union[int, str] = "auto",
        fit: str = "cover",
        rounded: Union[bool, int] = False,
        alt: str = "",
        **kwargs
    ):
        super().__init__(
            src=src,
            width=width,
            height=height,
            fit=fit,
            rounded=rounded,
            alt=alt,
            **kwargs
        )
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'type': 'Image',
            'props': self.props
        }


class Video(Widget):
    """Video widget"""
    
    def __init__(
        self,
        src: str = "",
        controls: bool = True,
        autoplay: bool = False,
        loop: bool = False,
        muted: bool = False,
        **kwargs
    ):
        super().__init__(
            src=src,
            controls=controls,
            autoplay=autoplay,
            loop=loop,
            muted=muted,
            **kwargs
        )
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'type': 'Video',
            'props': self.props
        }


class Icon(Widget):
    """Icon widget (using icon libraries)"""
    
    def __init__(
        self,
        name: str = "",
        size: Union[int, str] = "md",
        color: str = "currentColor",
        **kwargs
    ):
        super().__init__(
            name=name,
            size=size,
            color=color,
            **kwargs
        )
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'type': 'Icon',
            'props': self.props
        }
