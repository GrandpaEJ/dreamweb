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
    
    def __init__(self):
        self._states: List[State] = []
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
    
    def _serialize(self) -> str:
        """Serialize the app to JSON for compilation"""
        tree = self.build()
        return json.dumps(self._widget_to_dict(tree), indent=2)
    
    def _widget_to_dict(self, widget: Widget) -> Dict[str, Any]:
        """Recursively convert widget tree to dictionary"""
        data = widget.to_dict()
        
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
        if dev:
            from dreamweb.server import DevServer
            server = DevServer(self, port=port, host=host)
            server.start()
        else:
            from dreamweb.build import Builder
            builder = Builder(self)
            builder.build()
            print(f"✅ Build complete! Check the 'build' directory.")
