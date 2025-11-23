"""
Home page for DreamWeb documentation
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))

from dreamweb.common import *
from components.code_block import create_code_block


def create_home_page():
    """Create the home/landing page"""
    
    example_code = '''from dreamweb import App
from dreamweb.common import *

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
                Text(f"Count: {self.count.value}", size="2xl"),
                Button(
                    text="Increment",
                    on_click=lambda: self.count.set(self.count.value + 1)
                )
            ]
        )

if __name__ == "__main__":
    CounterApp().run(dev=True)'''
    
    return Container(
        width="100%",
        children=[
            # Hero Section
            Container(
                width="100%",
                background="linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                padding={'top': 80, 'right': 40, 'bottom': 80, 'left': 40},
                children=[
                    Column(
                        spacing=30,
                        align="center",
                        children=[
                            Text(
                                "🚀",
                                size="4xl"
                            ),
                            Heading(
                                "DreamWeb",
                                level=1,
                                color="white",
                                style="font-size: 4rem; margin: 0;"
                            ),
                            Text(
                                "A Flutter-like Python Web Framework",
                                size="2xl",
                                color="#e2e8f0",
                                align="center"
                            ),
                            Text(
                                "Build beautiful web UIs using pure Python. No HTML, CSS, or JavaScript required!",
                                size="lg",
                                color="#cbd5e1",
                                align="center",
                                style="max-width: 600px; margin: 0 auto;"
                            ),
                            
                            # CTA Buttons
                            Row(
                                spacing=15,
                                justify="center",
                                style="margin-top: 20px;",
                                children=[
                                    Button(
                                        text="Get Started →",
                                        color="white",
                                        size="xl",
                                        rounded=True,
                                        style="background: #3b82f6; color: white; padding: 15px 30px; font-size: 1.1rem;"
                                    ),
                                    Button(
                                        text="View on GitHub",
                                        variant="outline",
                                        color="white",
                                        size="xl",
                                        rounded=True,
                                        style="border: 2px solid white; color: white; padding: 15px 30px; font-size: 1.1rem;"
                                    )
                                ]
                            )
                        ]
                    )
                ]
            ),
            
            # Features Section
            Container(
                width="100%",
                padding=60,
                background="#0f172a",
                children=[
                    Container(
                        style="max-width: 1200px; margin: 0 auto;",
                        children=[
                            Heading(
                                "✨ Features",
                                level=2,
                                color="white",
                                style="text-align: center; margin-bottom: 40px;"
                            ),
                            
                            # Feature Grid
                            Container(
                                style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px;",
                                children=[
                                    # Feature 1
                                    Container(
                                        background="#1e293b",
                                        padding=30,
                                        rounded=12,
                                        children=[
                                            Column(
                                                spacing=10,
                                                children=[
                                                    Text("🎨", size="3xl"),
                                                    Heading("Flutter-Style Widgets", level=3, color="white"),
                                                    Text(
                                                        "Familiar API with Container, Row, Column, Text, Button, and more.",
                                                        color="#94a3b8"
                                                    )
                                                ]
                                            )
                                        ]
                                    ),
                                    
                                    # Feature 2
                                    Container(
                                        background="#1e293b",
                                        padding=30,
                                        rounded=12,
                                        children=[
                                            Column(
                                                spacing=10,
                                                children=[
                                                    Text("⚡", size="3xl"),
                                                    Heading("Hot Reload", level=3, color="white"),
                                                    Text(
                                                        "See changes instantly in development mode with automatic reloading.",
                                                        color="#94a3b8"
                                                    )
                                                ]
                                            )
                                        ]
                                    ),
                                    
                                    # Feature 3
                                    Container(
                                        background="#1e293b",
                                        padding=30,
                                        rounded=12,
                                        children=[
                                            Column(
                                                spacing=10,
                                                children=[
                                                    Text("🔄", size="3xl"),
                                                    Heading("Reactive State", level=3, color="white"),
                                                    Text(
                                                        "Built-in state management with automatic re-rendering on changes.",
                                                        color="#94a3b8"
                                                    )
                                                ]
                                            )
                                        ]
                                    ),
                                    
                                    # Feature 4
                                    Container(
                                        background="#1e293b",
                                        padding=30,
                                        rounded=12,
                                        children=[
                                            Column(
                                                spacing=10,
                                                children=[
                                                    Text("🌐", size="3xl"),
                                                    Heading("API Requests", level=3, color="white"),
                                                    Text(
                                                        "Built-in widgets for making HTTP requests to external APIs.",
                                                        color="#94a3b8"
                                                    )
                                                ]
                                            )
                                        ]
                                    ),
                                    
                                    # Feature 5
                                    Container(
                                        background="#1e293b",
                                        padding=30,
                                        rounded=12,
                                        children=[
                                            Column(
                                                spacing=10,
                                                children=[
                                                    Text("📦", size="3xl"),
                                                    Heading("Single Build Output", level=3, color="white"),
                                                    Text(
                                                        "Compiles to just index.html and dreamweb.js for easy deployment.",
                                                        color="#94a3b8"
                                                    )
                                                ]
                                            )
                                        ]
                                    ),
                                    
                                    # Feature 6
                                    Container(
                                        background="#1e293b",
                                        padding=30,
                                        rounded=12,
                                        children=[
                                            Column(
                                                spacing=10,
                                                children=[
                                                    Text("🎯", size="3xl"),
                                                    Heading("Pure Python", level=3, color="white"),
                                                    Text(
                                                        "No need to learn HTML, CSS, or JavaScript. Just write Python!",
                                                        color="#94a3b8"
                                                    )
                                                ]
                                            )
                                        ]
                                    ),
                                ]
                            )
                        ]
                    )
                ]
            ),
            
            # Quick Start Section
            Container(
                width="100%",
                padding=60,
                background="#1e293b",
                children=[
                    Container(
                        style="max-width: 900px; margin: 0 auto;",
                        children=[
                            Column(
                                spacing=30,
                                children=[
                                    Heading(
                                        "🚀 Quick Start",
                                        level=2,
                                        color="white",
                                        style="text-align: center;"
                                    ),
                                    
                                    Text(
                                        "Get started with DreamWeb in just a few lines of code:",
                                        color="#cbd5e1",
                                        size="lg",
                                        align="center"
                                    ),
                                    
                                    create_code_block(example_code, "python"),
                                    
                                    Text(
                                        "Run your app with:",
                                        color="#cbd5e1",
                                        size="lg",
                                        align="center"
                                    ),
                                    
                                    create_code_block("python app.py", "bash"),
                                    
                                    Text(
                                        "Visit http://localhost:8000 to see your app! 🎉",
                                        color="#3b82f6",
                                        size="xl",
                                        align="center",
                                        weight="bold"
                                    )
                                ]
                            )
                        ]
                    )
                ]
            )
        ]
    )
