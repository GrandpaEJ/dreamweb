"""
API request widgets for DreamWeb
"""

from typing import Any, Dict, Optional, Callable
from dreamweb.core.widget import Widget


class ApiRequest(Widget):
    """
    Make HTTP API requests from the browser
    
    Parameters:
        url: The URL to make the request to
        method: HTTP method (GET, POST, PUT, DELETE, etc.) - default: "GET"
        headers: Optional dictionary of HTTP headers
        body: Optional request body (will be JSON stringified if dict/list)
        on_success: Callback function when request succeeds (receives response data)
        on_error: Callback function when request fails (receives error)
        on_loading: Callback function when loading state changes (receives boolean)
        auto_fetch: Whether to automatically fetch on mount (default: True)
        credentials: Include credentials (cookies) - "omit", "same-origin", or "include"
    
    Example:
        ```python
        from dreamweb import ApiRequest, State
        
        state = State()
        
        def handle_success(data):
            state.set('users', data)
        
        def handle_error(error):
            state.set('error', str(error))
        
        ApiRequest(
            url="https://api.example.com/users",
            method="GET",
            on_success=handle_success,
            on_error=handle_error
        )
        ```
    """
    js_module = "widgets/api.js"
    
    def __init__(
        self,
        url: str,
        method: str = "GET",
        headers: Optional[Dict[str, str]] = None,
        body: Any = None,
        on_success: Optional[Callable] = None,
        on_error: Optional[Callable] = None,
        on_loading: Optional[Callable] = None,
        auto_fetch: bool = True,
        credentials: str = "same-origin",
        **kwargs
    ):
        super().__init__(
            url=url,
            method=method.upper(),
            headers=headers or {},
            body=body,
            on_success=on_success,
            on_error=on_error,
            on_loading=on_loading,
            auto_fetch=auto_fetch,
            credentials=credentials,
            **kwargs
        )
    
    def to_dict(self) -> Dict[str, Any]:
        # Filter out callback functions for serialization
        props = {k: v for k, v in self.props.items() 
                if not callable(v)}
        
        # Store callback references
        callbacks = {}
        if self.props.get('on_success'):
            callbacks['on_success'] = id(self.props['on_success'])
        if self.props.get('on_error'):
            callbacks['on_error'] = id(self.props['on_error'])
        if self.props.get('on_loading'):
            callbacks['on_loading'] = id(self.props['on_loading'])
        
        return {
            'type': 'ApiRequest',
            'props': props,
            'callbacks': callbacks,
            'js_module': self.js_module
        }


class FetchData(Widget):
    """
    Simplified widget for fetching data from an API (GET requests only)
    
    Parameters:
        url: The URL to fetch data from
        headers: Optional dictionary of HTTP headers
        on_success: Callback function when request succeeds
        on_error: Callback function when request fails
        auto_fetch: Whether to automatically fetch on mount (default: True)
    
    Example:
        ```python
        from dreamweb import FetchData, State
        
        state = State()
        
        FetchData(
            url="https://api.github.com/users/octocat",
            on_success=lambda data: state.set('user', data)
        )
        ```
    """
    js_module = "widgets/api.js"
    
    def __init__(
        self,
        url: str,
        headers: Optional[Dict[str, str]] = None,
        on_success: Optional[Callable] = None,
        on_error: Optional[Callable] = None,
        auto_fetch: bool = True,
        **kwargs
    ):
        super().__init__(
            url=url,
            method="GET",
            headers=headers or {},
            on_success=on_success,
            on_error=on_error,
            auto_fetch=auto_fetch,
            **kwargs
        )
    
    def to_dict(self) -> Dict[str, Any]:
        # Filter out callback functions for serialization
        props = {k: v for k, v in self.props.items() 
                if not callable(v)}
        
        # Store callback references
        callbacks = {}
        if self.props.get('on_success'):
            callbacks['on_success'] = id(self.props['on_success'])
        if self.props.get('on_error'):
            callbacks['on_error'] = id(self.props['on_error'])
        
        return {
            'type': 'FetchData',
            'props': props,
            'callbacks': callbacks,
            'js_module': self.js_module
        }
