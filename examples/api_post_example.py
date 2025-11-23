"""
Advanced Example: POST request with ApiRequest widget
"""

from dreamweb import App
from dreamweb.common import *


class ApiPostExampleApp(App):
    def __init__(self):
        super().__init__(
            title="API POST Example",
            description="Create resources using POST requests with DreamWeb"
        )
        # State management
        self.name = State("")
        self.email = State("")
        self.response = State(None)
        self.loading = State(False)
        self.error = State(None)
        self.should_submit = State(False)
    
    def on_submit_success(self, data):
        """Called when form submission succeeds"""
        self.response.set(data)
        self.error.set(None)
        self.loading.set(False)
    
    def on_submit_error(self, error):
        """Called when form submission fails"""
        self.error.set(error.get('message', 'Unknown error'))
        self.response.set(None)
        self.loading.set(False)
    
    def on_loading_change(self, is_loading):
        """Called when loading state changes"""
        self.loading.set(is_loading)
    
    def handle_submit(self):
        """Handle form submission"""
        if not self.name.value or not self.email.value:
            self.error.set('Please fill in all fields')
            return
        
        self.should_submit.set(True)
    
    def build(self):
        loading = self.loading.value
        error = self.error.value
        response = self.response.value
        should_submit = self.should_submit.value
        
        children = [
            Text("API POST Request Example", style="font-size: 24px; font-weight: bold; margin-bottom: 20px;"),
            
            TextField(
                placeholder="Enter your name",
                value=self.name.value,
                on_change=lambda v: self.name.set(v),
                style="width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ccc; border-radius: 4px;"
            ),
            
            TextField(
                placeholder="Enter your email",
                value=self.email.value,
                on_change=lambda v: self.email.set(v),
                style="width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ccc; border-radius: 4px;"
            ),
            
            Button(
                text="Submit" if not loading else "Submitting...",
                on_click=self.handle_submit,
                disabled=loading,
                style="padding: 10px 20px; margin: 10px 0; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;"
            ),
        ]
        
        # Show error if any
        if error:
            children.append(
                Text(f"Error: {error}", style="color: red; margin: 10px 0;")
            )
        
        # Show response if any
        if response:
            children.append(
                Text(f"Success! Created user with ID: {response.get('id')}", style="color: green; margin: 10px 0;")
            )
        
        # Add ApiRequest widget when form should be submitted
        if should_submit:
            children.append(
                ApiRequest(
                    url="https://jsonplaceholder.typicode.com/users",
                    method="POST",
                    headers={"Content-Type": "application/json"},
                    body={
                        "name": self.name.value,
                        "email": self.email.value
                    },
                    on_success=self.on_submit_success,
                    on_error=self.on_submit_error,
                    on_loading=self.on_loading_change,
                    auto_fetch=True
                )
            )
            # Reset submit trigger
            self.should_submit.set(False)
        
        return Container(
            children=[
                Column(
                    children=children,
                    style="gap: 10px;"
                )
            ],
            style="padding: 20px; max-width: 600px; margin: 0 auto; font-family: sans-serif;"
        )


if __name__ == "__main__":
    ApiPostExampleApp().run(dev=True)
