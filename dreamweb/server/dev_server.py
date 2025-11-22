"""
Development server with hot reload for DreamWeb
"""

import os
import json
import threading
from pathlib import Path
from http.server import HTTPServer, SimpleHTTPRequestHandler
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from dreamweb.core import App


class DreamWebHandler(SimpleHTTPRequestHandler):
    """Custom HTTP handler for dev server"""
    
    app_instance = None
    
    def do_GET(self):
        if self.path == '/' or self.path == '/index.html':
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            
            # Generate HTML with app tree
            html = self.generate_html()
            self.wfile.write(html.encode())
        elif self.path == '/runtime.js':
            self.send_response(200)
            self.send_header('Content-type', 'application/javascript')
            self.end_headers()
            
            # Serve runtime.js from new location
            runtime_path = Path(__file__).parent.parent / 'runtime' / 'runtime.js'
            with open(runtime_path, 'r') as f:
                self.wfile.write(f.read().encode())
        else:
            super().do_GET()
    
    def generate_html(self):
        """Generate HTML with embedded app tree"""
        if not self.app_instance:
            return "<html><body>No app instance</body></html>"
        
        tree = self.app_instance._widget_to_dict(self.app_instance.build())
        
        return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DreamWeb App</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        }}
        #app {{
            width: 100%;
            min-height: 100vh;
        }}
    </style>
</head>
<body>
    <div id="app"></div>
    <script src="/runtime.js"></script>
    <script>
        const componentTree = {json.dumps(tree, indent=2)};
        const runtime = new DreamWebRuntime(document.getElementById('app'));
        runtime.init(componentTree);
    </script>
</body>
</html>"""
    
    def log_message(self, format, *args):
        """Custom logging"""
        print(f"[DevServer] {format % args}")


class FileWatcher(FileSystemEventHandler):
    """Watch for file changes and trigger reload"""
    
    def __init__(self, callback):
        self.callback = callback
    
    def on_modified(self, event):
        if event.src_path.endswith('.py'):
            print(f"🔄 File changed: {event.src_path}")
            self.callback()


import asyncio
import websockets
from threading import Thread

class DevServer:
    """Development server with hot reload"""
    
    def __init__(self, app: 'App', port: int = 8000, host: str = "localhost"):
        self.app = app
        self.port = port
        self.host = host
        self.observer = None
        self.ws_clients = set()
        self.loop = None
    
    def start(self):
        """Start the dev server"""
        print(f"""
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🚀 DreamWeb Dev Server                                ║
║                                                          ║
║   Running at: http://{self.host}:{self.port}                      ║
║                                                          ║
║   Press Ctrl+C to stop                                   ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
        """)
        
        # Set app instance for handler
        DreamWebHandler.app_instance = self.app
        
        # Start file watcher
        self.start_file_watcher()
        
        # Start HTTP server in a separate thread
        http_thread = Thread(target=self._run_http_server)
        http_thread.daemon = True
        http_thread.start()
        
        # Start WebSocket server
        self._run_ws_server()
    
    def _run_http_server(self):
        """Run HTTP server"""
        server = HTTPServer((self.host, self.port), DreamWebHandler)
        server.serve_forever()
    
    def _run_ws_server(self):
        """Run WebSocket server"""
        self.loop = asyncio.new_event_loop()
        asyncio.set_event_loop(self.loop)
        
        async def runner():
            async with websockets.serve(self._handle_ws, self.host, self.port + 1):
                print(f"🔌 WebSocket server running at ws://{self.host}:{self.port + 1}")
                await asyncio.Future()  # run forever

        try:
            self.loop.run_until_complete(runner())
        except KeyboardInterrupt:
            pass
    
    async def _handle_ws(self, websocket):
        """Handle WebSocket connection"""
        self.ws_clients.add(websocket)
        try:
            async for message in websocket:
                data = json.loads(message)
                if data['type'] == 'event':
                    # Handle event
                    await self._handle_event(data)
        except websockets.exceptions.ConnectionClosed:
            pass
        finally:
            self.ws_clients.remove(websocket)
    
    async def _handle_event(self, data):
        """Handle event from client"""
        handler_id = data.get('handler')
        value = data.get('value')
        
        # Dispatch event to app
        if self.app._handle_event(handler_id, value):
            # If state changed, broadcast update
            await self._broadcast_update()
    
    async def _broadcast_update(self):
        """Broadcast app update to all clients"""
        if not self.ws_clients:
            return
            
        tree = self.app._widget_to_dict(self.app.build())
        message = json.dumps({
            'type': 'reload',
            'tree': tree
        })
        
        # Create tasks for sending to all clients
        tasks = [asyncio.create_task(client.send(message)) for client in self.ws_clients]
        if tasks:
            await asyncio.wait(tasks)
    
    def start_file_watcher(self):
        """Start watching for file changes"""
        event_handler = FileWatcher(self.on_file_change)
        self.observer = Observer()
        
        # Watch current directory
        watch_path = os.getcwd()
        self.observer.schedule(event_handler, watch_path, recursive=True)
        self.observer.start()
        
        print(f"👀 Watching for changes in: {watch_path}")
    
    def on_file_change(self):
        """Handle file changes"""
        print("🔄 File changed, reloading...")
        # In a real implementation, we would reload the module here
        # For now, we just trigger a client refresh if possible
        if self.loop:
            asyncio.run_coroutine_threadsafe(self._broadcast_update(), self.loop)
