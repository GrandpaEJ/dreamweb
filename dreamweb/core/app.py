"""
App class for DreamWeb
"""

import json
from typing import Any, Dict, List
from abc import abstractmethod

from dreamweb.core.state import State
from dreamweb.core.widget import Widget


class App:
    """Main application class"""

    def __init__(
        self,
        title: str = "DreamWeb App",
        description: str = "Built with DreamWeb",
        head_tags: List[str] = None,
    ):
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
        """Trigger app rebuild when state changes — handled by the server"""
        pass

    @abstractmethod
    def build(self) -> Widget:
        """Build the UI tree - must be implemented by subclass"""
        pass

    def _handle_event(self, handler_id: str, value: Any) -> bool:
        """Handle event from client"""
        if handler_id in self._event_handlers:
            handler = self._event_handlers[handler_id]
            try:
                if value is not None:
                    handler(value)
                else:
                    handler()
                return True
            except TypeError:
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
        """Serialize the widget tree to JSON for the server to send to the client"""
        # Clear handlers before rebuild so stale IDs don't accumulate
        self._event_handlers = {}
        tree = self.build()

        # Collect current state values
        states = {}
        for attr_name in dir(self):
            attr = getattr(self, attr_name)
            if isinstance(attr, State):
                states[attr_name] = attr.value

        data = {
            "tree": self._widget_to_dict(tree),
            "states": states,
        }
        return json.dumps(data, indent=2)

    def _widget_to_dict(self, widget: Widget) -> Dict[str, Any]:
        """Recursively convert widget tree to dictionary"""
        data = widget.to_dict()

        # Process props to find and register event handlers
        if "props" in data:
            for key, value in widget.props.items():
                if callable(value) and key.startswith("on_"):
                    handler_id = f"{key}_{id(value)}"
                    self._event_handlers[handler_id] = value

                    if "events" not in data:
                        data["events"] = {}

                    # Map on_click -> click, on_change -> change, etc.
                    event_name = key[3:]  # strip 'on_'
                    data["events"][event_name] = handler_id

        # Recursively process children
        if "children" in data and data["children"]:
            processed_children = []
            for child in data["children"]:
                if isinstance(child, Widget):
                    processed_children.append(self._widget_to_dict(child))
                elif isinstance(child, str):
                    processed_children.append({"type": "TextNode", "text": child})
                elif isinstance(child, (int, float)):
                    processed_children.append({"type": "TextNode", "text": str(child)})
            data["children"] = processed_children

        return data

    def run(
        self,
        dev: bool = False,
        port: int = 8000,
        host: str = "localhost",
        static: bool = False,
    ):
        """Run the application"""
        import os

        # Check environment variable override
        if os.environ.get("DREAMWEB_BUILD"):
            dev = False

        if os.environ.get("DREAMWEB_STATIC"):
            static = True

        if dev:
            from dreamweb.server import DevServer

            server = DevServer(self, port=port, host=host)
            server.start()
        else:
            from dreamweb.builder_module import Builder

            builder = Builder(self)
            builder.build(static=static)
            print("✅ Build complete! Check the 'build' directory.")
