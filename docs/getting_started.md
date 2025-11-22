# Getting Started

## Installation

Install DreamWeb using pip:

```bash
pip install dreamweb
```

## Create Your First App

You can create a new project using the CLI:

```bash
dreamweb create my_app
cd my_app
```

Or create a file named `main.py` manually:

```python
from dreamweb import App, Container, Text, Button, Row, State

class CounterApp(App):
    def __init__(self):
        super().__init__(
            title="Counter App",
            description="My first DreamWeb app"
        )
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

## Run the App

Start the development server:

```bash
dreamweb dev
# OR
python main.py
```

Visit `http://localhost:8000` to see your app! 🎉
