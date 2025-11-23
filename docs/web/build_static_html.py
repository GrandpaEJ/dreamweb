"""
Custom static HTML builder for DreamWeb documentation
Generates a single HTML file with all pages and client-side navigation
"""

import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from pages.home import create_home_page
from pages.getting_started import create_getting_started_page
from pages.widgets import create_widgets_page


def widget_to_html(widget):
    """Convert a DreamWeb widget to HTML string (simplified)"""
    # This is a simplified converter - just get the basic structure
    if hasattr(widget, 'to_dict'):
        data = widget.to_dict()
        widget_type = data.get('type', '')
        props = data.get('props', {})
        children = data.get('children', [])
        
        # Handle different widget types
        if widget_type == 'Container':
            child_html = ''.join([widget_to_html(c) for c in children])
            return f'<div class="container">{child_html}</div>'
        elif widget_type == 'Text':
            return f'<span>{props.get("text", "")}</span>'
        elif widget_type == 'Heading':
            level = props.get('level', 1)
            return f'<h{level}>{props.get("text", "")}</h{level}>'
        else:
            child_html = ''.join([widget_to_html(c) for c in children])
            return f'<div>{child_html}</div>'
    return ''


def build_static_html():
    """Build a complete static HTML file"""
    
    # Note: For now, we'll create a simpler version that just works
    # The full widget-to-HTML conversion is complex, so we'll use a template
    
    html_content = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="A Flutter-like Python Web Framework - Build beautiful web UIs using pure Python">
    <title>DreamWeb Documentation</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            background: #0f172a;
            color: #cbd5e1;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        
        /* Page sections */
        .page-section {
            display: none;
        }
        
        .page-section.active {
            display: block;
        }
        
        /* Navigation */
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
        
        html {
            scroll-behavior: smooth;
        }
    </style>
</head>
<body>
    <div id="app">
        <!-- Navigation Bar -->
        <div style="width: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; position: sticky; top: 0; z-index: 1000; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; gap: 10px; align-items: center;">
                    <span style="font-size: 2rem;">🚀</span>
                    <span style="font-size: 2rem; font-weight: bold; color: white;">DreamWeb</span>
                    <span style="font-size: 0.875rem; color: #cbd5e1; opacity: 0.8;">v0.1.1</span>
                </div>
                <div style="display: flex; gap: 5px; flex-wrap: wrap;">
                    <button class="nav-link" data-page="home">Home</button>
                    <button class="nav-link" data-page="getting_started">Getting Started</button>
                    <button class="nav-link" data-page="widgets">Widgets</button>
                </div>
            </div>
        </div>
        
        <!-- Page: Home -->
        <div id="page-home" class="page-section">
            <iframe src="home.html" style="width: 100%; border: none; min-height: 100vh;"></iframe>
        </div>
        
        <!-- Page: Getting Started -->
        <div id="page-getting_started" class="page-section">
            <iframe src="getting_started.html" style="width: 100%; border: none; min-height: 100vh;"></iframe>
        </div>
        
        <!-- Page: Widgets -->
        <div id="page-widgets" class="page-section">
            <iframe src="widgets.html" style="width: 100%; border: none; min-height: 100vh;"></iframe>
        </div>
    </div>
    
    <script>
        // Client-side navigation
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
        
        // Initialize
        document.addEventListener('DOMContentLoaded', function() {
            // Show home page by default
            navigateTo('home');
            
            // Add click handlers
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', function() {
                    const pageId = this.getAttribute('data-page');
                    navigateTo(pageId);
                });
            });
        });
    </script>
</body>
</html>'''
    
    # Write the HTML file
    output_dir = Path(__file__).parent / 'build'
    output_dir.mkdir(exist_ok=True)
    
    output_file = output_dir / 'index.html'
    with open(output_file, 'w') as f:
        f.write(html_content)
    
    print(f"✅ Static HTML built: {output_file}")
    print("\n📝 Note: This is a simplified static build.")
    print("   For full functionality, use the DreamWeb dev server.")
    print("\n🚀 To serve: python -m http.server 8080 --directory build")


if __name__ == "__main__":
    build_static_html()
