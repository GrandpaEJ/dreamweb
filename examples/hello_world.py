"""
Simple Hello World example
"""

from dreamweb import App, Container, Text, Center


class HelloWorldApp(App):
    def build(self):
        return Center(
            child=Container(
                padding=40,
                background="gradient-blue-purple",
                rounded=20,
                shadow="2xl",
                children=[
                    Text(
                        "Hello, DreamWeb! 🚀",
                        size="4xl",
                        weight="bold",
                        color="white"
                    )
                ]
            )
        )


if __name__ == "__main__":
    HelloWorldApp().run(dev=True)
