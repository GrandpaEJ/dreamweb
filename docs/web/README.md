# DreamWeb Documentation Website

This is the official documentation website for DreamWeb, built using DreamWeb itself!

## Running Locally

### Development Mode

```bash
cd docs/web
python docs_app.py
```

Visit `http://localhost:8000` to view the documentation site.

### Building for Production

To build a production-ready version:

```bash
cd docs/web
python build.py
```

This will create a `build/` directory with optimized `index.html` and `dreamweb.js` files.

## Structure

```
docs/web/
├── docs_app.py           # Main application
├── build.py              # Build script (coming soon)
├── components/           # Reusable components
│   ├── navbar.py        # Navigation bar
│   ├── footer.py        # Footer
│   └── code_block.py    # Code block display
└── pages/               # Content pages
    ├── home.py          # Homepage
    ├── getting_started.py
    ├── widgets.py
    └── ...
```

## Features

- **State-based Routing**: Navigate between pages without reloading
- **Responsive Design**: Works on desktop and mobile
- **Beautiful UI**: Modern gradient design with dark theme
- **Code Examples**: Syntax-highlighted code blocks
- **Built with DreamWeb**: Dogfooding our own framework!

## Deployment

The built files can be deployed to any static hosting service:

- GitHub Pages
- Netlify
- Vercel
- AWS S3
- Any web server

Simply upload the contents of the `build/` directory.
