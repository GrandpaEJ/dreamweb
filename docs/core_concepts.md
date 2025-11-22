# Core Concepts

## Widgets

Everything in DreamWeb is a Widget. Widgets are Python classes that describe the configuration of a UI element.

```python
from dreamweb import App
from dreamweb.common import *

# A simple text widget
Text("Hello")

# A container with styling
Container(
    padding=20,
    background="blue",
    children=[Text("Inside Container")]
)
```

Widgets are immutable configuration objects. When the state changes, DreamWeb rebuilds the widget tree.

## State Management

DreamWeb has a built-in reactive state management system. Use the `State` class to create reactive variables.

```python
from dreamweb import App
from dreamweb.common import *

class MyApp(App):
    def __init__(self):
        super().__init__()
        # Create a reactive state
        self.count = State(0)
    
    def build(self):
        return Column(
            children=[
                # Access value with .value
                Text(f"Count: {self.count.value}"),
                
                # Update value with .set()
                Button(
                    text="Increment",
                    on_click=lambda: self.count.set(self.count.value + 1)
                )
            ]
        )
```

When you call `.set()` on a state object, DreamWeb automatically triggers a rebuild of the UI.

## Styling

DreamWeb uses a parameter-based styling system. You don't need to write CSS classes. Just pass parameters to your widgets.

### Colors
- **Named**: `"primary"`, `"secondary"`, `"success"`, `"danger"`
- **Basic**: `"red"`, `"blue"`, `"green"`, `"white"`, `"black"`
- **Hex**: `"#FF5733"`
- **Gradients**: `"gradient-purple-pink"`, `"gradient-blue-purple"`

### Spacing
Padding and margin can be a single integer (all sides) or a dictionary:

```python
# All sides
padding=20

# Specific sides
padding={'top': 10, 'right': 20, 'bottom': 10, 'left': 20}
```

### Sizes
Use t-shirt sizes (`"sm"`, `"md"`, `"lg"`, `"xl"`) or pixel values (`24`).
