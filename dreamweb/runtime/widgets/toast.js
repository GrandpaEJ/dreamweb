/**
 * DreamWeb Toast Widget
 * Show temporary notification messages
 */

class DreamWebToast {
    constructor() {
        this.container = null;
        this.init();
    }

    /**
     * Initialize toast container
     */
    init() {
        this.container = document.createElement('div');
        this.container.id = 'dreamweb-toast-container';
        this.container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(this.container);
    }

    /**
     * Show toast message
     */
    show(message, duration = 3000, position = 'top-right') {
        const toast = document.createElement('div');
        toast.className = 'dreamweb-toast';
        toast.textContent = message;
        toast.style.cssText = `
            background: #323232;
            color: white;
            padding: 12px 24px;
            border-radius: 4px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            font-size: 14px;
            animation: dreamweb-toast-in 0.3s ease;
            cursor: pointer;
        `;

        this.container.appendChild(toast);

        // Auto dismiss
        setTimeout(() => {
            toast.style.animation = 'dreamweb-toast-out 0.3s ease';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duration);

        // Click to dismiss
        toast.addEventListener('click', () => {
            toast.style.animation = 'dreamweb-toast-out 0.3s ease';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        });
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes dreamweb-toast-in {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    @keyframes dreamweb-toast-out {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(style);

// Global instance
window.DreamWebToast = new DreamWebToast();
