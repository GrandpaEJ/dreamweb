# API Reference

Complete reference for all DreamWeb widgets and their parameters.

## Layout Widgets

### Container

A flexible box container that can hold other widgets.

**Parameters:**
- `width` (int | str) - Width in pixels or "100%", "auto"
- `height` (int | str) - Height in pixels or "100vh", "auto"
- `padding` (int | dict) - Padding in pixels or `{'top': 10, 'right': 20, 'bottom': 10, 'left': 20}`
- `margin` (int | dict) - Margin in pixels or dict
- `background` (str) - Background color or gradient (e.g., "white", "#FF5733", "gradient-purple-pink")
- `border` (int | dict) - Border width or `{'width': 1, 'color': '#ccc', 'style': 'solid'}`
- `rounded` (int | bool) - Border radius in pixels or True for default
- `shadow` (str) - Box shadow: "sm", "md", "lg", "xl", "2xl", "none"
- `align` (str) - Align items: "start", "center", "end", "stretch"
- `justify` (str) - Justify content: "start", "center", "end", "between", "around"
- `direction` (str) - Flex direction: "row", "column"
- `children` (list) - List of child widgets
- `style` (str) - Custom CSS styles

**Example:**
```python
Container(
    width="100%",
    height=200,
    padding=20,
    background="gradient-blue-purple",
    rounded=16,
    shadow="lg",
    children=[Text("Hello")]
)
```

---

### Row

Arranges children horizontally in a row.

**Parameters:**
- `spacing` (int) - Gap between children in pixels
- `align` (str) - Vertical alignment: "start", "center", "end", "stretch"
- `justify` (str) - Horizontal alignment: "start", "center", "end", "between", "around"
- `wrap` (bool) - Whether to wrap children to next line
- `children` (list) - List of child widgets
- `style` (str) - Custom CSS styles

**Example:**
```python
Row(
    spacing=10,
    align="center",
    justify="between",
    children=[Button("Left"), Button("Right")]
)
```

---

### Column

Arranges children vertically in a column.

**Parameters:**
- `spacing` (int) - Gap between children in pixels
- `align` (str) - Horizontal alignment: "start", "center", "end", "stretch"
- `justify` (str) - Vertical alignment: "start", "center", "end", "between", "around"
- `children` (list) - List of child widgets
- `style` (str) - Custom CSS styles

**Example:**
```python
Column(
    spacing=15,
    align="center",
    children=[Text("Top"), Text("Bottom")]
)
```

---

### Stack

Overlaps children on top of each other.

**Parameters:**
- `children` (list) - List of child widgets (first child is at the bottom)
- `style` (str) - Custom CSS styles

**Example:**
```python
Stack(
    children=[
        Image(src="background.jpg"),
        Text("Overlay Text", color="white")
    ]
)
```

---

### Center

Centers its child widget.

**Parameters:**
- `child` (Widget) - Single child widget to center
- `style` (str) - Custom CSS styles

**Example:**
```python
Center(child=Text("Centered Text"))
```

---

### Spacer

Takes up available space in a Row or Column.

**Parameters:**
- `size` (int) - Optional fixed size in pixels
- `style` (str) - Custom CSS styles

**Example:**
```python
Row(children=[
    Text("Left"),
    Spacer(),
    Text("Right")
])
```

---

## Text Widgets

### Text

Display text with styling options.

**Parameters:**
- `text` (str) - The text to display (first positional argument)
- `size` (str | int) - Font size: "xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl" or pixels
- `weight` (str) - Font weight: "normal", "medium", "semibold", "bold"
- `color` (str) - Text color: named colors, hex, or "primary", "secondary", etc.
- `align` (str) - Text alignment: "left", "center", "right", "justify"
- `italic` (bool) - Italic text
- `underline` (bool) - Underlined text
- `font` (str) - Font family
- `style` (str) - Custom CSS styles

**Example:**
```python
Text(
    "Hello World",
    size="2xl",
    weight="bold",
    color="primary",
    align="center"
)
```

---

### Heading

Semantic heading element (h1-h6).

**Parameters:**
- `text` (str) - The heading text (first positional argument)
- `level` (int) - Heading level 1-6 (default: 1)
- `size` (str | int) - Font size override
- `weight` (str) - Font weight
- `color` (str) - Text color
- `style` (str) - Custom CSS styles

**Example:**
```python
Heading("Page Title", level=1, color="gray-900")
```

---

## Input Widgets

### Button

Clickable button with event handling.

**Parameters:**
- `text` (str) - Button text
- `color` (str) - Button color: "primary", "secondary", "success", "danger", etc.
- `size` (str) - Button size: "sm", "md", "lg", "xl"
- `variant` (str) - Button style: "solid", "outline", "ghost", "link"
- `rounded` (bool) - Rounded corners
- `disabled` (bool) - Disabled state
- `on_click` (callable) - Click event handler
- `style` (str) - Custom CSS styles

**Example:**
```python
Button(
    text="Click Me",
    color="primary",
    size="lg",
    rounded=True,
    on_click=self.handle_click
)
```

