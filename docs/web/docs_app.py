"""
DreamWeb Documentation Website
Built with DreamWeb itself!
"""

import sys
from pathlib import Path

# Add parent directory to path to import dreamweb
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from dreamweb import App
from dreamweb.common import *

# Import components
from components.navbar import create_navbar
from components.footer import create_footer

# Import pages
from pages.home import create_home_page
from pages.getting_started import create_getting_started_page
from pages.widgets import create_widgets_page


class DocsApp(App):
    """DreamWeb Documentation Website Application"""
    
    def __init__(self):
        super().__init__(
            title="DreamWeb Documentation",
            description="A Flutter-like Python Web Framework - Build beautiful web UIs using pure Python",
            head_tags=[
                '<link rel="preconnect" href="https://fonts.googleapis.com">',
                '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
                '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">',
            ]
        )
        
        # State for current page
        self.current_page = State("home")
    
    def navigate_to(self, page):
        """Navigate to a different page"""
        self.current_page.set(page)
    
    def get_page_content(self):
        """Get content for current page"""
        page = self.current_page.value
        
        if page == "home":
            return create_home_page()
        elif page == "getting_started":
            return create_getting_started_page()
        elif page == "widgets":
            return create_widgets_page()
        elif page == "core_concepts":
            return self._create_placeholder_page("Core Concepts", "Learn about DreamWeb's core concepts")
        elif page == "api_reference":
            return self._create_placeholder_page("API Reference", "Complete API documentation")
        elif page == "examples":
            return self._create_placeholder_page("Examples", "Example applications and code samples")
        else:
            return create_home_page()
    
    def _create_placeholder_page(self, title, description):
        """Create a placeholder page for pages not yet implemented"""
        return Container(
            width="100%",
            padding=60,
            background="#0f172a",
            children=[
                Container(
                    style="max-width: 900px; margin: 0 auto;",
                    children=[
                        Column(
                            spacing=30,
                            align="center",
                            children=[
                                Heading(title, level=1, color="white"),
                                Text(description, size="xl", color="#94a3b8"),
                                Text(
                                    "🚧 This page is under construction 🚧",
                                    size="2xl",
                                    color="#3b82f6",
                                    weight="bold"
                                ),
                                Text(
                                    "Check back soon for more content!",
                                    color="#cbd5e1",
                                    size="lg"
                                )
                            ]
                        )
                    ]
                )
            ]
        )
    
    def build(self):
        """Build the documentation website UI"""
        
        return Container(
            width="100%",
            style="min-height: 100vh; font-family: 'Inter', sans-serif;",
            children=[
                # Global CSS
                Css(css='''
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body {
                        background: #0f172a;
                        color: #cbd5e1;
                        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    }
                    
                    a {
                        color: #3b82f6;
                        text-decoration: none;
                    }
                    
                    a:hover {
                        text-decoration: underline;
                    }
                    
                    code {
                        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                    }
                    
                    /* Smooth scrolling */
                    html {
                        scroll-behavior: smooth;
                    }
                '''),
                
                # Navigation Bar
                create_navbar(self.current_page.value, self.navigate_to),
                
                # Page Content
                self.get_page_content(),
                
                # Footer
                create_footer()
            ]
        )


if __name__ == "__main__":
    DocsApp().run(dev=True)
