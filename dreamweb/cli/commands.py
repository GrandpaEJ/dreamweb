"""
Command-line interface for DreamWeb
"""

import sys
import argparse
from pathlib import Path
from typing import Optional


def create_project(name: str):
    """Create a new DreamWeb project"""
    project_dir = Path(name)
    
    if project_dir.exists():
        print(f"❌ Directory '{name}' already exists!")
        return
    
    # Create project structure
    project_dir.mkdir()
    
    # Create main.py
    main_content = f'''"""
{name.capitalize()} - A DreamWeb Application
"""

from dreamweb import App
from dreamweb.common import *


class {name.capitalize()}App(App):
    def __init__(self):
        super().__init__(
            title="{name.capitalize()} App",
            description="A DreamWeb application",
            head_tags=[
                '<meta name="keywords" content="dreamweb, python, web framework">',
                '<link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🚀</text></svg>">'
            ]
        )
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
'''

    with open(project_dir / "main.py", 'w') as f:
        f.write(main_content)
    
    print(f"""
✅ Created project '{name}'!

To get started:
    cd {name}
    python main.py

This will start the dev server at http://localhost:8000
""")


import os
import subprocess

def run_dev(port: int, host: str):
    """Run dev server"""
    if not Path("main.py").exists():
        print("❌ main.py not found! Are you in a DreamWeb project directory?")
        return
    
    print(f"🚀 Starting dev server on {host}:{port}...")
    # Pass port/host via env vars or args if supported, but for now just run main.py
    # main.py usually calls run(dev=True)
    try:
        subprocess.run([sys.executable, "main.py"])
    except KeyboardInterrupt:
        pass

def run_build(output: str, app_file: Optional[str] = None):
    """Build for production"""
    if app_file:
        # Build specific file
        app_path = Path(app_file)
        if not app_path.exists():
            print(f"❌ File '{app_file}' not found!")
            return
    elif not Path("main.py").exists():
        print("❌ main.py not found! Are you in a DreamWeb project directory?")
        return
    else:
        app_path = Path("main.py")

    print(f"📦 Building {app_path} to {output}...")
    env = os.environ.copy()
    env['DREAMWEB_BUILD'] = '1'

    try:
        subprocess.run([sys.executable, str(app_path)], env=env)
    except Exception as e:
        print(f"❌ Build failed: {e}")

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
    build_parser.add_argument('app_file', nargs='?', help='App file to build (optional, defaults to main.py)')
    
    args = parser.parse_args()
    
    if args.command == 'create':
        create_project(args.name)
    elif args.command == 'dev':
        run_dev(args.port, args.host)
    elif args.command == 'build':
        run_build(args.output, getattr(args, 'app_file', None))
    else:
        parser.print_help()


if __name__ == '__main__':
    main()
