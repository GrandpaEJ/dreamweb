# CLI Reference

DreamWeb comes with a command-line interface to help you manage your projects.

## `dreamweb create`

Create a new DreamWeb project.

```bash
dreamweb create <project_name>
```

This creates a new directory with the specified name and generates a starter `main.py` file with a sample application.

## `dreamweb dev`

Start the development server with hot reload.

```bash
dreamweb dev
```

Options:
- `--port`: Port number (default: 8000)
- `--host`: Host address (default: localhost)

## `dreamweb build`

Build the application for production.

```bash
dreamweb build
```

Options:
- `--output`: Output directory (default: build)

This compiles your Python code into a static HTML/JS bundle in the output directory.
