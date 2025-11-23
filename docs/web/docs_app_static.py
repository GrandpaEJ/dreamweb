"""
DreamWeb Documentation Website - Static Build Version
Built with DreamWeb itself, optimized for static hosting
"""

import sys
from pathlib import Path

# Add parent directory to path to import dreamweb
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from dreamweb import App
from dreamweb.common import *

# Import pages
from pages.home import create_home_page
from pages.getting_started import create_getting_started_page
from pages.widgets import create_widgets_page


class DocsApp(App):
    """DreamWeb Documentation Website Application - Static Version"""
    
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
    
    def build(self):
        """Build the documentation website UI - Static version with all pages"""
        
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
                    
                    /* Page sections - hide all by default */
                    .page-section {
                        display: none;
                    }
                    
                    .page-section.active {
                        display: block;
                    }
                    
                    /* Navigation active state */
                    .nav-link {
                        margin: 0 5px;
                        padding: 10px 15px;
                        border-bottom: 2px solid transparent;
                        border-radius: 0;
                        cursor: pointer;
                        background: transparent;
                        color: #cbd5e1;
                        border: none;
                        font-size: 1rem;
                        font-weight: normal;
                        transition: all 0.2s;
                    }
                    
                    .nav-link:hover {
                        color: white;
                    }
                    
                    .nav-link.active {
                        color: white;
                        font-weight: bold;
                        border-bottom-color: #3b82f6;
                    }
                '''),
                
                # JavaScript for client-side navigation
                Html(html='''
                    <script>
                        // Client-side navigation for static build
                        function navigateTo(pageId) {
                            // Hide all pages
                            document.querySelectorAll('.page-section').forEach(page => {
                                page.classList.remove('active');
                            });
                            
                            // Show selected page
                            const targetPage = document.getElementById('page-' + pageId);
                            if (targetPage) {
                                targetPage.classList.add('active');
                            }
                            
                            // Update nav links
                            document.querySelectorAll('.nav-link').forEach(link => {
                                link.classList.remove('active');
                            });
                            const activeLink = document.querySelector('[data-page="' + pageId + '"]');
                            if (activeLink) {
                                activeLink.classList.add('active');
                            }
                            
                            // Scroll to top
                            window.scrollTo(0, 0);
                        }
                        
                        // Initialize on page load
                        document.addEventListener('DOMContentLoaded', function() {
                            // Show home page by default
                            navigateTo('home');
                            
                            // Add click handlers to nav links
                            document.querySelectorAll('.nav-link').forEach(link => {
                                link.addEventListener('click', function() {
                                    const pageId = this.getAttribute('data-page');
                                    navigateTo(pageId);
                                });
                            });
                        });
                    </script>
                '''),
                
                # Navigation Bar
                Container(
                    width="100%",
                    background="linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    padding={'top': 0, 'right': 0, 'bottom': 0, 'left': 0},
                    shadow="md",
                    style="position: sticky; top: 0; z-index: 1000;",
                    children=[
                        Container(
                            width="100%",
                            padding=20,
                            children=[
                                Row(
                                    justify="between",
                                    align="center",
                                    children=[
                                        # Logo/Title
                                        Row(
                                            spacing=10,
                                            align="center",
                                            children=[
                                                Text("🚀", size="2xl"),
                                                Text("DreamWeb", size="2xl", weight="bold", color="white"),
                                                Text("v0.1.1", size="sm", color="#cbd5e1", style="opacity: 0.8;")
                                            ]
                                        ),
                                        
                                        # Navigation Links
                                        Html(html='''
                                            <div style="display: flex; gap: 5px; flex-wrap: wrap;">
                                                <button class="nav-link" data-page="home">Home</button>
                                                <button class="nav-link" data-page="getting_started">Getting Started</button>
                                                <button class="nav-link" data-page="widgets">Widgets</button>
                                            </div>
                                        ''')
                                    ]
                                )
                            ]
                        )
                    ]
                ),
                
                # Page: Home
                Html(html='<div id="page-home" class="page-section">'),
                create_home_page(),
                Html(html='</div>'),
                
                # Page: Getting Started
                Html(html='<div id="page-getting_started" class="page-section">'),
                create_getting_started_page(),
                Html(html='</div>'),
                
                # Page: Widgets
                Html(html='<div id="page-widgets" class="page-section">'),
                create_widgets_page(),
                Html(html='</div>'),
                
                # Footer
                Container(
                    width="100%",
                    background="#1e293b",
                    padding=40,
                    style="margin-top: 80px; border-top: 1px solid #334155;",
                    children=[
                        Container(
                            children=[
                                Column(
                                    spacing=20,
                                    align="center",
                                    children=[
                                        # Links
                                        Row(
                                            spacing=30,
                                            justify="center",
                                            children=[
                                                Link(
                                                    text="GitHub",
                                                    to="https://github.com/GrandpaEJ/dreamweb",
                                                    color="#3b82f6",
                                                    underline=False,
                                                    style="font-size: 1.1rem;"
                                                ),
                                                Link(
                                                    text="Documentation",
                                                    to="#",
                                                    color="#3b82f6",
                                                    underline=False,
                                                    style="font-size: 1.1rem;"
                                                ),
                                            ]
                                        ),
                                        
                                        # Divider
                                        Container(
                                            width="100%",
                                            height=1,
                                            background="#334155",
                                            style="max-width: 600px; margin: 10px auto;"
                                        ),
                                        
                                        # Copyright
                                        Column(
                                            spacing=5,
                                            align="center",
                                            children=[
                                                Text(
                                                    "Built with ❤️ using DreamWeb",
                                                    color="#94a3b8",
                                                    size="md"
                                                ),
                                                Text(
                                                    "© 2025 DreamWeb. MIT License.",
                                                    color="#64748b",
                                                    size="sm"
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


if __name__ == "__main__":
    DocsApp().run(dev=False)  # Build mode by default
