"""
State management for DreamWeb
"""

from typing import Any, Callable, List


class State:
    """Reactive state management"""
    
    def __init__(self, initial_value: Any):
        self._value = initial_value
        self._listeners: List[Callable] = []
    
    @property
    def value(self) -> Any:
        return self._value
    
    def set(self, new_value: Any):
        """Update state value and trigger re-render"""
        if self._value != new_value:
            self._value = new_value
            self._notify_listeners()
    
    def update(self, updater: Callable[[Any], Any]):
        """Update state using a function"""
        self.set(updater(self._value))
    
    def _notify_listeners(self):
        for listener in self._listeners:
            listener()
    
    def _subscribe(self, listener: Callable):
        self._listeners.append(listener)
