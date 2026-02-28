"""
Tests for Phase 1 — serialization and event handling.
Tests that _serialize() no longer contains a 'handlers' key
and that _handle_event() dispatches correctly.
"""

import json

import sys
import os

# Make sure the package is importable
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from dreamweb.core import App
from dreamweb.core.state import State
from dreamweb.widgets.layout import Container
from dreamweb.widgets.text import Text
from dreamweb.widgets.input import Button


# ---------------------------------------------------------------------------
# Minimal test app
# ---------------------------------------------------------------------------


class CounterApp(App):
    def __init__(self):
        super().__init__(title="Counter Test")
        self.count = State(0)

    def build(self):
        return Container(
            children=[
                Text(f"Count: {self.count.value}", size="xl"),
                Button(
                    text="Increment",
                    color="blue",
                    on_click=lambda: self.count.set(self.count.value + 1),
                ),
            ]
        )


# ---------------------------------------------------------------------------
# Tests: _serialize()
# ---------------------------------------------------------------------------


class TestSerialize:
    def setup_method(self):
        self.app = CounterApp()

    def test_serialize_returns_valid_json(self):
        data = json.loads(self.app._serialize())
        assert isinstance(data, dict)

    def test_serialize_has_tree_key(self):
        data = json.loads(self.app._serialize())
        assert "tree" in data

    def test_serialize_has_states_key(self):
        data = json.loads(self.app._serialize())
        assert "states" in data
        assert data["states"]["count"] == 0

    def test_serialize_does_NOT_have_handlers_key(self):
        """Phase 1 requirement: no serialized JS handler code in the output"""
        data = json.loads(self.app._serialize())
        assert "handlers" not in data, (
            "'handlers' key must NOT be present — Python handlers should never be "
            "serialized to JavaScript. Events go via WebSocket."
        )

    def test_tree_events_use_handler_ids(self):
        """Events in the tree must be handler IDs (strings), not raw JS code"""
        data = json.loads(self.app._serialize())

        def find_events(node):
            if isinstance(node, dict):
                if "events" in node:
                    for k, v in node["events"].items():
                        assert isinstance(
                            v, str
                        ), f"Event value '{v}' must be a string handler ID"
                for child in node.get("children", []):
                    find_events(child)

        find_events(data["tree"])


# ---------------------------------------------------------------------------
# Tests: _handle_event()
# ---------------------------------------------------------------------------


class TestHandleEvent:
    def setup_method(self):
        self.app = CounterApp()
        # Trigger serialization so handler IDs are registered
        self.data = json.loads(self.app._serialize())

    def _get_click_handler_id(self):
        """Walk the tree to find the click event handler ID for the button"""

        def search(node):
            if isinstance(node, dict):
                events = node.get("events", {})
                if "click" in events:
                    return events["click"]
                for child in node.get("children", []):
                    result = search(child)
                    if result:
                        return result
            return None

        return search(self.data["tree"])

    def test_handle_event_returns_true_for_valid_handler(self):
        handler_id = self._get_click_handler_id()
        assert handler_id is not None, "No click handler found in tree"
        result = self.app._handle_event(handler_id, None)
        assert result is True

    def test_handle_event_updates_state(self):
        handler_id = self._get_click_handler_id()
        assert handler_id is not None
        self.app._handle_event(handler_id, None)
        assert self.app.count.value == 1

    def test_handle_event_returns_false_for_unknown_id(self):
        result = self.app._handle_event("nonexistent_handler_id", None)
        assert result is False

    def test_state_increments_multiple_clicks(self):
        handler_id = self._get_click_handler_id()
        for _ in range(5):
            self.app._handle_event(handler_id, None)
        assert self.app.count.value == 5


# ---------------------------------------------------------------------------
# Tests: State
# ---------------------------------------------------------------------------


class TestState:
    def test_state_initial_value(self):
        s = State(42)
        assert s.value == 42

    def test_state_set(self):
        s = State(0)
        s.set(10)
        assert s.value == 10

    def test_state_listener_called_on_change(self):
        called = []
        s = State(0)
        s._subscribe(lambda: called.append(True))
        s.set(1)
        assert len(called) == 1

    def test_state_listener_not_called_if_value_unchanged(self):
        called = []
        s = State(5)
        s._subscribe(lambda: called.append(True))
        s.set(5)  # same value
        assert len(called) == 0
