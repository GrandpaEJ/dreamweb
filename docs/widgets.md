# Widget Library

## Layout Widgets

### Container
A box that can contain other widgets and apply styling.
```python
Container(
    width="100%",
    height=200,
    padding=20,
    margin=10,
    background="white",
    border="1px solid gray",
    rounded=8,
    shadow="md",
    children=[...]
)
```

### Row
Arranges children horizontally.
```python
Row(
    spacing=10,
    align="center",   # start, center, end, stretch
    justify="center", # start, center, end, between, around
    wrap=False,
    children=[...]
)
```

### Column
Arranges children vertically.
```python
Column(
    spacing=10,
    align="center",
    justify="center",
    children=[...]
)
```

### Stack
Overlaps children on top of each other.
```python
Stack(
    children=[
        Image(...),
        Text("Overlay Text")
    ]
)
```

### Center
Centers its child within itself.
```python
Center(
    child=Text("Centered")
)
```

### Spacer
Takes up available space in a Row or Column.
```python
Row(children=[
    Text("Left"),
    Spacer(),
    Text("Right")
])
```

## Text Widgets

### Text
Basic text widget.
```python
Text(
    "Hello World",
    size="lg",
    weight="bold",
    color="primary",
    align="center",
    italic=False,
    underline=False
)
```

### Heading
Semantic heading (h1-h6).
```python
Heading(
    "Title",
    level=1,
    color="gray-900"
)
```

## Input Widgets

### Button
Clickable button.
```python
Button(
    text="Click Me",
    color="primary",
    size="md",
    variant="solid", # solid, outline, ghost
    rounded=True,
    on_click=my_handler
)
```

### TextField
Text input field.
```python
TextField(
    placeholder="Enter name",
    value=self.name.value,
    type="text", # text, password, email
    on_change=lambda v: self.name.set(v)
)
```

### Checkbox
Boolean toggle.
```python
Checkbox(
    checked=True,
    label="Accept terms",
    on_change=lambda: ...
)
```

## API Widgets

### ApiRequest
Make HTTP requests with full control over method, headers, and body.
```python
ApiRequest(
    url="https://api.example.com/users",
    method="POST",  # GET, POST, PUT, DELETE, PATCH
    headers={"Authorization": "Bearer token"},
    body={"name": "John", "email": "john@example.com"},
    on_success=lambda data: self.handle_success(data),
    on_error=lambda error: self.handle_error(error),
    on_loading=lambda loading: self.set_loading(loading),
    auto_fetch=True,  # Automatically fetch on mount
    credentials="same-origin"  # omit, same-origin, include
)
```

### FetchData
Simplified widget for GET requests.
```python
FetchData(
    url="https://api.github.com/users/octocat",
    on_success=lambda data: self.user.set(data),
    on_error=lambda error: print(error),
    auto_fetch=True
)
```

**Example Usage:**
```python
from dreamweb import App
from dreamweb.common import *

class ApiApp(App):
    def __init__(self):
        super().__init__()
        self.data = State(None)
        self.loading = State(False)
    
    def on_success(self, data):
        self.data.set(data)
        self.loading.set(False)
    
    def build(self):
        return Container(children=[
            FetchData(
                url="https://api.example.com/data",
                on_success=self.on_success,
                on_loading=lambda l: self.loading.set(l)
            ),
            Text("Loading..." if self.loading.value else 
                 f"Data: {self.data.value}")
        ])
```

See [API Widget Documentation](widgets/api.md) for more details.

## Advanced

### Html
Render raw HTML.
```python
Html(html="<div class='custom'>Custom HTML</div>")
```

### Css
Inject raw CSS.
```python
Css(css=".custom { color: red; }")
```
