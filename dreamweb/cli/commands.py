"""
Command-line interface for DreamWeb
"""

import sys
import argparse
from pathlib import Path


def create_project(name: str):
    """Create a new DreamWeb project"""
    project_dir = Path(name)
    
    if project_dir.exists():
        print(f"❌ Directory '{name}' already exists!")
        return
    
    # Create project structure
    project_dir.mkdir()
    
    # Create main.py
    main_py = f"""from dreamweb import App, Container, Text, Button, Row, State


class {name.capitalize()}App(App):
    def __init__(self):
        super().__init__()
        self.count = State(0)
    
    def build(self):
        return Container(
            width="100%",
            height="100vh",
            background="gradient-blue-purple",
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
                            "Welcome to DreamWeb! 🚀",
                            size="2xl",
                            weight="bold",
                            color="gray-900"
                        ),
                        Text(
                            f"Count: {{self.count.value}}",
                            size="xl",
                            color="gray-700"
                        ),
                        Row(
                            spacing=10,
                            children=[
                                Button(
                                    text="Increment",
                                    color="primary",
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
    {name.capitalize()}App().run(dev=True)
"""
    
    with open(project_dir / "main.py", 'w') as f:
        f.write(main_py)
    
    print(f"""
✅ Created project '{name}'!

To get started:
    cd {name}
    python main.py

This will start the dev server at http://localhost:8000
""")


def main():
    """Main CLI entry point"""
    parser = argparse.ArgumentParser(description="DreamWeb - Python Web Framework")
    subparsers = parser.add_subparsers(dest='command', help='Commands')
    
    # Create command
    create_parser = subparsers.add_parser('create', help='Create a new project')
    create_parser.add_argument('name', help='Project name')
    
    # Dev command
    dev_parser = subparsers.add_parser('dev', help='Start dev server')
    dev_parser.add_argument('--port', type=int, default=8000, help='Port number')
    dev_parser.add_argument('--host', default='localhost', help='Host address')
    
    # Build command
    build_parser = subparsers.add_parser('build', help='Build for production')
    build_parser.add_argument('--output', default='build', help='Output directory')
    
    args = parser.parse_args()
    
    if args.command == 'create':
        create_project(args.name)
    elif args.command == 'dev':
        print("Dev server command - run your app with: python main.py")
    elif args.command == 'build':
        print("Build command - run your app with: python main.py (without dev=True)")
    else:
        parser.print_help()


if __name__ == '__main__':
    main()
