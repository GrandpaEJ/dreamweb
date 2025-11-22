"""
Widgets for DreamWeb
"""

# Layout widgets
from dreamweb.widgets.layout import (
    Container,
    Row,
    Column,
    Stack,
    Center,
    Spacer
)

# Text widgets
from dreamweb.widgets.text import (
    Text,
    Heading
)

# Input widgets
from dreamweb.widgets.input import (
    Button,
    TextField,
    Checkbox,
    Radio,
    Select,
    Slider
)

# Media widgets
from dreamweb.widgets.media import (
    Image,
    Video,
    Icon
)

# Navigation widgets
from dreamweb.widgets.navigation import Link

# Advanced widgets
from dreamweb.widgets.advanced import (
    Html,
    Css
)

__all__ = [
    # Layout
    'Container', 'Row', 'Column', 'Stack', 'Center', 'Spacer',
    # Text
    'Text', 'Heading',
    # Input
    'Button', 'TextField', 'Checkbox', 'Radio', 'Select', 'Slider',
    # Media
    'Image', 'Video', 'Icon',
    # Navigation
    'Link',
    # Advanced
    'Html', 'Css'
]
