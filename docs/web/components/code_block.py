"""
Code block component for DreamWeb docs
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))

from dreamweb.common import *


def create_code_block(code, language="python"):
    """
    Create a code block component with syntax highlighting
    
    Args:
        code: Code string to display
        language: Programming language (for styling)
    """
    
    return Container(
        width="100%",
        background="#1e293b",
        padding=20,
        rounded=8,
        style="margin: 20px 0; overflow-x: auto; position: relative;",
        children=[
            # Language label
            Container(
                background="#334155",
                padding={'top': 4, 'right': 12, 'bottom': 4, 'left': 12},
                rounded=4,
                style="position: absolute; top: 10px; right: 10px;",
                children=[
                    Text(
                        language,
                        size="xs",
                        color="#94a3b8",
                        weight="medium"
                    )
                ]
            ),
            
            # Code content
            Html(html=f'''
                <pre style="margin: 0; padding: 0; overflow-x: auto;">
                    <code style="
                        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                        font-size: 0.9rem;
                        line-height: 1.6;
                        color: #e2e8f0;
                        white-space: pre;
                    ">{code}</code>
                </pre>
            ''')
        ]
    )


def create_inline_code(code):
    """Create inline code snippet"""
    
    return Html(html=f'''
        <code style="
            background: #1e293b;
            color: #3b82f6;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 0.9em;
        ">{code}</code>
    ''')
