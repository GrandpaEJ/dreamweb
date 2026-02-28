"""
Development server with hot reload for DreamWeb
"""

import os
import sys
import json
import importlib
import importlib.util
import traceback
import threading
from threading import Thread
import asyncio
import websockets
from pathlib import Path
from http.server import HTTPServer, SimpleHTTPRequestHandler
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from dreamweb.core import App


def _error_tree(title: str, message: str) -> dict:
    """Build a widget tree that displays an error overlay in the browser"""
    return {
        "type": "Container",
        "props": {
            "width": "100%",
            "height": "100vh",
            "background": "#1a1a2e",
            "align": "center",
            "justify": "center",
        },
        "children": [
            {
                "type": "Container",
                "props": {
                    "width": "700",
                    "padding": 32,
                    "background": "#16213e",
                    "rounded": 12,
                    "border": {"width": 2, "color": "#e74c3c", "style": "solid"},
                    "shadow": "xl",
                },
                "children": [
                    {
                        "type": "Text",
                        "props": {
                            "text": f"💥 {title}",
                            "size": "xl",
                            "weight": "bold",
                            "color": "#e74c3c",
                        },
                    },
                    {
                        "type": "Container",
                        "props": {
                            "padding": {"top": 16, "right": 0, "bottom": 0, "left": 0}
                        },
                        "children": [
                            {
                                "type": "Html",
                                "props": {
                                    "html": f'<pre style="color:#a8d8ea;font-family:monospace;font-size:13px;white-space:pre-wrap;word-break:break-word;">{message}</pre>'
                                },
                            },
                        ],
                    },
                ],
            }
        ],
    }


class DreamWebHandler(SimpleHTTPRequestHandler):
    """Custom HTTP handler for dev server"""

    app_instance = None

    def do_GET(self):
        if self.path == "/" or self.path == "/index.html":
            self.send_response(200)
            self.send_header("Content-type", "text/html")
            self.end_headers()
            html = self.generate_html()
            self.wfile.write(html.encode())
        elif self.path == "/runtime.js":
            self.send_response(200)
            self.send_header("Content-type", "application/javascript")
            self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
            self.end_headers()
            runtime_path = Path(__file__).parent.parent / "runtime" / "runtime.js"
            with open(runtime_path, "r") as f:
                self.wfile.write(f.read().encode())
        else:
            super().do_GET()

    def generate_html(self):
        """Generate HTML with embedded app tree"""
        if not self.app_instance:
            return "<html><body>No app instance</body></html>"

        try:
            tree = self.app_instance._widget_to_dict(self.app_instance.build())
            states = {}
            for attr_name in dir(self.app_instance):
                attr = getattr(self.app_instance, attr_name)
                from dreamweb.core.state import State

                if isinstance(attr, State):
                    states[attr_name] = attr.value
        except Exception:
            tb = traceback.format_exc()
            tree = _error_tree("Build Error", tb)
            states = {}

        return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="{self.app_instance.description}">
    <title>{self.app_instance.title}</title>
    {chr(10).join(self.app_instance.head_tags)}
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }}
        #app {{ width: 100%; min-height: 100vh; }}
    </style>
</head>
<body>
    <div id="app"></div>
    <script src="/runtime.js"></script>
    <script>
        const componentTree = {json.dumps(tree, indent=2)};
        const initialStates = {json.dumps(states)};
        const runtime = new DreamWebRuntime(document.getElementById('app'));
        runtime.init(componentTree, initialStates);
    </script>
