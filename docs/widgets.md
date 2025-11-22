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

## Media Widgets

### Image
Display an image.
```python
Image(
    src="/path/to/image.jpg",
    width=200,
    height=200,
    fit="cover", # cover, contain, fill
    rounded=8
)
```

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