---

### TextField

Text input field.

**Parameters:**
- `placeholder` (str) - Placeholder text
- `value` (str) - Current value
- `type` (str) - Input type: "text", "password", "email", "number"
- `disabled` (bool) - Disabled state
- `on_change` (callable) - Change event handler (receives new value)
- `style` (str) - Custom CSS styles

**Example:**
```python
TextField(
    placeholder="Enter your name",
    value=self.name.value,
    on_change=lambda v: self.name.set(v)
)
```

---

### Checkbox

Boolean checkbox toggle.

**Parameters:**
- `checked` (bool) - Checked state
- `label` (str) - Label text
- `disabled` (bool) - Disabled state
- `on_change` (callable) - Change event handler
- `style` (str) - Custom CSS styles

**Example:**
```python
Checkbox(
    checked=self.agreed.value,
    label="I agree to terms",
    on_change=lambda: self.agreed.set(not self.agreed.value)
)
```

---

### Radio

Radio button for selecting one option from a group.

**Parameters:**
- `checked` (bool) - Checked state
- `label` (str) - Label text
- `name` (str) - Radio group name
- `value` (str) - Radio value
- `disabled` (bool) - Disabled state
- `on_change` (callable) - Change event handler
- `style` (str) - Custom CSS styles

**Example:**
```python
Radio(
    checked=self.option.value == "a",
    label="Option A",
    name="options",
    value="a",
    on_change=lambda: self.option.set("a")
)
```

---

### Select

Dropdown select menu.

**Parameters:**
- `options` (list) - List of options (strings or dicts with 'value' and 'label')
- `value` (str) - Selected value
- `placeholder` (str) - Placeholder text
- `disabled` (bool) - Disabled state
- `on_change` (callable) - Change event handler (receives selected value)
- `style` (str) - Custom CSS styles

**Example:**
```python
Select(
    options=["Option 1", "Option 2", "Option 3"],
    value=self.selected.value,
    placeholder="Choose an option",
    on_change=lambda v: self.selected.set(v)
)
```

---

### Slider

Range slider input.

**Parameters:**
- `value` (int | float) - Current value
- `min` (int | float) - Minimum value
- `max` (int | float) - Maximum value
- `step` (int | float) - Step increment
- `disabled` (bool) - Disabled state
- `on_change` (callable) - Change event handler (receives new value)
- `style` (str) - Custom CSS styles

**Example:**
```python
Slider(
    value=self.volume.value,
    min=0,
    max=100,
    step=1,
    on_change=lambda v: self.volume.set(v)
)
```

---

## API Widgets

### ApiRequest

Make HTTP requests with full control over method, headers, and body.

**Parameters:**
- `url` (str) - The URL to request
- `method` (str) - HTTP method: "GET", "POST", "PUT", "DELETE", "PATCH" (default: "GET")
- `headers` (dict) - HTTP headers dictionary
- `body` (any) - Request body (auto-converted to JSON if dict/list)
- `on_success` (callable) - Success callback (receives response data)
- `on_error` (callable) - Error callback (receives error object with 'message', 'name')
- `on_loading` (callable) - Loading state callback (receives boolean)
- `auto_fetch` (bool) - Auto-fetch on mount (default: True)
- `credentials` (str) - CORS credentials: "omit", "same-origin", "include" (default: "same-origin")

**Example:**
```python
ApiRequest(
    url="https://api.example.com/users",
    method="POST",
    headers={"Authorization": "Bearer token"},
    body={"name": "John", "email": "john@example.com"},
    on_success=lambda data: self.users.set(data),
    on_error=lambda err: print(f"Error: {err['message']}"),
    on_loading=lambda loading: self.loading.set(loading)
)
```

---

### FetchData

Simplified widget for GET requests.

**Parameters:**
- `url` (str) - The URL to fetch from
- `headers` (dict) - HTTP headers dictionary
- `on_success` (callable) - Success callback (receives response data)
- `on_error` (callable) - Error callback (receives error object)
- `auto_fetch` (bool) - Auto-fetch on mount (default: True)

**Example:**
```python
FetchData(
    url="https://api.github.com/users/octocat",
    on_success=lambda data: self.user.set(data),
    on_error=lambda err: self.error.set(err['message'])
)
```

---

## Media Widgets

### Image

Display an image.

**Parameters:**
- `src` (str) - Image source URL or path
- `alt` (str) - Alt text for accessibility
- `width` (int | str) - Image width
- `height` (int | str) - Image height
- `fit` (str) - Object fit: "cover", "contain", "fill", "none", "scale-down"
- `rounded` (int | bool) - Border radius
- `style` (str) - Custom CSS styles

**Example:**
```python
Image(
    src="/images/photo.jpg",
    alt="Profile photo",
    width=200,
    height=200,
    fit="cover",
    rounded=100
)
```

---

### Video

Display a video player.

**Parameters:**
- `src` (str) - Video source URL or path
- `controls` (bool) - Show video controls (default: True)
- `autoplay` (bool) - Auto-play video
- `loop` (bool) - Loop video
- `width` (int | str) - Video width
- `height` (int | str) - Video height
- `style` (str) - Custom CSS styles

