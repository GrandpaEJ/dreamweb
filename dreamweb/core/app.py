"""
App class for DreamWeb
"""

import json
from typing import Any, Dict, List
from abc import ABC, abstractmethod

from dreamweb.core.state import State
from dreamweb.core.widget import Widget


class App:
    """Main application class"""
    
    def __init__(self, title: str = "DreamWeb App", description: str = "Built with DreamWeb", head_tags: List[str] = None):
        self.title = title
        self.description = description
        self.head_tags = head_tags or []
        self._states: List[State] = []
        self._event_handlers: Dict[str, Any] = {}
        self._setup_state_tracking()
    
    def _setup_state_tracking(self):
        """Track all states for re-rendering"""
        for attr_name in dir(self):
            attr = getattr(self, attr_name)
            if isinstance(attr, State):
                self._states.append(attr)
                attr._subscribe(self._trigger_rebuild)
    
    def _trigger_rebuild(self):
        """Trigger app rebuild when state changes"""
        # This will be handled by the dev server / runtime
        pass
    
    @abstractmethod
    def build(self) -> Widget:
        """Build the UI tree - must be implemented by subclass"""
        pass
    
    def _handle_event(self, handler_id: str, value: Any) -> bool:
        """Handle event from client"""
        if handler_id in self._event_handlers:
            handler = self._event_handlers[handler_id]
            # Call handler with value if it accepts arguments, otherwise without
            try:
                if value is not None:
                    handler(value)
                else:
                    handler()
                return True
            except TypeError:
                # Try the other way if first attempt failed
                try:
                    if value is not None:
                        handler()
                    else:
                        handler(value)
                    return True
                except TypeError:
                    return False
        return False

    def _serialize(self) -> str:
        """Serialize the app to JSON for compilation"""
        # Clear handlers before rebuild
        self._event_handlers = {}
        tree = self.build()
        return json.dumps(self._widget_to_dict(tree), indent=2)
    
    def _widget_to_dict(self, widget: Widget) -> Dict[str, Any]:
        """Recursively convert widget tree to dictionary"""
        # Convert widget to dict but keep callables for now
        data = widget.to_dict()
        
        # Process props to find event handlers
        if 'props' in data:
            for key, value in widget.props.items():
                if callable(value) and key.startswith('on_'):
                    # Register handler
                    handler_id = f"{key}_{id(value)}"
                    self._event_handlers[handler_id] = value
                    
                    # Add to events dict in data
                    if 'events' not in data:
                        data['events'] = {}
                    
                    # Map event name (e.g. on_click -> click)
                    event_name = key.replace('on_', '')
                    data['events'][event_name] = handler_id
        
        # Process children
        if 'children' in data and data['children']:
            processed_children = []
            for child in data['children']:
                if isinstance(child, Widget):
                    processed_children.append(self._widget_to_dict(child))
                elif isinstance(child, str):
                    # Text node
                    processed_children.append({'type': 'TextNode', 'text': child})
                elif isinstance(child, (int, float)):
                    processed_children.append({'type': 'TextNode', 'text': str(child)})
            data['children'] = processed_children
        
        return data
    
    def run(self, dev: bool = False, port: int = 8000, host: str = "localhost"):
        """Run the application"""
        import os
        
        # Check environment variable override
        if os.environ.get('DREAMWEB_BUILD'):
            dev = False
        
        if dev:
            from dreamweb.server import DevServer
            server = DevServer(self, port=port, host=host)
            server.start()
        else:
            from dreamweb.builder_module import Builder
            builder = Builder(self)
            builder.build()
            print(f"✅ Build complete! Check the 'build' directory.")
