"""
Input widgets for DreamWeb
"""

from typing import Any, Callable, Dict, List, Optional, Union
from dreamweb.core.widget import Widget


class Button(Widget):
    """
    Button widget
    
    Parameters:
        text: Button text
        color: Button color ("primary", "secondary", "success", "danger", "warning", "info", or hex)
        size: Button size ("sm", "md", "lg", "xl")
        variant: Button style ("solid", "outline", "ghost", "link")
        rounded: Border radius (bool or int)
        icon: Icon name (optional)
        disabled: Disabled state (bool)
        on_click: Click event handler
    """
    
    def __init__(
        self,
        text: str = "",
        color: str = "primary",
        size: str = "md",
        variant: str = "solid",
        rounded: Union[bool, int] = True,
        icon: Optional[str] = None,
        disabled: bool = False,
        on_click: Optional[Callable] = None,
        **kwargs
    ):
        super().__init__(
            text=text,
            color=color,
            size=size,
            variant=variant,
            rounded=rounded,
            icon=icon,
            disabled=disabled,
            on_click=on_click,
            **kwargs
        )
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'type': 'Button',
            'props': {k: v for k, v in self.props.items() if k != 'on_click'}
        }


class TextField(Widget):
    """Text input field"""
    
    def __init__(
        self,
        placeholder: str = "",
        value: str = "",
        type: str = "text",
        disabled: bool = False,
        on_change: Optional[Callable] = None,
        **kwargs
    ):
        super().__init__(
            placeholder=placeholder,
            value=value,
            type=type,
            disabled=disabled,
            on_change=on_change,
            **kwargs
        )
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'type': 'TextField',
            'props': {k: v for k, v in self.props.items() if k != 'on_change'}
        }


class Checkbox(Widget):
    """Checkbox widget"""
    
    def __init__(
        self,
        checked: bool = False,
        label: str = "",
        disabled: bool = False,
        on_change: Optional[Callable] = None,
        **kwargs
    ):
        super().__init__(
            checked=checked,
            label=label,
            disabled=disabled,
            on_change=on_change,
            **kwargs
        )
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'type': 'Checkbox',
            'props': {k: v for k, v in self.props.items() if k != 'on_change'}
        }


class Radio(Widget):
    """Radio button widget"""
    
    def __init__(
        self,
        checked: bool = False,
        label: str = "",
        name: str = "",
        value: str = "",
        on_change: Optional[Callable] = None,
        **kwargs
    ):
        super().__init__(
            checked=checked,
            label=label,
            name=name,
            value=value,
            on_change=on_change,
            **kwargs
        )
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'type': 'Radio',
            'props': {k: v for k, v in self.props.items() if k != 'on_change'}
        }


class Select(Widget):
    """Dropdown select widget"""
    
    def __init__(
        self,
        options: List[Dict[str, str]] = None,
        value: str = "",
        placeholder: str = "Select...",
        on_change: Optional[Callable] = None,
        **kwargs
    ):
        super().__init__(
            options=options or [],
            value=value,
            placeholder=placeholder,
            on_change=on_change,
            **kwargs
        )
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'type': 'Select',
            'props': {k: v for k, v in self.props.items() if k != 'on_change'}
        }


class Slider(Widget):
    """Slider widget"""
    
    def __init__(
        self,
        value: float = 0,
        min: float = 0,
        max: float = 100,
        step: float = 1,
        on_change: Optional[Callable] = None,
        **kwargs
    ):
        super().__init__(
            value=value,
            min=min,
            max=max,
            step=step,
            on_change=on_change,
            **kwargs
        )
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'type': 'Slider',
            'props': {k: v for k, v in self.props.items() if k != 'on_change'}
        }
