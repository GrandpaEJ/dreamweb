/**
 * DreamWeb Router Widget
 * Client-side page navigation
 */

class DreamWebRouter {
    constructor() {
        this.routes = {};
        this.currentRoute = null;
        this.container = null;
    }

    /**
     * Initialize router with routes
     */
    init(container, routes, initialRoute) {
        this.container = container;
        this.routes = routes;
        this.navigate(initialRoute || Object.keys(routes)[0]);

        // Listen to hash changes
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.substring(1);
            if (hash && this.routes[hash]) {
                this.navigate(hash);
            }
        });
    }

    /**
     * Navigate to a route
     */
    navigate(routeName) {
        if (!this.routes[routeName]) {
            console.warn(`Route "${routeName}" not found`);
            return;
        }

        this.currentRoute = routeName;
        window.location.hash = routeName;

        // Update container content
        if (this.container) {
            this.container.innerHTML = '';
            const content = this.routes[routeName];
            if (content) {
                this.container.appendChild(content);
            }
        }
    }
}

// Global instance
window.DreamWebRouter = new DreamWebRouter();
