"""
Build script for DreamWeb documentation website
"""

import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from dreamweb.builder_module.builder import Builder
from docs_app_static import DocsApp  # Use static version for production build


def main():
    """Build the documentation website for production"""
    
    print("🔨 Building DreamWeb Documentation Website...")
    
    # Create app instance
    app = DocsApp()
    
    # Build to docs/web/build directory
    builder = Builder(app, output_dir="build")
    builder.build()
    
    print("\n✅ Documentation website built successfully!")
    print("📦 Output directory: docs/web/build/")
    print("\n🚀 To deploy:")
    print("   - Upload the build/ directory to your hosting service")
    print("   - Or serve locally: python -m http.server 8080 --directory build")


if __name__ == "__main__":
    main()
