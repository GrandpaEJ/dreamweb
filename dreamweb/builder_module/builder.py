"""
Production builder for DreamWeb
Compiles Python app to optimized HTML/JS
"""

import os
import json
import shutil
from pathlib import Path
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from dreamweb.core import App


class Builder:
    """Build production-ready output"""
    
    def __init__(self, app: 'App', output_dir: str = "build"):
        self.app = app
        self.output_dir = Path(output_dir)
    
    def build(self):
        """Build the application for production"""
        print("🔨 Building DreamWeb app...")
        
        # Create output directory
        if self.output_dir.exists():
            shutil.rmtree(self.output_dir)
        self.output_dir.mkdir(parents=True)
        
        # Generate component tree
        tree = self.app._widget_to_dict(self.app.build())
        
        # Create index.html
        self.create_html(tree)
        
        # Create dreamweb.js (minified runtime)
        self.create_js(tree)
        
        print(f"✅ Build complete!")
        print(f"📦 Output: {self.output_dir.absolute()}")
        print(f"   - index.html")
        print(f"   - dreamweb.js")
    
    def create_html(self, tree):
        """Create production HTML file"""
        html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="{self.app.description}">
    <title>{self.app.title}</title>
    {chr(10).join(self.app.head_tags)}
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }}
        #app {{
            width: 100%;
            min-height: 100vh;
        }}
    </style>
</head>
<body>
    <div id="app"></div>
    <script src="dreamweb.js"></script>
</body>
</html>"""
        
        output_file = self.output_dir / "index.html"
        with open(output_file, 'w') as f:
            f.write(html)
    
    def create_js(self, tree):
        """Create production JavaScript file"""
        # Read runtime.js from new location
        runtime_path = Path(__file__).parent.parent / 'runtime' / 'runtime.js'
        with open(runtime_path, 'r') as f:
            runtime_code = f.read()
        
        # Remove hot reload code for production
        runtime_code = runtime_code.replace('this.setupHotReload();', '// Hot reload disabled in production')
        
        # Embed component tree
        tree_json = json.dumps(tree)
        
        js_code = f"""{runtime_code}

// Initialize app
(function() {{
    const componentTree = {tree_json};
    const runtime = new DreamWebRuntime(document.getElementById('app'));
    runtime.init(componentTree);
}})();
"""
        
        # TODO: Minify JS in production
        # For now, just write the code
        output_file = self.output_dir / "dreamweb.js"
        with open(output_file, 'w') as f:
            f.write(js_code)
