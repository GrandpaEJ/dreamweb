"""Test the serialization"""
from examples.hello_world import HelloWorldApp

app = HelloWorldApp()
tree = app._widget_to_dict(app.build())

import json
print(json.dumps(tree, indent=2))