**Example:**
```python
Video(
    src="/videos/demo.mp4",
    controls=True,
    width="100%"
)
```

---

### Icon

Display an icon (requires icon library).

**Parameters:**
- `name` (str) - Icon name
- `size` (int | str) - Icon size
- `color` (str) - Icon color
- `style` (str) - Custom CSS styles

**Example:**
```python
Icon(name="heart", size=24, color="red")
```

---

## Navigation Widgets

### Link

Clickable link/anchor element.

**Parameters:**
- `text` (str) - Link text
- `to` (str) - URL or path to navigate to
- `color` (str) - Link color
- `underline` (bool) - Show underline
- `style` (str) - Custom CSS styles

**Example:**
```python
Link(
    text="Visit GitHub",
    to="https://github.com",
    color="primary",
    underline=True
)
```

---

## Advanced Widgets

### Html

Render raw HTML content.

**Parameters:**
- `html` (str) - Raw HTML string to render

**Example:**
```python
Html(html='<div class="custom">Custom HTML</div>')
```

**Warning:** Be careful with user-generated content to avoid XSS attacks.

---

### Css

Inject custom CSS styles.

**Parameters:**
- `css` (str) - CSS stylesheet string

**Example:**
```python
Css(css='''
    .custom-class {
        color: red;
        font-weight: bold;
    }
''')
```

---

## State Management

### State

Reactive state container that triggers re-renders on changes.

**Parameters:**
- `initial_value` (any) - Initial state value

**Properties:**
- `value` - Get current state value

**Methods:**
- `set(new_value)` - Update state value
- `update(updater_fn)` - Update using a function

**Example:**
```python
class MyApp(App):
    def __init__(self):
        super().__init__()
        self.count = State(0)
        self.name = State("John")
    
    def increment(self):
        self.count.set(self.count.value + 1)
    
    def build(self):
        return Text(f"Count: {self.count.value}")
```

---

## Color Reference

### Named Colors

- `primary` - #3b82f6 (blue)
- `secondary` - #6b7280 (gray)
- `success` - #10b981 (green)
- `danger` - #ef4444 (red)
- `warning` - #f59e0b (orange)
- `info` - #06b6d4 (cyan)
- `black` - #000000
- `white` - #ffffff
- `gray` - #6b7280
- `red` - #ef4444
- `blue` - #3b82f6
- `green` - #10b981
- `yellow` - #f59e0b
- `purple` - #8b5cf6
- `pink` - #ec4899

### Gradients

Use format: `gradient-{color1}-{color2}`

Examples:
- `gradient-purple-pink`
- `gradient-blue-purple`
- `gradient-red-yellow`

### Custom Colors

Use hex codes: `#FF5733`, `#3498db`, etc.

---

## Size Reference

### Text Sizes

- `xs` - 0.75rem (12px)
- `sm` - 0.875rem (14px)
- `md` - 1rem (16px)
- `lg` - 1.125rem (18px)
- `xl` - 1.25rem (20px)
- `2xl` - 1.5rem (24px)
- `3xl` - 1.875rem (30px)
- `4xl` - 2.25rem (36px)

### Button Sizes

- `sm` - Small button
- `md` - Medium button (default)
- `lg` - Large button
- `xl` - Extra large button

### Shadow Sizes

- `sm` - Small shadow
- `md` - Medium shadow
- `lg` - Large shadow
- `xl` - Extra large shadow
- `2xl` - 2X large shadow
- `none` - No shadow

---

## Event Handlers

All event handlers are Python callable functions that receive event-specific data.

### Common Events

- `on_click` - Click events (no parameters)
- `on_change` - Value change events (receives new value)
- `on_success` - API success events (receives response data)
- `on_error` - API error events (receives error object)
- `on_loading` - Loading state events (receives boolean)

**Example:**
```python
def handle_click(self):
    print("Button clicked!")

def handle_change(self, value):
    self.name.set(value)

Button(text="Click", on_click=self.handle_click)
TextField(on_change=self.handle_change)
```

---

## App Class

### App

Base class for DreamWeb applications.

**Parameters:**
- `title` (str) - Page title (default: "DreamWeb App")
- `description` (str) - Meta description (default: "Built with DreamWeb")
- `head_tags` (list) - Additional HTML head tags

**Methods:**
- `build()` - Abstract method to build UI (must be implemented)
- `run(dev=True, port=8000, host="localhost")` - Run the application

**Example:**
```python
from dreamweb import App
from dreamweb.common import *

class MyApp(App):
    def __init__(self):
        super().__init__(
            title="My Awesome App",
            description="An amazing app built with DreamWeb"
        )
        self.count = State(0)
    
    def build(self):
        return Container(
            children=[
                Text(f"Count: {self.count.value}"),
                Button(
                    text="Increment",
                    on_click=lambda: self.count.set(self.count.value + 1)
                )
            ]
        )

if __name__ == "__main__":
    MyApp().run(dev=True)
```
