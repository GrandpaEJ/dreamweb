"""
DreamWeb Documentation Site
Built with DreamWeb itself!
"""

from dreamweb import App
from dreamweb.common import *


class DocsApp(App):
    def __init__(self):
        super().__init__(
            title="DreamWeb Documentation",
            description="A Flutter-like Python web framework - build beautiful UIs without HTML/CSS/JS",
            head_tags=[
                '<meta name="keywords" content="dreamweb, python, web framework, flutter, ui">',
                '<link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🚀</text></svg>">',
                # Syntax highlighting
                '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css">',
                '<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>',
                '<script>hljs.highlightAll();</script>',
            ]
        )
        self.current_section = State("intro")
    
    def set_section(self, section):
        self.current_section.set(section)
    
    def build(self):
        return Container(
            width="100%",
            height="100vh",
            background="#0f172a",
            children=[
                Row(
                    children=[
                        # Sidebar
                        self.build_sidebar(),
                        # Main content
                        self.build_content(),
                    ]
                )
            ]
        )
    
    def build_sidebar(self):
        sections = [
            ("intro", "🚀 Introduction"),
            ("getting_started", "📦 Getting Started"),
            ("core_concepts", "💡 Core Concepts"),
            ("widgets", "🎨 Widget Library"),
            ("cli", "⌨️ CLI Reference"),
            ("seo", "🔍 SEO & Metadata"),
            ("deployment", "🌐 Deployment"),
        ]
        
        return Container(
            width=280,
            height="100vh",
            background="#1e293b",
            padding=20,
            children=[
                # Logo
                Container(
                    padding={'bottom': 30},
                    children=[
                        Text(
                            "🚀 DreamWeb",
                            size="2xl",
                            weight="bold",
                            color="white"
                        ),
                        Text(
                            "v0.1.0",
                            size="sm",
                            color="#94a3b8"
                        ),
                    ]
                ),
                # Navigation
                Column(
                    spacing=5,
                    children=[
                        self.build_nav_item(section_id, label)
                        for section_id, label in sections
                    ]
                )
            ]
        )
    
    def build_nav_item(self, section_id, label):
        is_active = self.current_section.value == section_id
        
        return Button(
            text=label,
            color="#3b82f6" if is_active else "#475569",
            size="md",
            variant="solid" if is_active else "ghost",
            on_click=lambda: self.set_section(section_id)
        )
    
    def build_content(self):
        section = self.current_section.value
        
        content_map = {
            "intro": self.build_intro(),
            "getting_started": self.build_getting_started(),
            "core_concepts": self.build_core_concepts(),
            "widgets": self.build_widgets(),
            "cli": self.build_cli(),
            "seo": self.build_seo(),
            "deployment": self.build_deployment(),
        }
        
        return Container(
            width="100%",
            height="100vh",
            padding=60,
            background="#0f172a",
            children=[
                Container(
                    width="100%",
                    children=[content_map.get(section, self.build_intro())]
                )
            ]
        )
    
    def build_intro(self):
        return Column(
            spacing=30,
            children=[
                Text(
                    "🚀 DreamWeb",
                    size="4xl",
                    weight="bold",
                    color="white"
                ),
                Text(
                    "A Flutter-like Python Web Framework",
                    size="2xl",
                    color="#94a3b8"
                ),
                Container(
                    padding={'top': 20},
                    children=[
                        Text(
                            "Build beautiful web UIs using pure Python with a Flutter-style API. No HTML, CSS, or JavaScript knowledge required!",
                            size="lg",
                            color="#cbd5e1"
                        )
                    ]
                ),
                # Features
                Container(
                    padding={'top': 30},
                    children=[
                        Text("✨ Features", size="2xl", weight="bold", color="white"),
                        Column(
                            spacing=15,
                            children=[
                                self.build_feature("🎨 Flutter-Style Widgets", "Familiar API with Container, Row, Column, Text, Button, etc."),
                                self.build_feature("🎯 Parameter-Based Styling", "Style everything with simple parameters, no CSS needed"),
                                self.build_feature("⚡ Hot Reload", "See changes instantly in dev mode"),
                                self.build_feature("🔄 Reactive State", "Built-in state management with automatic re-rendering"),
                                self.build_feature("🔍 SEO Friendly", "Built-in support for metadata and head tags"),
                                self.build_feature("📦 Single Build Output", "Compiles to index.html + dreamweb.js"),
                            ]
                        )
                    ]
                ),
            ]
        )
    
    def build_feature(self, title, description):
        return Container(
            padding=20,
            background="#1e293b",
            rounded=12,
            children=[
                Text(title, size="lg", weight="bold", color="white"),
                Text(description, size="md", color="#94a3b8"),
            ]
        )
    
    def build_getting_started(self):
        return Column(
            spacing=30,
            children=[
                Text("📦 Getting Started", size="3xl", weight="bold", color="white"),
                
                self.build_section("Installation", """
Install DreamWeb using pip:
                """),
                self.build_code_block("bash", "pip install dreamweb"),
                
                self.build_section("Create Your First App", """
You can create a new project using the CLI:
                """),
                self.build_code_block("bash", """dreamweb create my_app
cd my_app"""),
                
                self.build_section("Or create manually", "Create a file named main.py:"),
                self.build_code_block("python", """from dreamweb import App
from dreamweb.common import *

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
                Text(f"Count: {self.count.value}", size="2xl"),
                Button(
                    text="Increment",
                    on_click=lambda: self.count.set(self.count.value + 1)
                )
            ]
        )

if __name__ == "__main__":
    CounterApp().run(dev=True)"""),
                
                self.build_section("Run the App", "Start the development server:"),
                self.build_code_block("bash", "dreamweb dev"),
                Text("Visit http://localhost:8000 to see your app! 🎉", size="lg", color="#3b82f6"),
            ]
        )
    
    def build_core_concepts(self):
        return Column(
            spacing=30,
            children=[
                Text("💡 Core Concepts", size="3xl", weight="bold", color="white"),
                
                self.build_section("Widgets", """
Everything in DreamWeb is a Widget. Widgets are Python classes that describe the configuration of a UI element.
                """),
                self.build_code_block("python", """from dreamweb import App
from dreamweb.common import *

# A simple text widget
Text("Hello")

# A container with styling
Container(
    padding=20,
    background="blue",
    children=[Text("Inside Container")]
)"""),
                
                self.build_section("State Management", """
DreamWeb has a built-in reactive state management system. Use the State class to create reactive variables.
                """),
                self.build_code_block("python", """from dreamweb import App
from dreamweb.common import *

class MyApp(App):
    def __init__(self):
        super().__init__()
        self.count = State(0)
    
    def build(self):
        return Column(
            children=[
                Text(f"Count: {self.count.value}"),
                Button(
                    text="Increment",
                    on_click=lambda: self.count.set(self.count.value + 1)
                )
            ]
        )"""),
            ]
        )
    
    def build_widgets(self):
        return Column(
            spacing=30,
            children=[
                Text("🎨 Widget Library", size="3xl", weight="bold", color="white"),
                
                self.build_section("Layout Widgets", ""),
                self.build_widget_item("Container", "A box that can contain other widgets and apply styling"),
                self.build_widget_item("Row", "Arranges children horizontally"),
                self.build_widget_item("Column", "Arranges children vertically"),
                self.build_widget_item("Stack", "Overlaps children on top of each other"),
                
                self.build_section("Text Widgets", ""),
                self.build_widget_item("Text", "Basic text widget with styling options"),
                self.build_widget_item("Heading", "Semantic heading (h1-h6)"),
                
                self.build_section("Input Widgets", ""),
                self.build_widget_item("Button", "Clickable button with event handlers"),
                self.build_widget_item("TextField", "Text input field"),
                self.build_widget_item("Checkbox", "Boolean toggle"),
            ]
        )
    
    def build_widget_item(self, name, description):
        return Container(
            padding=15,
            background="#1e293b",
            rounded=8,
            margin={'bottom': 10},
            children=[
                Text(name, size="lg", weight="bold", color="#3b82f6"),
                Text(description, size="md", color="#94a3b8"),
            ]
        )
    
    def build_cli(self):
        return Column(
            spacing=30,
            children=[
                Text("⌨️ CLI Reference", size="3xl", weight="bold", color="white"),
                
                self.build_section("dreamweb create", "Create a new DreamWeb project"),
                self.build_code_block("bash", "dreamweb create <project_name>"),
                
                self.build_section("dreamweb dev", "Start the development server with hot reload"),
                self.build_code_block("bash", "dreamweb dev"),
                
                self.build_section("dreamweb build", "Build the application for production"),
                self.build_code_block("bash", "dreamweb build"),
            ]
        )
    
    def build_seo(self):
        return Column(
            spacing=30,
            children=[
                Text("🔍 SEO & Metadata", size="3xl", weight="bold", color="white"),
                
                self.build_section("Basic Metadata", """
Set title and description in your App class:
                """),
                self.build_code_block("python", """from dreamweb import App
from dreamweb.common import *

class MyApp(App):
    def __init__(self):
        super().__init__(
            title="My Awesome App",
            description="The best app ever built with DreamWeb"
        )"""),
                
                self.build_section("Advanced Head Tags", """
Add custom meta tags, favicons, and external resources:
                """),
                self.build_code_block("python", """head_tags=[
    '<meta name="keywords" content="dreamweb, python, app">',
    '<meta property="og:title" content="My Awesome App">',
    '<link rel="icon" href="/favicon.ico">',
]"""),
            ]
        )
    
    def build_deployment(self):
        return Column(
            spacing=30,
            children=[
                Text("🌐 Deployment", size="3xl", weight="bold", color="white"),
                
                self.build_section("Build Your App", "First, run the build command:"),
                self.build_code_block("bash", "dreamweb build"),
                
                Text("This creates a build/ directory with index.html and dreamweb.js", size="md", color="#94a3b8"),
                
                self.build_section("Hosting Options", ""),
                self.build_feature("GitHub Pages", "Configure to serve from the build directory"),
                self.build_feature("Netlify / Vercel", "Set build command to 'dreamweb build' and output to 'build'"),
                self.build_feature("Static Web Server", "Serve the build directory with any static file server"),
            ]
        )
    
    def build_section(self, title, description):
        return Container(
            padding={'top': 20, 'bottom': 10},
            children=[
                Text(title, size="2xl", weight="bold", color="white"),
                Text(description, size="md", color="#cbd5e1"),
            ]
        )
    
    def build_code_block(self, language, code):
        return Html(html=f'''
<pre style="background: #1e293b; padding: 20px; border-radius: 8px; overflow-x: auto; margin: 10px 0;">
<code class="language-{language}">{code}</code>
</pre>
        ''')


if __name__ == "__main__":
    DocsApp().run(dev=True)
