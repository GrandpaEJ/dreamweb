# Deployment

DreamWeb apps are compiled into static HTML and JavaScript, making them easy to deploy anywhere.

## Build Your App

First, run the build command:

```bash
dreamweb build
```

This will create a `build/` directory containing:
- `index.html`
- `dreamweb.js`

## Hosting Options

### GitHub Pages

1. Create a repository for your project.
2. Push your code.
3. Configure GitHub Pages to serve from the `build` directory (you might need a CI workflow to build and deploy).

### Netlify / Vercel

1. Connect your repository.
2. Set the build command to `dreamweb build`.
3. Set the output directory to `build`.

### Static Web Server

You can serve the `build` directory with any static file server:

```bash
cd build
python -m http.server 8000
```

## Docker

You can also containerize your app using Nginx:

```dockerfile
FROM python:3.11 AS builder
WORKDIR /app
COPY . .
RUN pip install dreamweb
RUN dreamweb build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
```
