"""
Example: Using ApiRequest widget to fetch data from an API
"""

from dreamweb import App
from dreamweb.common import *


class ApiExampleApp(App):
    def __init__(self):
        super().__init__(
            title="API Request Example",
            description="Fetch data from GitHub API using DreamWeb"
        )
        # State management
        self.user = State(None)
        self.loading = State(False)
        self.error = State(None)
    
    def on_user_loaded(self, data):
        """Called when user data is successfully loaded"""
        self.user.set(data)
        self.error.set(None)
    
    def on_error(self, error):
        """Called when request fails"""
        self.error.set(error.get('message', 'Unknown error'))
        self.user.set(None)
    
    def on_loading(self, is_loading):
        """Called when loading state changes"""
        self.loading.set(is_loading)
    
    def build(self):
        user = self.user.value
        loading = self.loading.value
        error = self.error.value
        
        # Build user info display
        user_display = Text("No user data yet")
        if user:
            user_display = Column(
                children=[
                    Text(f"Username: {user.get('login', 'N/A')}", style="margin: 5px 0;"),
                    Text(f"Name: {user.get('name', 'N/A')}", style="margin: 5px 0;"),
                    Text(f"Bio: {user.get('bio', 'N/A')}", style="margin: 5px 0;"),
                    Text(f"Public Repos: {user.get('public_repos', 'N/A')}", style="margin: 5px 0;"),
                ]
            )
        
        return Container(
            children=[
                Column(
                    children=[
                        Text("API Request Example", style="font-size: 24px; font-weight: bold; margin-bottom: 20px;"),
                        
                        # Automatic fetch on mount
                        FetchData(
                            url="https://api.github.com/users/octocat",
                            on_success=self.on_user_loaded,
                            on_error=self.on_error,
                            auto_fetch=True
                        ),
                        
                        # Show loading state
                        Text("Loading..." if loading else "", style="color: #666; margin: 10px 0;"),
                        
                        # Show error if any
                        Text(f"Error: {error}" if error else "", style="color: red; margin: 10px 0;"),
                        
                        # Show user data
                        user_display,
                    ],
                    style="gap: 10px;"
                )
            ],
            style="padding: 20px; max-width: 600px; margin: 0 auto; font-family: sans-serif;"
        )


if __name__ == "__main__":
    ApiExampleApp().run(dev=True)
