# DreamWeb CLI Usage Guide

Here is how a user would interact with DreamWeb after installing it.

## 1. Installation

First, the user installs the package from PyPI:

```bash
pip install dreamweb
```

## 2. Create a New Project

The user creates a new project named `awesome_app`:

```bash
dreamweb create awesome_app
```

**Output:**
```text
✅ Created project 'awesome_app'!

To get started:
    cd awesome_app
    python main.py

This will start the dev server at http://localhost:8000
```

## 3. Develop

The user enters the directory and starts the development server:

```bash
cd awesome_app
dreamweb dev
```

**Output:**
```text
🚀 Starting dev server on localhost:8000...

╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🚀 DreamWeb Dev Server                                ║
║                                                          ║
║   Running at: http://localhost:8000                      ║
║                                                          ║
║   Press Ctrl+C to stop                                   ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝

👀 Watching for changes in: /path/to/awesome_app
🔌 WebSocket server running at ws://localhost:8001
```

The user can now open `http://localhost:8000` in their browser. Any changes to `main.py` will trigger a hot reload.

## 4. Build for Production

When ready to deploy, the user builds the application:

```bash
dreamweb build
```

**Output:**
```text
📦 Building project to build...
🔨 Building DreamWeb app...
✅ Build complete!
📦 Output: /path/to/awesome_app/build
   - index.html
   - dreamweb.js
```

The `build/` directory now contains the static files ready to be deployed to GitHub Pages, Netlify, or any web server.
