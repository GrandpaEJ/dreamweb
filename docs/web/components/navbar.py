"""
Navigation bar component for DreamWeb docs
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))

from dreamweb.common import *


def create_navbar(current_page, on_navigate):
    """
    Create navigation bar component
    
    Args:
        current_page: Currently active page name
        on_navigate: Callback function for navigation (receives page name)
    """
    
    pages = [
        ("home", "Home"),
        ("getting_started", "Getting Started"),
        ("core_concepts", "Core Concepts"),
        ("widgets", "Widgets"),
        ("api_reference", "API Reference"),
        ("examples", "Examples"),
    ]
    
    nav_links = []
    for page_id, page_name in pages:
        is_active = page_id == current_page
        
        nav_links.append(
            Button(
                text=page_name,
                variant="ghost",
                color="white" if is_active else "#cbd5e1",
                size="md",
                on_click=lambda p=page_id: on_navigate(p),
                style=f"""
                    margin: 0 5px;
                    font-weight: {'bold' if is_active else 'normal'};
                    border-bottom: {'2px solid #3b82f6' if is_active else '2px solid transparent'};
                    border-radius: 0;
                    padding: 10px 15px;
                """
            )
        )
    
    return Container(
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
                                    Text(
                                        "🚀",
                                        size="2xl"
                                    ),
                                    Text(
                                        "DreamWeb",
                                        size="2xl",
                                        weight="bold",
                                        color="white"
                                    ),
                                    Text(
                                        "v0.1.1",
                                        size="sm",
                                        color="#cbd5e1",
                                        style="opacity: 0.8;"
                                    )
                                ]
                            ),
                            
                            # Navigation Links
                            Row(
                                spacing=5,
                                align="center",
                                children=nav_links,
                                style="display: flex; flex-wrap: wrap;"
                            )
                        ]
                    )
                ]
            )
        ]
    )