</body>
</html>"""

    def log_message(self, format, *args):
        print(f"[DevServer] {format % args}")


class FileWatcher(FileSystemEventHandler):
    """Watch for file changes and trigger reload"""

    def __init__(self, callback):
        self.callback = callback
        self._debounce_timer = None

    def on_modified(self, event):
        if event.src_path.endswith(".py"):
            # Debounce: wait 200ms before triggering to avoid double-fires
            if self._debounce_timer:
                self._debounce_timer.cancel()
            self._debounce_timer = threading.Timer(
                0.2, self.callback, args=[event.src_path]
            )
            self._debounce_timer.start()


class DevServer:
    """Development server with hot reload"""

    def __init__(self, app: "App", port: int = 8000, host: str = "localhost"):
        self.app = app
        self.port = port
        self.host = host
        self.observer = None
        self.ws_clients = set()
        self.loop = None
        # Track the module that contains the user's app so we can reload it
        self._app_module = sys.modules.get(type(app).__module__)
        self._app_class_name = type(app).__name__

    def start(self):
        """Start the dev server"""
        print(
            f"""
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🚀 DreamWeb Dev Server                                ║
║                                                          ║
║   Running at: http://{self.host}:{self.port:<35}║
║                                                          ║
║   Press Ctrl+C to stop                                   ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
        """
        )

        DreamWebHandler.app_instance = self.app
        self.start_file_watcher()

        http_thread = Thread(target=self._run_http_server)
        http_thread.daemon = True
        http_thread.start()

        self._run_ws_server()

    def _run_http_server(self):
        server = HTTPServer((self.host, self.port), DreamWebHandler)
        server.serve_forever()

    def _run_ws_server(self):
        self.loop = asyncio.new_event_loop()
        asyncio.set_event_loop(self.loop)

        async def runner():
            async with websockets.serve(self._handle_ws, self.host, self.port + 1):
                print(
                    f"🔌 WebSocket server running at ws://{self.host}:{self.port + 1}"
                )
                await asyncio.Future()

        try:
            self.loop.run_until_complete(runner())
        except KeyboardInterrupt:
            pass

    async def _handle_ws(self, websocket):
        self.ws_clients.add(websocket)
        try:
            async for message in websocket:
                data = json.loads(message)
                if data["type"] == "event":
                    await self._handle_event(data)
        except websockets.exceptions.ConnectionClosed:
            pass
        finally:
            self.ws_clients.discard(websocket)

    async def _handle_event(self, data):
        handler_id = data.get("handler")
        value = data.get("value")
        if self.app._handle_event(handler_id, value):
            await self._broadcast_update()

    async def _broadcast_update(self, tree_override=None):
        if not self.ws_clients:
            return

        if tree_override is not None:
            tree = tree_override
        else:
            try:
                self.app._event_handlers = {}
                tree = self.app._widget_to_dict(self.app.build())
            except Exception:
                tb = traceback.format_exc()
                tree = _error_tree("Runtime Error", tb)

        message = json.dumps({"type": "reload", "tree": tree})
        tasks = [
            asyncio.create_task(client.send(message))
            for client in list(self.ws_clients)
        ]
        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)

    def start_file_watcher(self):
        event_handler = FileWatcher(self.on_file_change)
        self.observer = Observer()
        watch_path = os.getcwd()
        self.observer.schedule(event_handler, watch_path, recursive=True)
        self.observer.start()
        print(f"👀 Watching for changes in: {watch_path}")

    def on_file_change(self, src_path: str):
        """Handle file changes — reload the user's module and broadcast the new tree"""
        print(f"🔄 File changed: {src_path}")

        error_tree = None

        # Attempt to reload the user's app module
        if self._app_module is not None:
            try:
                importlib.reload(self._app_module)
                # Re-instantiate the app from the reloaded module
                app_class = getattr(self._app_module, self._app_class_name)
                new_app = app_class()

                # Preserve existing state values where state names match
                for attr_name in dir(new_app):
                    from dreamweb.core.state import State

                    new_attr = getattr(new_app, attr_name)
                    if isinstance(new_attr, State):
                        old_attr = getattr(self.app, attr_name, None)
                        if isinstance(old_attr, State):
                            new_attr._value = old_attr._value

                self.app = new_app
                DreamWebHandler.app_instance = new_app
                print(f"✅ Module reloaded: {self._app_module.__name__}")
            except Exception:
                tb = traceback.format_exc()
                print(f"❌ Reload error:\n{tb}")
                error_tree = _error_tree("Hot Reload Error", tb)

        if self.loop:
            asyncio.run_coroutine_threadsafe(
                self._broadcast_update(tree_override=error_tree), self.loop
            )
