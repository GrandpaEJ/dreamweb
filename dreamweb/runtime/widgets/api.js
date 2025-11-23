/**
 * DreamWeb API Request Widget
 * Make HTTP requests from the browser using Fetch API
 */

class DreamWebApiRequest {
    constructor() {
        this.activeRequests = new Map();
        this.requestCounter = 0;
    }

    /**
     * Make an API request
     * @param {Object} options - Request options
     * @returns {Promise} Request promise
     */
    async fetch(options) {
        const {
            url,
            method = 'GET',
            headers = {},
            body = null,
            credentials = 'same-origin',
            onSuccess = null,
            onError = null,
            onLoading = null
        } = options;

        const requestId = ++this.requestCounter;

        try {
            // Notify loading started
            if (onLoading) {
                onLoading(true);
            }

            // Prepare fetch options
            const fetchOptions = {
                method: method.toUpperCase(),
                headers: {
                    'Content-Type': 'application/json',
                    ...headers
                },
                credentials
            };

            // Add body if present (and not GET/HEAD)
            if (body && !['GET', 'HEAD'].includes(fetchOptions.method)) {
                if (typeof body === 'object') {
                    fetchOptions.body = JSON.stringify(body);
                } else {
                    fetchOptions.body = body;
                }
            }

            // Store active request
            const controller = new AbortController();
            fetchOptions.signal = controller.signal;
            this.activeRequests.set(requestId, controller);

            // Make the request
            const response = await fetch(url, fetchOptions);

            // Remove from active requests
            this.activeRequests.delete(requestId);

            // Check if response is ok
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            // Parse response
            const contentType = response.headers.get('content-type');
            let data;

            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else if (contentType && contentType.includes('text/')) {
                data = await response.text();
            } else {
                data = await response.blob();
            }

            // Notify loading finished
            if (onLoading) {
                onLoading(false);
            }

            // Call success callback
            if (onSuccess) {
                onSuccess(data);
            }

            return { success: true, data, response };

        } catch (error) {
            // Remove from active requests
            this.activeRequests.delete(requestId);

            // Notify loading finished
            if (onLoading) {
                onLoading(false);
            }

            // Call error callback
            if (onError) {
                onError({
                    message: error.message,
                    name: error.name,
                    stack: error.stack
                });
            }

            console.error('DreamWeb API Request Error:', error);
            return { success: false, error };
        }
    }

    /**
     * Cancel a specific request
     * @param {number} requestId - Request ID to cancel
     */
    cancel(requestId) {
        const controller = this.activeRequests.get(requestId);
        if (controller) {
            controller.abort();
            this.activeRequests.delete(requestId);
        }
    }

    /**
     * Cancel all active requests
     */
    cancelAll() {
        for (const [id, controller] of this.activeRequests) {
            controller.abort();
        }
        this.activeRequests.clear();
    }

    /**
     * Convenience method for GET requests
     */
    get(url, options = {}) {
        return this.fetch({ ...options, url, method: 'GET' });
    }

    /**
     * Convenience method for POST requests
     */
    post(url, body, options = {}) {
        return this.fetch({ ...options, url, method: 'POST', body });
    }

    /**
     * Convenience method for PUT requests
     */
    put(url, body, options = {}) {
        return this.fetch({ ...options, url, method: 'PUT', body });
    }

    /**
     * Convenience method for DELETE requests
     */
    delete(url, options = {}) {
        return this.fetch({ ...options, url, method: 'DELETE' });
    }

    /**
     * Convenience method for PATCH requests
     */
    patch(url, body, options = {}) {
        return this.fetch({ ...options, url, method: 'PATCH', body });
    }
}

// Global instance
window.DreamWebApi = new DreamWebApiRequest();

/**
 * Widget handler for ApiRequest and FetchData widgets
 */
window.DreamWebApiHandler = {
    mount: function (widget, element) {
        const { url, method, headers, body, auto_fetch, credentials, callbacks } = widget.props;

        // Create a hidden element to track the widget
        const container = document.createElement('div');
        container.style.display = 'none';
        container.dataset.widgetType = widget.type;
        container.dataset.url = url;

        // Auto-fetch if enabled
        if (auto_fetch !== false) {
            const options = {
                url,
                method: method || 'GET',
                headers: headers || {},
                body,
                credentials: credentials || 'same-origin'
            };

            // Add callbacks if they exist
            if (callbacks && callbacks.on_success) {
                options.onSuccess = function (data) {
                    // Trigger state update or custom event
                    window.dispatchEvent(new CustomEvent('dreamweb:api:success', {
                        detail: { data, url, callbackId: callbacks.on_success }
                    }));
                };
            }

            if (callbacks && callbacks.on_error) {
                options.onError = function (error) {
                    window.dispatchEvent(new CustomEvent('dreamweb:api:error', {
                        detail: { error, url, callbackId: callbacks.on_error }
                    }));
                };
            }

            if (callbacks && callbacks.on_loading) {
                options.onLoading = function (isLoading) {
                    window.dispatchEvent(new CustomEvent('dreamweb:api:loading', {
                        detail: { isLoading, url, callbackId: callbacks.on_loading }
                    }));
                };
            }

            // Make the request
            window.DreamWebApi.fetch(options);
        }

        return container;
    },

    update: function (widget, element) {
        // Re-mount on update
        return this.mount(widget, element);
    },

    unmount: function (element) {
        // Cancel any active requests for this widget
        // (In a real implementation, you'd track request IDs per widget)
    }
};

// Register handlers
if (!window.DreamWebWidgetHandlers) {
    window.DreamWebWidgetHandlers = {};
}
window.DreamWebWidgetHandlers.ApiRequest = window.DreamWebApiHandler;
window.DreamWebWidgetHandlers.FetchData = window.DreamWebApiHandler;
