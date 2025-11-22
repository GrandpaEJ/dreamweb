# SEO & Metadata

DreamWeb allows you to customize the metadata of your application to improve Search Engine Optimization (SEO) and social sharing.

## Basic Metadata

You can set the `title` and `description` of your app in the `__init__` method of your `App` class:

```python
class MyApp(App):
    def __init__(self):
        super().__init__(
            title="My Awesome App",
            description="The best app ever built with DreamWeb"
        )
```

This will generate the following HTML tags:

```html
<title>My Awesome App</title>
<meta name="description" content="The best app ever built with DreamWeb">
```

## Advanced Head Tags

For more control, you can pass a list of raw HTML strings to `head_tags`. This is useful for:
- Keywords
- Open Graph (OG) tags for social media
- Favicons
- External scripts or stylesheets

```python
class MyApp(App):
    def __init__(self):
        super().__init__(
            title="My Awesome App",
            description="The best app ever built with DreamWeb",
            head_tags=[
                # Keywords
                '<meta name="keywords" content="dreamweb, python, app">',
                
                # Open Graph
                '<meta property="og:title" content="My Awesome App">',
                '<meta property="og:image" content="https://example.com/image.png">',
                
                # Favicon
                '<link rel="icon" href="/favicon.ico">',
                
                # External CSS
                '<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto">'
            ]
        )
```

These tags will be injected directly into the `<head>` section of your application's `index.html`.
