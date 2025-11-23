/**
 * DreamWeb Core Runtime
 * Base functionality for client-side interactivity
 */

class DreamWebCore {
    constructor() {
        this.state = {};
        this.listeners = {};
    }

    /**
     * Set state value and trigger re-render
     */
    setState(stateId, value) {
        this.state[stateId] = value;
        this.triggerListeners(stateId);
    }

    /**
     * Get state value
     */
    getState(stateId) {
        return this.state[stateId];
    }

    /**
     * Toggle boolean state
     */
    toggleState(stateId) {
        this.state[stateId] = !this.state[stateId];
        this.triggerListeners(stateId);
    }

    /**
     * Increment numeric state
     */
    incrementState(stateId, amount = 1) {
        this.state[stateId] = (this.state[stateId] || 0) + amount;
        this.triggerListeners(stateId);
    }

    /**
     * Register state listener
     */
    addListener(stateId, callback) {
        if (!this.listeners[stateId]) {
            this.listeners[stateId] = [];
        }
        this.listeners[stateId].push(callback);
    }

    /**
     * Trigger all listeners for a state
     */
    triggerListeners(stateId) {
        if (this.listeners[stateId]) {
            this.listeners[stateId].forEach(callback => callback(this.state[stateId]));
        }
    }

    /**
     * Apply custom styles to element
     */
    applyStyles(element, styles) {
        if (styles && typeof styles === 'string') {
            // Parse and apply inline styles
            element.setAttribute('style', (element.getAttribute('style') || '') + '; ' + styles);
        }
    }

    /**
     * Parse and execute action string
     */
    executeAction(actionString, context = {}) {
        if (!actionString) return;

        // Toast action: "toast:Message"
        if (actionString.startsWith('toast:')) {
            const message = actionString.substring(6);
            if (window.DreamWebToast) {
                window.DreamWebToast.show(message);
            }
            return;
        }

        // Modal action: "modal:Title|Content"
        if (actionString.startsWith('modal:')) {
            const parts = actionString.substring(6).split('|');
            if (window.DreamWebModal) {
                window.DreamWebModal.show(parts[0], parts[1] || '');
            }
            return;
        }

        // Method call or page navigation
        if (context.app && typeof context.app[actionString] === 'function') {
            context.app[actionString]();
        } else if (window.DreamWebRouter) {
            window.DreamWebRouter.navigate(actionString);
        }
    }
}

// Global instance
window.DreamWebCore = new DreamWebCore();
