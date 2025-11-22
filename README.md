# 🚀 DreamWeb

**A Flutter-like Python Web Framework**

Build beautiful web UIs using pure Python with a Flutter-style API. No HTML, CSS, or JavaScript knowledge required!

## ✨ Features

- 🎨 **Flutter-Style Widgets** - Familiar API with `Container`, `Row`, `Column`, `Text`, `Button`, etc.
- 🎯 **Parameter-Based Styling** - Style everything with simple parameters, no CSS needed
- ⚡ **Hot Reload** - See changes instantly in dev mode
- 🔄 **Reactive State** - Built-in state management with automatic re-rendering
- 📦 **Single Build Output** - Compiles to `index.html` + `dreamweb.js`
- 🎭 **Raw HTML/CSS Support** - Advanced users can use `Html()` and `Css()` widgets

## 🚀 Quick Start

### Installation

```bash
pip install dreamweb
```

### Create Your First App

```python
from dreamweb import App, Container, Text, Button, Row, State


class CounterApp(App):
    def __init__(self):
        super().__init__()
        self.count = State(0)
    
    def build(self):
        return Container(
            width="100%",
            height="100vh",
            background="gradient-purple-pink",
            align="center",
            justify="center",
            children=[
                Container(
                    width=400,
                    padding=40,
                    background="white",
                    rounded=16,
                    shadow="xl",
                    children=[
                        Text(
                            "Counter App",
                            size="2xl",
                            weight="bold",
                            color="gray-900"
                        ),
                        Text(
                            f"Count: {self.count.value}",
                            size="xl",
                            color="gray-700"
                        ),
                        Row(
                            spacing=10,
                            children=[
                                Button(
                                    text="Increment",
                                    color="blue",
                                    size="lg",
                                    on_click=lambda: self.count.set(self.count.value + 1)
                                )
                            ]
                        )
                    ]
                )
            ]
        )


if __name__ == "__main__":
    CounterApp().run(dev=True)
```

### Run the App

```bash
python main.py
```

Visit `http://localhost:8000` to see your app! 🎉

## 📚 Widget Library

### Layout Widgets

- **Container** - `Container(width, height, padding, margin, background, border, rounded, shadow)`
- **Row** - `Row(spacing, align, justify, wrap)`
- **Column** - `Column(spacing, align, justify)`
- **Stack** - `Stack(children)`
- **Center** - `Center(child)`
- **Spacer** - `Spacer(size)`

### Text Widgets

- **Text** - `Text(text, size, weight, color, align, italic, underline)`
- **Heading** - `Heading(text, level, color, weight)`

### Input Widgets

- **Button** - `Button(text, color, size, variant, rounded, icon, on_click)`
- **TextField** - `TextField(placeholder, value, type, on_change)`
- **Checkbox** - `Checkbox(checked, label, on_change)`
- **Radio** - `Radio(checked, label, name, value, on_change)`
- **Select** - `Select(options, value, placeholder, on_change)`
- **Slider** - `Slider(value, min, max, step, on_change)`

### Media Widgets

- **Image** - `Image(src, width, height, fit, rounded)`
- **Video** - `Video(src, controls, autoplay, loop)`
- **Icon** - `Icon(name, size, color)`

### Navigation

- **Link** - `Link(text, to, color, underline)`

### Advanced (Raw HTML/CSS)

- **Html** - `Html(html="<div>...</div>")`
- **Css** - `Css(css=".class { color: red; }")`

## 🎨 Styling

All styling is done through widget parameters:

### Colors

Use named colors or hex values:
- Named: `"primary"`, `"secondary"`, `"success"`, `"danger"`, `"warning"`, `"info"`
- Basic: `"red"`, `"blue"`, `"green"`, `"purple"`, `"pink"`, etc.
- Hex: `"#FF5733"`
- Gradients: `"gradient-purple-pink"`, `"gradient-blue-purple"`

### Sizes

- Text: `"xs"`, `"sm"`, `"md"`, `"lg"`, `"xl"`, `"2xl"`, `"3xl"`, `"4xl"`
- Button: `"sm"`, `"md"`, `"lg"`, `"xl"`
- Shadow: `"sm"`, `"md"`, `"lg"`, `"xl"`, `"2xl"`
- Custom: Use integers for pixels (e.g., `size=24`)

### Spacing

```python
# Single value (all sides)
padding=20

# Dictionary (specific sides)
padding={'top': 10, 'right': 20, 'bottom': 10, 'left': 20}
```

## 🔄 State Management

```python
from dreamweb import State

class MyApp(App):
    def __init__(self):
        super().__init__()
        self.counter = State(0)
        self.name = State("John")
    
    def increment(self):
        self.counter.set(self.counter.value + 1)
    
    def build(self):
        return Text(f"Count: {self.counter.value}")
```

## 🏗️ Build for Production

```python
# In your app file, change dev=True to dev=False
if __name__ == "__main__":
    MyApp().run(dev=False)
```

This will create a `build/` directory with:
- `index.html` - Your app's HTML
- `dreamweb.js` - Compiled and minified JavaScript

## 📖 Examples

Check the `examples/` directory for:
- `hello_world.py` - Simple hello world
- `counter_app.py` - Counter with state
- `todo_app.py` - Full todo application

## 🆚 Comparison

| Feature | DreamWeb | Flutter Web | Flet |
|---------|----------|-------------|------|
| Language | Python | Dart | Python |
| Learning Curve | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Hot Reload | ✅ | ✅ | ✅ |
| Output | HTML/JS | WASM | WebSocket |
| Styling | Parameters | Parameters | Parameters |
| Raw HTML/CSS | ✅ | ❌ | ❌ |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this in your projects!

## 🌟 Why DreamWeb?

- **Easy as Flet** - Simple, intuitive API
- **Powerful as Flutter** - Complete widget system
- **Pure Python** - No need to learn HTML/CSS/JS
- **Lightweight** - Small bundle size
- **Flexible** - Use raw HTML/CSS when needed

---

Made with ❤️ by the DreamWeb team
