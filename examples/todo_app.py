"""
Todo app with forms and lists
"""

from dreamweb import App, Container, Text, Button, TextField, Row, Column, Checkbox, State


class TodoApp(App):
    def __init__(self):
        super().__init__()
        self.todos = State([])
        self.new_todo = State("")
    
    def add_todo(self):
        if self.new_todo.value.strip():
            current_todos = self.todos.value.copy()
            current_todos.append({
                'id': len(current_todos),
                'text': self.new_todo.value,
                'completed': False
            })
            self.todos.set(current_todos)
            self.new_todo.set("")
    
    def toggle_todo(self, todo_id):
        current_todos = self.todos.value.copy()
        for todo in current_todos:
            if todo['id'] == todo_id:
                todo['completed'] = not todo['completed']
        self.todos.set(current_todos)
    
    def delete_todo(self, todo_id):
        current_todos = [t for t in self.todos.value if t['id'] != todo_id]
        self.todos.set(current_todos)
    
    def build(self):
        # Build todo items
        todo_items = []
        for todo in self.todos.value:
            todo_items.append(
                Container(
                    padding=15,
                    margin={'bottom': 10},
                    background="white",
                    rounded=12,
                    shadow="md",
                    children=[
                        Row(
                            spacing=15,
                            align="center",
                            justify="between",
                            children=[
                                Row(
                                    spacing=10,
                                    align="center",
                                    children=[
                                        Checkbox(
                                            checked=todo['completed'],
                                            on_change=lambda: self.toggle_todo(todo['id'])
                                        ),
                                        Text(
                                            todo['text'],
                                            size="lg",
                                            color="gray-900" if not todo['completed'] else "gray-400",
                                            weight="medium"
                                        )
                                    ]
                                ),
                                Button(
                                    text="Delete",
                                    color="danger",
                                    size="sm",
                                    variant="outline",
                                    on_click=lambda: self.delete_todo(todo['id'])
                                )
                            ]
                        )
                    ]
                )
            )
        
        return Container(
            width="100%",
            height="100vh",
            background="gradient-blue-purple",
            padding=40,
            children=[
                Container(
                    width=700,
                    margin="auto",
                    children=[
                        # Header
                        Container(
                            padding=30,
                            background="white",
                            rounded=16,
                            shadow="xl",
                            margin={'bottom': 30},
                            children=[
                                Text(
                                    "📝 Todo App",
                                    size="3xl",
                                    weight="bold",
                                    color="gray-900",
                                    align="center"
                                )
                            ]
                        ),
                        
                        # Add todo form
                        Container(
                            padding=25,
                            background="white",
                            rounded=16,
                            shadow="xl",
                            margin={'bottom': 30},
                            children=[
                                Row(
                                    spacing=10,
                                    children=[
                                        TextField(
                                            placeholder="What needs to be done?",
                                            value=self.new_todo.value,
                                            on_change=lambda v: self.new_todo.set(v)
                                        ),
                                        Button(
                                            text="Add",
                                            color="primary",
                                            size="lg",
                                            on_click=self.add_todo
                                        )
                                    ]
                                )
                            ]
                        ),
                        
                        # Todo list
                        Container(
                            padding=25,
                            background="rgba(255, 255, 255, 0.1)",
                            rounded=16,
                            children=todo_items if todo_items else [
                                Text(
                                    "No todos yet! Add one above.",
                                    size="lg",
                                    color="white",
                                    align="center"
                                )
                            ]
                        )
                    ]
                )
            ]
        )


if __name__ == "__main__":
    TodoApp().run(dev=True)
