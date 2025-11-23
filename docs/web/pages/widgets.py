"""
Widgets page for DreamWeb documentation
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))

from dreamweb.common import *
from components.code_block import create_code_block


def create_widgets_page():
    """Create the Widgets Library page"""
    
    return Container(
        width="100%",
        padding=40,
        background="#0f172a",
        children=[
            Container(
                style="max-width: 1000px; margin: 0 auto;",
                children=[
                    Column(
                        spacing=40,
                        children=[
                            # Header
                            Column(
                                spacing=15,
                                children=[
                                    Heading(
                                        "🎨 Widget Library",
                                        level=1,
                                        color="white"
                                    ),
                                    Text(
                                        "Complete reference of all available widgets",
                                        size="xl",
                                        color="#94a3b8"
                                    )
                                ]
                            ),
                            
                            # Layout Widgets
                            _create_widget_section(
                                "Layout Widgets",
                                [
                                    ("Container", "A flexible box container", "Container(width='100%', padding=20, background='white')"),
                                    ("Row", "Arranges children horizontally", "Row(spacing=10, children=[...])"),
                                    ("Column", "Arranges children vertically", "Column(spacing=10, children=[...])"),
                                    ("Stack", "Overlaps children", "Stack(children=[...])"),
                                    ("Center", "Centers its child", "Center(child=Text('Centered'))"),
                                    ("Spacer", "Takes up available space", "Spacer()"),
                                ]
                            ),
                            
                            # Text Widgets
                            _create_widget_section(
                                "Text Widgets",
                                [
                                    ("Text", "Display text", "Text('Hello', size='xl', color='primary')"),
                                    ("Heading", "Semantic heading (h1-h6)", "Heading('Title', level=1)"),
                                ]
                            ),
                            
                            # Input Widgets
                            _create_widget_section(
                                "Input Widgets",
                                [
                                    ("Button", "Clickable button", "Button(text='Click', on_click=handler)"),
                                    ("TextField", "Text input", "TextField(placeholder='Name', on_change=handler)"),
                                    ("Checkbox", "Boolean toggle", "Checkbox(checked=True, label='Accept')"),
                                    ("Radio", "Radio button", "Radio(checked=True, name='group')"),
                                    ("Select", "Dropdown select", "Select(options=['A', 'B'], on_change=handler)"),
                                    ("Slider", "Range slider", "Slider(value=50, min=0, max=100)"),
                                ]
                            ),
                            
                            # API Widgets
                            _create_widget_section(
                                "API Widgets",
                                [
                                    ("ApiRequest", "Make HTTP requests", "ApiRequest(url='...', method='GET', on_success=handler)"),
                                    ("FetchData", "Simplified GET requests", "FetchData(url='...', on_success=handler)"),
                                ]
                            ),
                            
                            # Media Widgets
                            _create_widget_section(
                                "Media Widgets",
                                [
                                    ("Image", "Display image", "Image(src='/path.jpg', width=200)"),
                                    ("Video", "Video player", "Video(src='/video.mp4', controls=True)"),
                                    ("Icon", "Icon display", "Icon(name='heart', size=24)"),
                                ]
                            ),
                            
                            # Navigation
                            _create_widget_section(
                                "Navigation Widgets",
                                [
                                    ("Link", "Clickable link", "Link(text='GitHub', to='https://...')"),
                                ]
                            ),
                            
                            # Advanced
                            _create_widget_section(
                                "Advanced Widgets",
                                [
                                    ("Html", "Raw HTML", "Html(html='<div>Custom</div>')"),
                                    ("Css", "Inject CSS", "Css(css='.class { color: red; }')"),
                                ]
                            ),
                        ]
                    )
                ]
            )
        ]
    )


def _create_widget_section(title, widgets):
    """Helper to create a widget category section"""
    
    widget_items = []
    for name, description, example in widgets:
        widget_items.append(
            Container(
                background="#1e293b",
                padding=20,
                rounded=8,
                children=[
                    Column(
                        spacing=10,
                        children=[
                            Heading(name, level=3, color="#3b82f6"),
                            Text(description, color="#cbd5e1"),
                            create_code_block(example, "python")
                        ]
                    )
                ]
            )
        )
    
    return Column(
        spacing=20,
        children=[
            Heading(title, level=2, color="white"),
            Column(spacing=15, children=widget_items)
        ]
    )
