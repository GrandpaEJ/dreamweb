"""
Counter app with state management
"""

from dreamweb import App
from dreamweb.common import *


class CounterApp(App):
    def __init__(self):
        super().__init__(
            title="Counter App",
            description="A simple counter built with DreamWeb"
        )
        self.count = State(0)
    
    def increment(self):
        self.count.set(self.count.value + 1)
    
    def decrement(self):
        self.count.set(self.count.value - 1)
    
    def reset(self):
        self.count.set(0)
    
    def build(self):
        return Container(
            width="100%",
            height="100vh",
            background="gradient-purple-pink",
            align="center",
            justify="center",
            children=[
                Container(
                    width=500,
                    padding=50,
                    background="white",
                    rounded=24,
                    shadow="2xl",
                    children=[
                        Column(
                            spacing=30,
                            align="center",
                            children=[
                                Text(
                                    "Counter App",
                                    size="3xl",
                                    weight="bold",
                                    color="gray-900"
                                ),
                                Container(
                                    width=200,
                                    height=200,
                                    background="gradient-blue-purple",
                                    rounded=100,
                                    align="center",
                                    justify="center",
                                    shadow="lg",
                                    children=[
                                        Text(
                                            str(self.count.value),
                                            size="4xl",
                                            weight="bold",
                                            color="white"
                                        )
                                    ]
                                ),
                                Row(
                                    spacing=15,
                                    justify="center",
                                    children=[
                                        Button(
                                            text="−",
                                            color="red",
                                            size="xl",
                                            rounded=True,
                                            on_click=self.decrement
                                        ),
                                        Button(
                                            text="Reset",
                                            color="secondary",
                                            size="xl",
                                            rounded=True,
                                            on_click=self.reset
                                        ),
                                        Button(
                                            text="+",
                                            color="green",
                                            size="xl",
                                            rounded=True,
                                            on_click=self.increment
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
    CounterApp().run(dev=True)
