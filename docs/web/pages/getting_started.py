"""
Getting Started page for DreamWeb documentation
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))

from dreamweb.common import *
from components.code_block import create_code_block


def create_getting_started_page():
    """Create the Getting Started page"""
    
    install_code = "pip install dreamweb"
    
    first_app_code = '''from dreamweb import App
from dreamweb.common import *

class HelloApp(App):
    def __init__(self):
        super().__init__(title="Hello DreamWeb")
    
    def build(self):
        return Container(
            width="100%",
            height="100vh",
            background="gradient-purple-pink",
            align="center",
            justify="center",
            children=[
                Text(
                    "Hello, DreamWeb! 👋",
                    size="4xl",
                    weight="bold",
                    color="white"
                )
            ]
        )

if __name__ == "__main__":
    HelloApp().run(dev=True)'''
    
    run_code = "python app.py"
    
    build_code = '''# Build for production
if __name__ == "__main__":
    HelloApp().run(dev=False)'''
    
    return Container(
        width="100%",
        padding=40,
        background="#0f172a",
        children=[
            Container(
                style="max-width: 900px; margin: 0 auto;",
                children=[
                    Column(
                        spacing=40,
                        children=[
                            # Header
                            Column(
                                spacing=15,
                                children=[
                                    Heading(
                                        "🚀 Getting Started",
                                        level=1,
                                        color="white"
                                    ),
                                    Text(
                                        "Get up and running with DreamWeb in minutes",
                                        size="xl",
                                        color="#94a3b8"
                                    )
                                ]
                            ),
                            
                            # Installation
                            Column(
                                spacing=20,
                                children=[
                                    Heading(
                                        "Installation",
                                        level=2,
                                        color="white"
                                    ),
                                    Text(
                                        "Install DreamWeb using pip:",
                                        color="#cbd5e1",
                                        size="lg"
                                    ),
                                    create_code_block(install_code, "bash")
                                ]
                            ),
                            
                            # Create First App
                            Column(
                                spacing=20,
                                children=[
                                    Heading(
                                        "Create Your First App",
                                        level=2,
                                        color="white"
                                    ),
                                    Text(
                                        "Create a new file called app.py:",
                                        color="#cbd5e1",
                                        size="lg"
                                    ),
                                    create_code_block(first_app_code, "python"),
                                    Text(
                                        "This creates a simple app with a centered greeting message on a gradient background.",
                                        color="#94a3b8"
                                    )
                                ]
                            ),
                            
                            # Run the App
                            Column(
                                spacing=20,
                                children=[
                                    Heading(
                                        "Run the Development Server",
                                        level=2,
                                        color="white"
                                    ),
                                    Text(
                                        "Start the development server with hot reload:",
                                        color="#cbd5e1",
                                        size="lg"
                                    ),
                                    create_code_block(run_code, "bash"),
                                    Text(
                                        "Visit http://localhost:8000 in your browser to see your app! 🎉",
                                        color="#3b82f6",
                                        size="lg",
                                        weight="bold"
                                    ),
                                    Container(
                                        background="#1e293b",
                                        padding=20,
                                        rounded=8,
                                        children=[
                                            Column(
                                                spacing=10,
                                                children=[
                                                    Text(
                                                        "💡 Hot Reload",
                                                        size="lg",
                                                        weight="bold",
                                                        color="#3b82f6"
                                                    ),
                                                    Text(
                                                        "The dev server watches for file changes and automatically reloads your app. Try editing the text and save the file to see it update instantly!",
                                                        color="#cbd5e1"
                                                    )
                                                ]
                                            )
                                        ]
                                    )
                                ]
                            ),
                            
                            # Build for Production
                            Column(
                                spacing=20,
                                children=[
                                    Heading(
                                        "Build for Production",
                                        level=2,
                                        color="white"
                                    ),
                                    Text(
                                        "When you're ready to deploy, change dev=True to dev=False:",
                                        color="#cbd5e1",
                                        size="lg"
                                    ),
                                    create_code_block(build_code, "python"),
                                    Text(
                                        "This creates a build/ directory with optimized index.html and dreamweb.js files ready for deployment.",
                                        color="#94a3b8"
                                    )
                                ]
                            ),
                            
                            # Next Steps
                            Container(
                                background="#1e293b",
                                padding=30,
                                rounded=12,
                                children=[
                                    Column(
                                        spacing=20,
                                        children=[
                                            Heading(
                                                "🎯 Next Steps",
                                                level=2,
                                                color="white"
                                            ),
                                            Column(
                                                spacing=10,
                                                children=[
                                                    Text(
                                                        "→ Learn about Core Concepts",
                                                        color="#3b82f6",
                                                        size="lg"
                                                    ),
                                                    Text(
                                                        "→ Explore the Widget Library",
                                                        color="#3b82f6",
                                                        size="lg"
                                                    ),
                                                    Text(
                                                        "→ Check out Examples",
                                                        color="#3b82f6",
                                                        size="lg"
                                                    ),
                                                    Text(
                                                        "→ Read the API Reference",
                                                        color="#3b82f6",
                                                        size="lg"
                                                    )
                                                ]
                                            )
                                        ]
                                    )
                                ]
                            )
                        ]
                    )
                ]
            )
        ]
    )
