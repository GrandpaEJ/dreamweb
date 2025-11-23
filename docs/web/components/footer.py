"""
Footer component for DreamWeb docs
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))

from dreamweb.common import *


def create_footer():
    """Create footer component"""
    
    return Container(
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
                                    Link(
                                        text="Examples",
                                        to="#examples",
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
