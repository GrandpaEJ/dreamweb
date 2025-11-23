# API Request Widget for DreamWeb

The API Request widget allows you to make HTTP requests from your DreamWeb applications using the browser's Fetch API. This is perfect for client-side only applications that need to interact with external APIs.

## Features

- ✅ **All HTTP Methods**: GET, POST, PUT, DELETE, PATCH
- ✅ **Automatic JSON Handling**: Automatically stringifies request bodies and parses JSON responses
- ✅ **Callback Support**: `on_success`, `on_error`, and `on_loading` callbacks
- ✅ **Auto-fetch**: Automatically fetch data when component mounts
- ✅ **CORS Support**: Configure credentials for cross-origin requests
- ✅ **Request Cancellation**: Cancel active requests when needed
- ✅ **No Backend Required**: Pure client-side, works with any REST API

## Widgets

### `ApiRequest`

Full-featured widget for making HTTP requests with complete control.

**Parameters:**
- `url` (str): The URL to make the request to
- `method` (str): HTTP method - "GET", "POST", "PUT", "DELETE", etc. (default: "GET")
- `headers` (dict): Optional HTTP headers
- `body` (any): Request body (auto-converted to JSON if dict/list)
- `on_success` (callable): Callback when request succeeds (receives response data)
- `on_error` (callable): Callback when request fails (receives error object)
- `on_loading` (callable): Callback when loading state changes (receives boolean)
- `auto_fetch` (bool): Auto-fetch on mount (default: True)
- `credentials` (str): "omit", "same-origin", or "include" (default: "same-origin")

### `FetchData`

Simplified widget for GET requests only.

**Parameters:**
- `url` (str): The URL to fetch data from
- `headers` (dict): Optional HTTP headers
- `on_success` (callable): Callback when request succeeds
- `on_error` (callable): Callback when request fails
- `auto_fetch` (bool): Auto-fetch on mount (default: True)

## Usage Examples

### Basic GET Request

```python
from dreamweb import App, State, Container, Text, FetchData

state = State()
state.set('user', None)

def on_user_loaded(data):
    state.set('user', data)

def build():
    user = state.get('user')
    
    return Container(
        children=[
            FetchData(
                url="https://api.github.com/users/octocat",
                on_success=on_user_loaded
            ),
            Text(f"User: {user.get('login')}" if user else "Loading...")
        ]
    )

app = App(build=build, state=state)
```

### POST Request with Form Data

```python
from dreamweb import App, State, Container, Button, TextField, ApiRequest

state = State()

def on_submit_success(data):
    state.set('response', data)
    print(f"Success! Created user with ID: {data.get('id')}")

def on_submit_error(error):
    state.set('error', error.get('message'))

def handle_submit():
    state.set('should_submit', True)

def build():
    children = [
        TextField(
            placeholder="Name",
            on_change=lambda v: state.set('name', v)
        ),
        Button(text="Submit", on_click=handle_submit)
    ]
    
    # Add ApiRequest when form should be submitted
    if state.get('should_submit'):
        children.append(
            ApiRequest(
                url="https://jsonplaceholder.typicode.com/users",
                method="POST",
                body={
                    "name": state.get('name'),
                    "email": state.get('email')
                },
                on_success=on_submit_success,
                on_error=on_submit_error
            )
        )
        state.set('should_submit', False)
    
    return Container(children=children)

app = App(build=build, state=state)
```

### With Loading States

```python
from dreamweb import ApiRequest, State

state = State()
state.set('loading', False)

def on_loading(is_loading):
    state.set('loading', is_loading)

def on_success(data):
    state.set('data', data)

ApiRequest(
    url="https://api.example.com/data",
    on_success=on_success,
    on_loading=on_loading
)

# In your UI
Text("Loading..." if state.get('loading') else "Ready")
```

### Custom Headers and Authentication

```python
ApiRequest(
    url="https://api.example.com/protected",
    method="GET",
    headers={
        "Authorization": "Bearer YOUR_TOKEN_HERE",
        "X-Custom-Header": "value"
    },
    on_success=lambda data: print(data)
)
```

### PUT/PATCH/DELETE Requests

```python
# Update resource
ApiRequest(
    url="https://api.example.com/users/123",
    method="PUT",
    body={"name": "Updated Name"},
    on_success=lambda data: print("Updated!")
)

# Partial update
ApiRequest(
    url="https://api.example.com/users/123",
    method="PATCH",
    body={"email": "new@email.com"},
    on_success=lambda data: print("Patched!")
)

# Delete resource
ApiRequest(
    url="https://api.example.com/users/123",
    method="DELETE",
    on_success=lambda data: print("Deleted!")
)
```

## JavaScript API

You can also use the global `DreamWebApi` object directly in your JavaScript code:

```javascript
// GET request
window.DreamWebApi.get('https://api.example.com/data')
    .then(result => console.log(result.data));

// POST request
window.DreamWebApi.post('https://api.example.com/users', {
    name: 'John Doe',
    email: 'john@example.com'
}).then(result => console.log(result.data));

// Full control
window.DreamWebApi.fetch({
    url: 'https://api.example.com/data',
    method: 'GET',
    headers: { 'Authorization': 'Bearer token' },
    onSuccess: (data) => console.log(data),
    onError: (error) => console.error(error),
    onLoading: (isLoading) => console.log('Loading:', isLoading)
});

// Cancel all requests
window.DreamWebApi.cancelAll();
```

## Error Handling

Errors are passed to the `on_error` callback with the following structure:

```python
{
    'message': 'Error message',
    'name': 'Error name',
    'stack': 'Stack trace'
}
```

Example:

```python
def handle_error(error):
    print(f"Request failed: {error.get('message')}")
    if 'HTTP 404' in error.get('message', ''):
        print("Resource not found!")
    elif 'HTTP 500' in error.get('message', ''):
        print("Server error!")
```

## CORS Considerations

Since this is a client-side widget, you may encounter CORS (Cross-Origin Resource Sharing) issues when making requests to external APIs. The API you're calling must have proper CORS headers configured.

**Solutions:**
1. Use APIs that support CORS (most public APIs do)
2. Use a CORS proxy for development (not recommended for production)
3. Configure the API server to allow your domain

## Response Types

The widget automatically detects and parses different response types:

- **JSON**: Automatically parsed to JavaScript object
- **Text**: Returned as string
- **Binary**: Returned as Blob

## Best Practices

1. **Handle Loading States**: Always show loading indicators for better UX
2. **Error Handling**: Always provide `on_error` callbacks
3. **Avoid Hardcoding Tokens**: Use environment variables or secure storage
4. **Rate Limiting**: Be mindful of API rate limits
5. **Cancel Requests**: Cancel pending requests when components unmount

## Examples

Check out the example files:
- `examples/api_example.py` - Basic GET request example
- `examples/api_post_example.py` - POST request with form data

## Notes

- This widget is **client-side only** and runs in the browser
- No Python HTTP libraries (like `requests`) are used
- All requests are made using the browser's native Fetch API
- Perfect for static sites and JAMstack applications
