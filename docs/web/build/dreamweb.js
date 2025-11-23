// """
// JavaScript runtime for DreamWeb
// Handles rendering, state management, and event handling
// """

// Virtual DOM and rendering engine
class DreamWebRuntime {
    constructor(rootElement) {
        this.root = rootElement;
        this.componentTree = null;
        this.eventHandlers = new Map();
        this.stateValues = new Map();
        this.ws = null;
    }

    // Initialize the runtime
    init(componentTree) {
        this.componentTree = componentTree;
        this.render();
        // Hot reload disabled in production
    }

    // Render the component tree
    render() {
        this.root.innerHTML = '';
        const element = this.createElement(this.componentTree);
        this.root.appendChild(element);
    }

    // Create DOM element from component
    createElement(component) {
        if (!component) return document.createTextNode('');

        // Handle text nodes
        if (component.type === 'TextNode') {
            return document.createTextNode(component.text);
        }

        let element;

        // Create element based on type
        switch (component.type) {
            case 'Container':
            case 'Row':
            case 'Column':
            case 'Center':
            case 'Stack':
            case 'Spacer':
                element = document.createElement('div');
                if (component.type === 'Container') this.applyContainerStyles(element, component.props);
                else if (component.type === 'Row') this.applyRowStyles(element, component.props);
                else if (component.type === 'Column') this.applyColumnStyles(element, component.props);
                else if (component.type === 'Center') {
                    element.style.display = 'flex';
                    element.style.alignItems = 'center';
                    element.style.justifyContent = 'center';
                    element.style.width = '100%';
                    element.style.height = '100%';
                }
                else if (component.type === 'Stack') {
                    element.style.position = 'relative';
                    element.style.width = '100%';
                    element.style.height = '100%';
                }
                else if (component.type === 'Spacer') {
                    element.style.flex = component.props.size ? `0 0 ${component.props.size}px` : '1';
                }
                break;

            case 'Text':
                element = document.createElement('span');
                this.applyTextStyles(element, component.props);
                element.textContent = component.props.text;
                break;

            case 'Heading':
                element = document.createElement(`h${component.props.level || 1}`);
                this.applyTextStyles(element, component.props);
                element.textContent = component.props.text;
                break;

            case 'Button':
                element = this.createButton(component);
                break;

            case 'TextField':
                element = this.createTextField(component);
                break;

            case 'Checkbox':
                element = this.createCheckbox(component);
                break;

            case 'Image':
                element = this.createImage(component);
                break;

            case 'Link':
                element = this.createLink(component);
                break;

            case 'Html':
                element = document.createElement('div');
                element.innerHTML = component.props.html;
                break;

            case 'Css':
                element = document.createElement('style');
                element.textContent = component.props.css;
                break;

            case 'ApiRequest':
            case 'FetchData':
                // API widgets don't render visible elements
                element = document.createElement('div');
                element.style.display = 'none';
                // Trigger the API request
                this.handleApiRequest(component);
                break;

            default:
                console.warn(`Unknown component type: ${component.type}`);
                element = document.createElement('div');
        }

        // Render children
        if (component.children && component.children.length > 0) {
            // Some components might handle children internally or not support them
            // For now, we append children to all container-like elements
            // Button, Input etc usually don't have children in this model
            if (!['Button', 'TextField', 'Checkbox', 'Image', 'Css'].includes(component.type)) {
                component.children.forEach(child => {
                    const childElement = this.createElement(child);
                    element.appendChild(childElement);
                });
            }
        }

        // Attach event handlers
        if (component.events) {
            this.attachEvents(element, component.events);
        }

        return element;
    }

    // Style application methods
    applyContainerStyles(element, props) {
        const styles = {
            display: 'flex',
            flexDirection: props.direction || 'column',
            alignItems: this.mapAlign(props.align),
            justifyContent: this.mapJustify(props.justify),
        };

        if (props.width) styles.width = this.parseSize(props.width);
        if (props.height) styles.height = this.parseSize(props.height);
        if (props.padding) styles.padding = this.parseSpacing(props.padding);
        if (props.margin) styles.margin = this.parseSpacing(props.margin);
        if (props.background) styles.background = this.parseColor(props.background);
        if (props.border) this.applyBorder(element, props.border);
        if (props.rounded) styles.borderRadius = this.parseRounded(props.rounded);
        if (props.shadow) styles.boxShadow = this.parseShadow(props.shadow);

        Object.assign(element.style, styles);
    }

    applyRowStyles(element, props) {
        const styles = {
            display: 'flex',
            flexDirection: 'row',
            alignItems: this.mapAlign(props.align),
            justifyContent: this.mapJustify(props.justify),
            gap: `${props.spacing || 0}px`,
            flexWrap: props.wrap ? 'wrap' : 'nowrap'
        };
        Object.assign(element.style, styles);
    }

    applyColumnStyles(element, props) {
        const styles = {
            display: 'flex',
            flexDirection: 'column',
            alignItems: this.mapAlign(props.align),
            justifyContent: this.mapJustify(props.justify),
            gap: `${props.spacing || 0}px`
        };
        Object.assign(element.style, styles);
    }

    applyTextStyles(element, props) {
        const styles = {};

        if (props.size) styles.fontSize = this.parseFontSize(props.size);
        if (props.weight) styles.fontWeight = this.parseFontWeight(props.weight);
        if (props.color) styles.color = this.parseColor(props.color);
        if (props.align) styles.textAlign = props.align;
        if (props.italic) styles.fontStyle = 'italic';
        if (props.underline) styles.textDecoration = 'underline';
        if (props.font) styles.fontFamily = props.font;

        Object.assign(element.style, styles);
    }

    // Widget creation methods
    createButton(component) {
        const button = document.createElement('button');
        button.textContent = component.props.text;

        const styles = {
            padding: this.parseButtonSize(component.props.size),
            fontSize: this.parseButtonFontSize(component.props.size),
            borderRadius: component.props.rounded ? '0.375rem' : '0',
            border: 'none',
            cursor: component.props.disabled ? 'not-allowed' : 'pointer',
            opacity: component.props.disabled ? '0.5' : '1',
            fontWeight: '500',
            transition: 'all 0.2s'
        };

        // Apply variant styles
        const colors = this.getButtonColors(component.props.color, component.props.variant);
        Object.assign(styles, colors);
        Object.assign(button.style, styles);

        // Hover effect
        if (!component.props.disabled) {
            button.addEventListener('mouseenter', () => {
                button.style.transform = 'translateY(-1px)';
                button.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
            });
            button.addEventListener('mouseleave', () => {
                button.style.transform = 'translateY(0)';
                button.style.boxShadow = 'none';
            });
        }

        return button;
    }

    createTextField(component) {
        const input = document.createElement('input');
        input.type = component.props.type || 'text';
        input.placeholder = component.props.placeholder || '';
        input.value = component.props.value || '';
        input.disabled = component.props.disabled || false;

        const styles = {
            padding: '0.5rem 0.75rem',
            fontSize: '1rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            outline: 'none',
            transition: 'all 0.2s'
        };
        Object.assign(input.style, styles);

        input.addEventListener('focus', () => {
            input.style.borderColor = '#3b82f6';
            input.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
        });
        input.addEventListener('blur', () => {
            input.style.borderColor = '#d1d5db';
            input.style.boxShadow = 'none';
        });

        return input;
    }

    createCheckbox(component) {
        const label = document.createElement('label');
        label.style.display = 'flex';
        label.style.alignItems = 'center';
        label.style.gap = '0.5rem';
        label.style.cursor = 'pointer';

        const input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = component.props.checked || false;
        input.disabled = component.props.disabled || false;

        const span = document.createElement('span');
        span.textContent = component.props.label || '';

        label.appendChild(input);
        label.appendChild(span);

        return label;
    }

    createImage(component) {
        const img = document.createElement('img');
        img.src = component.props.src;
        img.alt = component.props.alt || '';

        const styles = {};
        if (component.props.width) styles.width = this.parseSize(component.props.width);
        if (component.props.height) styles.height = this.parseSize(component.props.height);
        if (component.props.fit) styles.objectFit = component.props.fit;
        if (component.props.rounded) styles.borderRadius = this.parseRounded(component.props.rounded);

        Object.assign(img.style, styles);
        return img;
    }

    createLink(component) {
        const a = document.createElement('a');
        a.href = component.props.to;
        a.textContent = component.props.text;

        const styles = {
            color: this.parseColor(component.props.color),
            textDecoration: component.props.underline ? 'underline' : 'none'
        };
        Object.assign(a.style, styles);

        return a;
    }

    // Event handling
    attachEvents(element, events) {
        if (events.click) {
            element.addEventListener('click', () => {
                this.handleEvent('click', events.click);
            });
        }
        if (events.change) {
            element.addEventListener('change', (e) => {
                this.handleEvent('change', events.change, e.target.value);
            });
        }
    }

    handleEvent(eventType, handlerId, value) {
        // Send event to Python backend
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                type: 'event',
                event: eventType,
                handler: handlerId,
                value: value
            }));
        }
    }

    // Handle API requests
    async handleApiRequest(component) {
        const { url, method, headers, body, auto_fetch, credentials, callbacks } = component.props;

        // Only fetch if auto_fetch is true (default)
        if (auto_fetch === false) {
            return;
        }

        try {
            // Notify loading started
            if (callbacks && callbacks.on_loading) {
                this.handleEvent('api_loading', callbacks.on_loading, true);
            }

            // Prepare fetch options
            const fetchOptions = {
                method: (method || 'GET').toUpperCase(),
                headers: {
                    'Content-Type': 'application/json',
                    ...(headers || {})
                },
                credentials: credentials || 'same-origin'
            };

            // Add body if present (and not GET/HEAD)
            if (body && !['GET', 'HEAD'].includes(fetchOptions.method)) {
                if (typeof body === 'object') {
                    fetchOptions.body = JSON.stringify(body);
                } else {
                    fetchOptions.body = body;
                }
            }

            // Make the request
            const response = await fetch(url, fetchOptions);

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
            if (callbacks && callbacks.on_loading) {
                this.handleEvent('api_loading', callbacks.on_loading, false);
            }

            // Call success callback
            if (callbacks && callbacks.on_success) {
                this.handleEvent('api_success', callbacks.on_success, data);
            }

        } catch (error) {
            // Notify loading finished
            if (callbacks && callbacks.on_loading) {
                this.handleEvent('api_loading', callbacks.on_loading, false);
            }

            // Call error callback
            if (callbacks && callbacks.on_error) {
                this.handleEvent('api_error', callbacks.on_error, {
                    message: error.message,
                    name: error.name
                });
            }

            console.error('DreamWeb API Request Error:', error);
        }
    }

    // Utility methods for parsing styles
    parseSize(size) {
        if (typeof size === 'number') return `${size}px`;
        if (size === 'full') return '100%';
        if (size === 'auto') return 'auto';
        return size;
    }

    parseSpacing(spacing) {
        if (typeof spacing === 'number') return `${spacing}px`;
        if (typeof spacing === 'object') {
            const { top = 0, right = 0, bottom = 0, left = 0 } = spacing;
            return `${top}px ${right}px ${bottom}px ${left}px`;
        }
        return spacing;
    }

    parseColor(color) {
        // Named colors
        const colorMap = {
            'primary': '#3b82f6',
            'secondary': '#6b7280',
            'success': '#10b981',
            'danger': '#ef4444',
            'warning': '#f59e0b',
            'info': '#06b6d4',
            'black': '#000000',
            'white': '#ffffff',
            'gray': '#6b7280',
            'red': '#ef4444',
            'blue': '#3b82f6',
            'green': '#10b981',
            'yellow': '#f59e0b',
            'purple': '#8b5cf6',
            'pink': '#ec4899',
        };

        // Gradients
        if (color && color.startsWith('gradient-')) {
            const parts = color.replace('gradient-', '').split('-');
            if (parts.length === 2) {
                const from = colorMap[parts[0]] || parts[0];
                const to = colorMap[parts[1]] || parts[1];
                return `linear-gradient(135deg, ${from}, ${to})`;
            }
        }

        return colorMap[color] || color;
    }

    parseFontSize(size) {
        const sizeMap = {
            'xs': '0.75rem',
            'sm': '0.875rem',
            'md': '1rem',
            'lg': '1.125rem',
            'xl': '1.25rem',
            '2xl': '1.5rem',
            '3xl': '1.875rem',
            '4xl': '2.25rem',
        };
        return sizeMap[size] || (typeof size === 'number' ? `${size}px` : size);
    }

    parseFontWeight(weight) {
        const weightMap = {
            'normal': '400',
            'medium': '500',
            'semibold': '600',
            'bold': '700',
        };
        return weightMap[weight] || weight;
    }

    parseRounded(rounded) {
        if (typeof rounded === 'boolean') return rounded ? '0.375rem' : '0';
        if (typeof rounded === 'number') return `${rounded}px`;
        return rounded;
    }

    parseShadow(shadow) {
        const shadowMap = {
            'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            'none': 'none'
        };
        return shadowMap[shadow] || shadow;
    }

    parseButtonSize(size) {
        const sizeMap = {
            'sm': '0.5rem 1rem',
            'md': '0.625rem 1.25rem',
            'lg': '0.75rem 1.5rem',
            'xl': '1rem 2rem',
        };
        return sizeMap[size] || sizeMap['md'];
    }

    parseButtonFontSize(size) {
        const sizeMap = {
            'sm': '0.875rem',
            'md': '1rem',
            'lg': '1.125rem',
            'xl': '1.25rem',
        };
        return sizeMap[size] || sizeMap['md'];
    }

    getButtonColors(color, variant) {
        const baseColor = this.parseColor(color);

        if (variant === 'outline') {
            return {
                background: 'transparent',
                color: baseColor,
                border: `2px solid ${baseColor}`
            };
        } else if (variant === 'ghost') {
            return {
                background: 'transparent',
                color: baseColor,
                border: 'none'
            };
        } else if (variant === 'link') {
            return {
                background: 'transparent',
                color: baseColor,
                border: 'none',
                textDecoration: 'underline'
            };
        } else {
            // solid
            return {
                background: baseColor,
                color: '#ffffff',
                border: 'none'
            };
        }
    }

    applyBorder(element, border) {
        if (typeof border === 'number') {
            element.style.border = `${border}px solid #d1d5db`;
        } else if (typeof border === 'object') {
            const width = border.width || 1;
            const color = border.color || '#d1d5db';
            const style = border.style || 'solid';
            element.style.border = `${width}px ${style} ${color}`;
        }
    }

    mapAlign(align) {
        const map = {
            'start': 'flex-start',
            'center': 'center',
            'end': 'flex-end',
            'stretch': 'stretch'
        };
        return map[align] || 'stretch';
    }

    mapJustify(justify) {
        const map = {
            'start': 'flex-start',
            'center': 'center',
            'end': 'flex-end',
            'between': 'space-between',
            'around': 'space-around'
        };
        return map[justify] || 'flex-start';
    }

    // Hot reload support
    setupHotReload() {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            // Connect to WebSocket server (running on port + 1)
            const wsPort = parseInt(window.location.port) + 1;
            this.ws = new WebSocket(`ws://${window.location.hostname}:${wsPort}`);

            this.ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === 'reload') {
                    this.componentTree = data.tree;
                    this.render();
                    console.log('🔄 Hot reload applied');
                }
            };

            this.ws.onclose = () => {
                console.log('🔌 Dev server disconnected');
                setTimeout(() => this.setupHotReload(), 1000);
            };
        }
    }
}

// Initialize when DOM is ready
if (typeof window !== 'undefined') {
    window.DreamWebRuntime = DreamWebRuntime;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DreamWebRuntime;
}


// Initialize app
(function() {
    const componentTree = {"type": "Container", "props": {"width": "100%", "height": "auto", "padding": 0, "margin": 0, "background": null, "border": null, "rounded": false, "shadow": null, "align": "stretch", "justify": "start", "direction": "column", "style": "min-height: 100vh; font-family: 'Inter', sans-serif;"}, "children": [{"type": "Css", "props": {"css": "\n                    * {\n                        margin: 0;\n                        padding: 0;\n                        box-sizing: border-box;\n                    }\n                    \n                    body {\n                        background: #0f172a;\n                        color: #cbd5e1;\n                        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;\n                    }\n                    \n                    a {\n                        color: #3b82f6;\n                        text-decoration: none;\n                    }\n                    \n                    a:hover {\n                        text-decoration: underline;\n                    }\n                    \n                    code {\n                        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;\n                    }\n                    \n                    /* Smooth scrolling */\n                    html {\n                        scroll-behavior: smooth;\n                    }\n                    \n                    /* Page sections - hide all by default */\n                    .page-section {\n                        display: none;\n                    }\n                    \n                    .page-section.active {\n                        display: block;\n                    }\n                    \n                    /* Navigation active state */\n                    .nav-link {\n                        margin: 0 5px;\n                        padding: 10px 15px;\n                        border-bottom: 2px solid transparent;\n                        border-radius: 0;\n                        cursor: pointer;\n                        background: transparent;\n                        color: #cbd5e1;\n                        border: none;\n                        font-size: 1rem;\n                        font-weight: normal;\n                        transition: all 0.2s;\n                    }\n                    \n                    .nav-link:hover {\n                        color: white;\n                    }\n                    \n                    .nav-link.active {\n                        color: white;\n                        font-weight: bold;\n                        border-bottom-color: #3b82f6;\n                    }\n                "}}, {"type": "Html", "props": {"html": "\n                    <script>\n                        // Client-side navigation for static build\n                        function navigateTo(pageId) {\n                            // Hide all pages\n                            document.querySelectorAll('.page-section').forEach(page => {\n                                page.classList.remove('active');\n                            });\n                            \n                            // Show selected page\n                            const targetPage = document.getElementById('page-' + pageId);\n                            if (targetPage) {\n                                targetPage.classList.add('active');\n                            }\n                            \n                            // Update nav links\n                            document.querySelectorAll('.nav-link').forEach(link => {\n                                link.classList.remove('active');\n                            });\n                            const activeLink = document.querySelector('[data-page=\"' + pageId + '\"]');\n                            if (activeLink) {\n                                activeLink.classList.add('active');\n                            }\n                            \n                            // Scroll to top\n                            window.scrollTo(0, 0);\n                        }\n                        \n                        // Initialize on page load\n                        document.addEventListener('DOMContentLoaded', function() {\n                            // Show home page by default\n                            navigateTo('home');\n                            \n                            // Add click handlers to nav links\n                            document.querySelectorAll('.nav-link').forEach(link => {\n                                link.addEventListener('click', function() {\n                                    const pageId = this.getAttribute('data-page');\n                                    navigateTo(pageId);\n                                });\n                            });\n                        });\n                    </script>\n                "}}, {"type": "Container", "props": {"width": "100%", "height": "auto", "padding": {"top": 0, "right": 0, "bottom": 0, "left": 0}, "margin": 0, "background": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", "border": null, "rounded": false, "shadow": "md", "align": "stretch", "justify": "start", "direction": "column", "style": "position: sticky; top: 0; z-index: 1000;"}, "children": [{"type": "Container", "props": {"width": "100%", "height": "auto", "padding": 20, "margin": 0, "background": null, "border": null, "rounded": false, "shadow": null, "align": "stretch", "justify": "start", "direction": "column"}, "children": [{"type": "Row", "props": {"spacing": 0, "align": "center", "justify": "between", "wrap": false}, "children": [{"type": "Row", "props": {"spacing": 10, "align": "center", "justify": "start", "wrap": false}, "children": [{"type": "Text", "props": {"text": "\ud83d\ude80", "size": "2xl", "weight": "normal", "color": "black", "align": "left", "italic": false, "underline": false, "font": null}}, {"type": "Text", "props": {"text": "DreamWeb", "size": "2xl", "weight": "bold", "color": "white", "align": "left", "italic": false, "underline": false, "font": null}}, {"type": "Text", "props": {"text": "v0.1.1", "size": "sm", "weight": "normal", "color": "#cbd5e1", "align": "left", "italic": false, "underline": false, "font": null, "style": "opacity: 0.8;"}}]}, {"type": "Html", "props": {"html": "\n                                            <div style=\"display: flex; gap: 5px; flex-wrap: wrap;\">\n                                                <button class=\"nav-link\" data-page=\"home\">Home</button>\n                                                <button class=\"nav-link\" data-page=\"getting_started\">Getting Started</button>\n                                                <button class=\"nav-link\" data-page=\"widgets\">Widgets</button>\n                                            </div>\n                                        "}}]}]}]}, {"type": "Html", "props": {"html": "<div id=\"page-home\" class=\"page-section\">"}}, {"type": "Container", "props": {"width": "100%", "height": "auto", "padding": 0, "margin": 0, "background": null, "border": null, "rounded": false, "shadow": null, "align": "stretch", "justify": "start", "direction": "column"}, "children": [{"type": "Container", "props": {"width": "100%", "height": "auto", "padding": {"top": 80, "right": 40, "bottom": 80, "left": 40}, "margin": 0, "background": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", "border": null, "rounded": false, "shadow": null, "align": "stretch", "justify": "start", "direction": "column"}, "children": [{"type": "Column", "props": {"spacing": 30, "align": "center", "justify": "start"}, "children": [{"type": "Text", "props": {"text": "\ud83d\ude80", "size": "4xl", "weight": "normal", "color": "black", "align": "left", "italic": false, "underline": false, "font": null}}, {"type": "Heading", "props": {"text": "DreamWeb", "level": 1, "color": "white", "weight": "bold", "style": "font-size: 4rem; margin: 0;"}}, {"type": "Text", "props": {"text": "A Flutter-like Python Web Framework", "size": "2xl", "weight": "normal", "color": "#e2e8f0", "align": "center", "italic": false, "underline": false, "font": null}}, {"type": "Text", "props": {"text": "Build beautiful web UIs using pure Python. No HTML, CSS, or JavaScript required!", "size": "lg", "weight": "normal", "color": "#cbd5e1", "align": "center", "italic": false, "underline": false, "font": null, "style": "max-width: 600px; margin: 0 auto;"}}, {"type": "Row", "props": {"spacing": 15, "align": "start", "justify": "center", "wrap": false, "style": "margin-top: 20px;"}, "children": [{"type": "Button", "props": {"text": "Get Started \u2192", "color": "white", "size": "xl", "variant": "solid", "rounded": true, "icon": null, "disabled": false, "style": "background: #3b82f6; color: white; padding: 15px 30px; font-size: 1.1rem;"}}, {"type": "Button", "props": {"text": "View on GitHub", "color": "white", "size": "xl", "variant": "outline", "rounded": true, "icon": null, "disabled": false, "style": "border: 2px solid white; color: white; padding: 15px 30px; font-size: 1.1rem;"}}]}]}]}, {"type": "Container", "props": {"width": "100%", "height": "auto", "padding": 60, "margin": 0, "background": "#0f172a", "border": null, "rounded": false, "shadow": null, "align": "stretch", "justify": "start", "direction": "column"}, "children": [{"type": "Container", "props": {"width": "auto", "height": "auto", "padding": 0, "margin": 0, "background": null, "border": null, "rounded": false, "shadow": null, "align": "stretch", "justify": "start", "direction": "column", "style": "max-width: 1200px; margin: 0 auto;"}, "children": [{"type": "Heading", "props": {"text": "\u2728 Features", "level": 2, "color": "white", "weight": "bold", "style": "text-align: center; margin-bottom: 40px;"}}, {"type": "Container", "props": {"width": "auto", "height": "auto", "padding": 0, "margin": 0, "background": null, "border": null, "rounded": false, "shadow": null, "align": "stretch", "justify": "start", "direction": "column", "style": "display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px;"}, "children": [{"type": "Container", "props": {"width": "auto", "height": "auto", "padding": 30, "margin": 0, "background": "#1e293b", "border": null, "rounded": 12, "shadow": null, "align": "stretch", "justify": "start", "direction": "column"}, "children": [{"type": "Column", "props": {"spacing": 10, "align": "start", "justify": "start"}, "children": [{"type": "Text", "props": {"text": "\ud83c\udfa8", "size": "3xl", "weight": "normal", "color": "black", "align": "left", "italic": false, "underline": false, "font": null}}, {"type": "Heading", "props": {"text": "Flutter-Style Widgets", "level": 3, "color": "white", "weight": "bold"}}, {"type": "Text", "props": {"text": "Familiar API with Container, Row, Column, Text, Button, and more.", "size": "md", "weight": "normal", "color": "#94a3b8", "align": "left", "italic": false, "underline": false, "font": null}}]}]}, {"type": "Container", "props": {"width": "auto", "height": "auto", "padding": 30, "margin": 0, "background": "#1e293b", "border": null, "rounded": 12, "shadow": null, "align": "stretch", "justify": "start", "direction": "column"}, "children": [{"type": "Column", "props": {"spacing": 10, "align": "start", "justify": "start"}, "children": [{"type": "Text", "props": {"text": "\u26a1", "size": "3xl", "weight": "normal", "color": "black", "align": "left", "italic": false, "underline": false, "font": null}}, {"type": "Heading", "props": {"text": "Hot Reload", "level": 3, "color": "white", "weight": "bold"}}, {"type": "Text", "props": {"text": "See changes instantly in development mode with automatic reloading.", "size": "md", "weight": "normal", "color": "#94a3b8", "align": "left", "italic": false, "underline": false, "font": null}}]}]}, {"type": "Container", "props": {"width": "auto", "height": "auto", "padding": 30, "margin": 0, "background": "#1e293b", "border": null, "rounded": 12, "shadow": null, "align": "stretch", "justify": "start", "direction": "column"}, "children": [{"type": "Column", "props": {"spacing": 10, "align": "start", "justify": "start"}, "children": [{"type": "Text", "props": {"text": "\ud83d\udd04", "size": "3xl", "weight": "normal", "color": "black", "align": "left", "italic": false, "underline": false, "font": null}}, {"type": "Heading", "props": {"text": "Reactive State", "level": 3, "color": "white", "weight": "bold"}}, {"type": "Text", "props": {"text": "Built-in state management with automatic re-rendering on changes.", "size": "md", "weight": "normal", "color": "#94a3b8", "align": "left", "italic": false, "underline": false, "font": null}}]}]}, {"type": "Container", "props": {"width": "auto", "height": "auto", "padding": 30, "margin": 0, "background": "#1e293b", "border": null, "rounded": 12, "shadow": null, "align": "stretch", "justify": "start", "direction": "column"}, "children": [{"type": "Column", "props": {"spacing": 10, "align": "start", "justify": "start"}, "children": [{"type": "Text", "props": {"text": "\ud83c\udf10", "size": "3xl", "weight": "normal", "color": "black", "align": "left", "italic": false, "underline": false, "font": null}}, {"type": "Heading", "props": {"text": "API Requests", "level": 3, "color": "white", "weight": "bold"}}, {"type": "Text", "props": {"text": "Built-in widgets for making HTTP requests to external APIs.", "size": "md", "weight": "normal", "color": "#94a3b8", "align": "left", "italic": false, "underline": false, "font": null}}]}]}, {"type": "Container", "props": {"width": "auto", "height": "auto", "padding": 30, "margin": 0, "background": "#1e293b", "border": null, "rounded": 12, "shadow": null, "align": "stretch", "justify": "start", "direction": "column"}, "children": [{"type": "Column", "props": {"spacing": 10, "align": "start", "justify": "start"}, "children": [{"type": "Text", "props": {"text": "\ud83d\udce6", "size": "3xl", "weight": "normal", "color": "black", "align": "left", "italic": false, "underline": false, "font": null}}, {"type": "Heading", "props": {"text": "Single Build Output", "level": 3, "color": "white", "weight": "bold"}}, {"type": "Text", "props": {"text": "Compiles to just index.html and dreamweb.js for easy deployment.", "size": "md", "weight": "normal", "color": "#94a3b8", "align": "left", "italic": false, "underline": false, "font": null}}]}]}, {"type": "Container", "props": {"width": "auto", "height": "auto", "padding": 30, "margin": 0, "background": "#1e293b", "border": null, "rounded": 12, "shadow": null, "align": "stretch", "justify": "start", "direction": "column"}, "children": [{"type": "Column", "props": {"spacing": 10, "align": "start", "justify": "start"}, "children": [{"type": "Text", "props": {"text": "\ud83c\udfaf", "size": "3xl", "weight": "normal", "color": "black", "align": "left", "italic": false, "underline": false, "font": null}}, {"type": "Heading", "props": {"text": "Pure Python", "level": 3, "color": "white", "weight": "bold"}}, {"type": "Text", "props": {"text": "No need to learn HTML, CSS, or JavaScript. Just write Python!", "size": "md", "weight": "normal", "color": "#94a3b8", "align": "left", "italic": false, "underline": false, "font": null}}]}]}]}]}]}, {"type": "Container", "props": {"width": "100%", "height": "auto", "padding": 60, "margin": 0, "background": "#1e293b", "border": null, "rounded": false, "shadow": null, "align": "stretch", "justify": "start", "direction": "column"}, "children": [{"type": "Container", "props": {"width": "auto", "height": "auto", "padding": 0, "margin": 0, "background": null, "border": null, "rounded": false, "shadow": null, "align": "stretch", "justify": "start", "direction": "column", "style": "max-width: 900px; margin: 0 auto;"}, "children": [{"type": "Column", "props": {"spacing": 30, "align": "start", "justify": "start"}, "children": [{"type": "Heading", "props": {"text": "\ud83d\ude80 Quick Start", "level": 2, "color": "white", "weight": "bold", "style": "text-align: center;"}}, {"type": "Text", "props": {"text": "Get started with DreamWeb in just a few lines of code:", "size": "lg", "weight": "normal", "color": "#cbd5e1", "align": "center", "italic": false, "underline": false, "font": null}}, {"type": "Container", "props": {"width": "100%", "height": "auto", "padding": 20, "margin": 0, "background": "#1e293b", "border": null, "rounded": 8, "shadow": null, "align": "stretch", "justify": "start", "direction": "column", "style": "margin: 20px 0; overflow-x: auto; position: relative;"}, "children": [{"type": "Container", "props": {"width": "auto", "height": "auto", "padding": {"top": 4, "right": 12, "bottom": 4, "left": 12}, "margin": 0, "background": "#334155", "border": null, "rounded": 4, "shadow": null, "align": "stretch", "justify": "start", "direction": "column", "style": "position: absolute; top: 10px; right: 10px;"}, "children": [{"type": "Text", "props": {"text": "python", "size": "xs", "weight": "medium", "color": "#94a3b8", "align": "left", "italic": false, "underline": false, "font": null}}]}, {"type": "Html", "props": {"html": "\n                <pre style=\"margin: 0; padding: 0; overflow-x: auto;\">\n                    <code style=\"\n                        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;\n                        font-size: 0.9rem;\n                        line-height: 1.6;\n                        color: #e2e8f0;\n                        white-space: pre;\n                    \">from dreamweb import App\nfrom dreamweb.common import *\n\nclass CounterApp(App):\n    def __init__(self):\n        super().__init__()\n        self.count = State(0)\n    \n    def build(self):\n        return Container(\n            width=\"100%\",\n            height=\"100vh\",\n            background=\"gradient-purple-pink\",\n            align=\"center\",\n            justify=\"center\",\n            children=[\n                Text(f\"Count: {self.count.value}\", size=\"2xl\"),\n                Button(\n                    text=\"Increment\",\n                    on_click=lambda: self.count.set(self.count.value + 1)\n                )\n            ]\n        )\n\nif __name__ == \"__main__\":\n    CounterApp().run(dev=True)</code>\n                </pre>\n            "}}]}, {"type": "Text", "props": {"text": "Run your app with:", "size": "lg", "weight": "normal", "color": "#cbd5e1", "align": "center", "italic": false, "underline": false, "font": null}}, {"type": "Container", "props": {"width": "100%", "height": "auto", "padding": 20, "margin": 0, "background": "#1e293b", "border": null, "rounded": 8, "shadow": null, "align": "stretch", "justify": "start", "direction": "column", "style": "margin: 20px 0; overflow-x: auto; position: relative;"}, "children": [{"type": "Container", "props": {"width": "auto", "height": "auto", "padding": {"top": 4, "right": 12, "bottom": 4, "left": 12}, "margin": 0, "background": "#334155", "border": null, "rounded": 4, "shadow": null, "align": "stretch", "justify": "start", "direction": "column", "style": "position: absolute; top: 10px; right: 10px;"}, "children": [{"type": "Text", "props": {"text": "bash", "size": "xs", "weight": "medium", "color": "#94a3b8", "align": "left", "italic": false, "underline": false, "font": null}}]}, {"type": "Html", "props": {"html": "\n                <pre style=\"margin: 0; padding: 0; overflow-x: auto;\">\n                    <code style=\"\n                        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;\n                        font-size: 0.9rem;\n                        line-height: 1.6;\n                        color: #e2e8f0;\n                        white-space: pre;\n                    \">python app.py</code>\n                </pre>\n            "}}]}, {"type": "Text", "props": {"text": "Visit http://localhost:8000 to see your app! \ud83c\udf89", "size": "xl", "weight": "bold", "color": "#3b82f6", "align": "center", "italic": false, "underline": false, "font": null}}]}]}]}]}, {"type": "Html", "props": {"html": "</div>"}}, {"type": "Html", "props": {"html": "<div id=\"page-getting_started\" class=\"page-section\">"}}, {"type": "Container", "props": {"width": "100%", "height": "auto", "padding": 40, "margin": 0, "background": "#0f172a", "border": null, "rounded": false, "shadow": null, "align": "stretch", "justify": "start", "direction": "column"}, "children": [{"type": "Container", "props": {"width": "auto", "height": "auto", "padding": 0, "margin": 0, "background": null, "border": null, "rounded": false, "shadow": null, "align": "stretch", "justify": "start", "direction": "column", "style": "max-width: 900px; margin: 0 auto;"}, "children": [{"type": "Column", "props": {"spacing": 40, "align": "start", "justify": "start"}, "children": [{"type": "Column", "props": {"spacing": 15, "align": "start", "justify": "start"}, "children": [{"type": "Heading", "props": {"text": "\ud83d\ude80 Getting Started", "level": 1, "color": "white", "weight": "bold"}}, {"type": "Text", "props": {"text": "Get up and running with DreamWeb in minutes", "size": "xl", "weight": "normal", "color": "#94a3b8", "align": "left", "italic": false, "underline": false, "font": null}}]}, {"type": "Column", "props": {"spacing": 20, "align": "start", "justify": "start"}, "children": [{"type": "Heading", "props": {"text": "Installation", "level": 2, "color": "white", "weight": "bold"}}, {"type": "Text", "props": {"text": "Install DreamWeb using pip:", "size": "lg", "weight": "normal", "color": "#cbd5e1", "align": "left", "italic": false, "underline": false, "font": null}}, {"type": "Container", "props": {"width": "100%", "height": "auto", "padding": 20, "margin": 0, "background": "#1e293b", "border": null, "rounded": 8, "shadow": null, "align": "stretch", "justify": "start", "direction": "column", "style": "margin: 20px 0; overflow-x: auto; position: relative;"}, "children": [{"type": "Container", "props": {"width": "auto", "height": "auto", "padding": {"top": 4, "right": 12, "bottom": 4, "left": 12}, "margin": 0, "background": "#334155", "border": null, "rounded": 4, "shadow": null, "align": "stretch", "justify": "start", "direction": "column", "style": "position: absolute; top: 10px; right: 10px;"}, "children": [{"type": "Text", "props": {"text": "bash", "size": "xs", "weight": "medium", "color": "#94a3b8", "align": "left", "italic": false, "underline": false, "font": null}}]}, {"type": "Html", "props": {"html": "\n                <pre style=\"margin: 0; padding: 0; overflow-x: auto;\">\n                    <code style=\"\n                        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;\n                        font-size: 0.9rem;\n                        line-height: 1.6;\n                        color: #e2e8f0;\n                        white-space: pre;\n                    \">pip install dreamweb</code>\n                </pre>\n            "}}]}]}, {"type": "Column", "props": {"spacing": 20, "align": "start", "justify": "start"}, "children": [{"type": "Heading", "props": {"text": "Create Your First App", "level": 2, "color": "white", "weight": "bold"}}, {"type": "Text", "props": {"text": "Create a new file called app.py:", "size": "lg", "weight": "normal", "color": "#cbd5e1", "align": "left", "italic": false, "underline": false, "font": null}}, {"type": "Container", "props": {"width": "100%", "height": "auto", "padding": 20, "margin": 0, "background": "#1e293b", "border": null, "rounded": 8, "shadow": null, "align": "stretch", "justify": "start", "direction": "column", "style": "margin: 20px 0; overflow-x: auto; position: relative;"}, "children": [{"type": "Container", "props": {"width": "auto", "height": "auto", "padding": {"top": 4, "right": 12, "bottom": 4, "left": 12}, "margin": 0, "background": "#334155", "border": null, "rounded": 4, "shadow": null, "align": "stretch", "justify": "start", "direction": "column", "style": "position: absolute; top: 10px; right: 10px;"}, "children": [{"type": "Text", "props": {"text": "python", "size": "xs", "weight": "medium", "color": "#94a3b8", "align": "left", "italic": false, "underline": false, "font": null}}]}, {"type": "Html", "props": {"html": "\n                <pre style=\"margin: 0; padding: 0; overflow-x: auto;\">\n                    <code style=\"\n                        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;\n                        font-size: 0.9rem;\n                        line-height: 1.6;\n                        color: #e2e8f0;\n                        white-space: pre;\n                    \">from dreamweb import App\nfrom dreamweb.common import *\n\nclass HelloApp(App):\n    def __init__(self):\n        super().__init__(title=\"Hello DreamWeb\")\n    \n    def build(self):\n        return Container(\n            width=\"100%\",\n            height=\"100vh\",\n            background=\"gradient-purple-pink\",\n            align=\"center\",\n            justify=\"center\",\n            children=[\n                Text(\n                    \"Hello, DreamWeb! \ud83d\udc4b\",\n                    size=\"4xl\",\n                    weight=\"bold\",\n                    color=\"white\"\n                )\n            ]\n        )\n\nif __name__ == \"__main__\":\n    HelloApp().run(dev=True)</code>\n                </pre>\n            "}}]}, {"type": "Text", "props": {"text": "This creates a simple app with a centered greeting message on a gradient background.", "size": "md", "weight": "normal", "color": "#94a3b8", "align": "left", "italic": false, "underline": false, "font": null}}]}, {"type": "Column", "props": {"spacing": 20, "align": "start", "justify": "start"}, "children": [{"type": "Heading", "props": {"text": "Run the Development Server", "level": 2, "color": "white", "weight": "bold"}}, {"type": "Text", "props": {"text": "Start the development server with hot reload:", "size": "lg", "weight": "normal", "color": "#cbd5e1", "align": "left", "italic": false, "underline": false, "font": null}}, {"type": "Container", "props": {"width": "100%", "height": "auto", "padding": 20, "margin": 0, "background": "#1e293b", "border": null, "rounded": 8, "shadow": null, "align": "stretch", "justify": "start", "direction": "column", "style": "margin: 20px 0; overflow-x: auto; position: relative;"}, "children": [{"type": "Container", "props": {"width": "auto", "height": "auto", "padding": {"top": 4, "right": 12, "bottom": 4, "left": 12}, "margin": 0, "background": "#334155", "border": null, "rounded": 4, "shadow": null, "align": "stretch", "justify": "start", "direction": "column", "style": "position: absolute; top: 10px; right: 10px;"}, "children": [{"type": "Text", "props": {"text": "bash", "size": "xs", "weight": "medium", "color": "#94a3b8", "align": "left", "italic": false, "underline": false, "font": null}}]}, {"type": "Html", "props": {"html": "\n                <pre style=\"margin: 0; padding: 0; overflow-x: auto;\">\n                    <code style=\"\n                        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;\n                        font-size: 0.9rem;\n                        line-height: 1.6;\n                        color: #e2e8f0;\n                        white-space: pre;\n                    \">python app.py</code>\n                </pre>\n            "}}]}, {"type": "Text", "props": {"text": "Visit http://localhost:8000 in your browser to see your app! \ud83c\udf89", "size": "lg", "weight": "bold", "color": "#3b82f6", "align": "left", "italic": false, "underline": false, "font": null}}, {"type": "Container", "props": {"width": "auto", "height": "auto", "padding": 20, "margin": 0, "background": "#1e293b", "border": null, "rounded": 8, "shadow": null, "align": "stretch", "justify": "start", "direction": "column"}, "children": [{"type": "Column", "props": {"spacing": 10, "align": "start", "justify": "start"}, "children": [{"type": "Text", "props": {"text": "\ud83d\udca1 Hot Reload", "size": "lg", "weight": "bold", "color": "#3b82f6", "align": "left", "italic": false, "underline": false, "font": null}}, {"type": "Text", "props": {"text": "The dev server watches for file changes and automatically reloads your app. Try editing the text and save the file to see it update instantly!", "size": "md", "weight": "normal", "color": "#cbd5e1", "align": "left", "italic": false, "underline": false, "font": null}}]}]}]}, {"type": "Column", "props": {"spacing": 20, "align": "start", "justify": "start"}, "children": [{"type": "Heading", "props": {"text": "Build for Production", "level": 2, "color": "white", "weight": "bold"}}, {"type": "Text", "props": {"text": "When you're ready to deploy, change dev=True to dev=False:", "size": "lg", "weight": "normal", "color": "#cbd5e1", "align": "left", "italic": false, "underline": false, "font": null}}, {"type": "Container", "props": {"width": "100%", "height": "auto", "padding": 20, "margin": 0, "background": "#1e293b", "border": null, "rounded": 8, "shadow": null, "align": "stretch", "justify": "start", "direction": "column", "style": "margin: 20px 0; overflow-x: auto; position: relative;"}, "children": [{"type": "Container", "props": {"width": "auto", "height": "auto", "padding": {"top": 4, "right": 12, "bottom": 4, "left": 12}, "margin": 0, "background": "#334155", "border": null, "rounded": 4, "shadow": null, "align": "stretch", "justify": "start", "direction": "column", "style": "position: absolute; top: 10px; right: 10px;"}, "children": [{"type": "Text", "props": {"text": "python", "size": "xs", "weight": "medium", "color": "#94a3b8", "align": "left", "italic": false, "underline": false, "font": null}}]}, {"type": "Html", "props": {"html": "\n                <pre style=\"margin: 0; padding: 0; overflow-x: auto;\">\n                    <code style=\"\n                        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;\n                        font-size: 0.9rem;\n                        line-height: 1.6;\n                        color: #e2e8f0;\n                        white-space: pre;\n                    \"># Build for production\nif __name__ == \"__main__\":\n    HelloApp().run(dev=False)</code>\n                </pre>\n            "}}]}, {"type": "Text", "props": {"text": "This creates a build/ directory with optimized index.html and dreamweb.js files ready for deployment.", "size": "md", "weight": "normal", "color": "#94a3b8", "align": "left", "italic": false, "underline": false, "font": null}}]}, {"type": "Container", "props": {"width": "auto", "height": "auto", "padding": 30, "margin": 0, "background": "#1e293b", "border": null, "rounded": 12, "shadow": null, "align": "stretch", "justify": "start", "direction": "column"}, "children": [{"type": "Column", "props": {"spacing": 20, "align": "start", "justify": "start"}, "children": [{"type": "Heading", "props": {"text": "\ud83c\udfaf Next Steps", "level": 2, "color": "white", "weight": "bold"}}, {"type": "Column", "props": {"spacing": 10, "align": "start", "justify": "start"}, "children": [{"type": "Text", "props": {"text": "\u2192 Learn about Core Concepts", "size": "lg", "weight": "normal", "color": "#3b82f6", "align": "left", "italic": false, "underline": false, "font": null}}, {"type": "Text", "props": {"text": "\u2192 Explore the Widget Library", "size": "lg", "weight": "normal", "color": "#3b82f6", "align": "left", "italic": false, "underline": false, "font": null}}, {"type": "Text", "props": {"text": "\u2192 Check out Examples", "size": "lg", "weight": "normal", "color": "#3b82f6", "align": "left", "italic": false, "underline": false, "font": null}}, {"type": "Text", "props": {"text": "\u2192 Read the API Reference", "size": "lg", "weight": "normal", "color": "#3b82f6", "align": "left", "italic": false, "underline": false, "font": null}}]}]}]}]}]}]}, {"type": "Html", "props": {"html": "</div>"}}, {"type": "Html", "props": {"html": "<div id=\"page-widgets\" class=\"page-section\">"}}, {"type": "Container", "props": {"width": "100%", "height": "auto", "padding": 40, "margin": 0, "background": "#0f172a", "border": null, "rounded": false, "shadow": null, "align": "stretch", "justify": "start", "direction": "column"}, "children": [{"type": "Container", "props": {"width": "auto", "height": "auto", "padding": 0, "margin": 0, "background": null, "border": null, "rounded": false, "shadow": null, "align": "stretch", "justify": "start", "direction": "column", "style": "max-width: 1000px; margin: 0 auto;"}, "children": [{"type": "Column", "props": {"spacing": 40, "align": "start", "justify": "start"}, "children": [{"type": "Column", "props": {"spacing": 15, "align": "start", "justify": "start"}, "children": [{"type": "Heading", "props": {"text": "\ud83c\udfa8 Widget Library", "level": 1, "color": "white", "weight": "bold"}}, {"type": "Text", "props": {"text": "Complete reference of all available widgets", "size": "xl", "weight": "normal", "color": "#94a3b8", "align": "left", "italic": false, "underline": false, "font": null}}]}, {"type": "Column", "props": {"spacing": 20, "align": "start", "justify": "start"}, "children": [{"type": "Heading", "props": {"text": "Layout Widgets", "level": 2, "color": "white", "weight": "bold"}}, {"type": "Column", "props": {"spacing": 15, "align": "start", "justify": "start"}, "children": [{"type": "Container", "props": {"width": "auto", "height": "auto", "padding": 20, "margin": 0, "background": "#1e293b", "border": null, "rounded": 8, "shadow": null, "align": "stretch", "justify": "start", "direction": "column"}, "children": [{"type": "Column", "props": {"spacing": 10, "align": "start", "justify": "start"}, "children": [{"type": "Heading", "props": {"text": "Container", "level": 3, "color": "#3b82f6", "weight": "bold"}}, {"type": "Text", "props": {"text": "A flexible box container", "size": "md", "weight": "normal", "color": "#cbd5e1", "align": "left", "italic": false, "underline": false, "font": null}}, {"type": "Container", "props": {"width": "100%", "height": "auto", "padding": 20, "margin": 0, "background": "#1e293b", "border": null, "rounded": 8, "shadow": null, "align": "stretch", "justify": "start", "direction": "column", "style": "margin: 20px 0; overflow-x: auto; position: relative;"}, "children": [{"type": "Container", "props": {"width": "auto", "height": "auto", "padding": {"top": 4, "right": 12, "bottom": 4, "left": 12}, "margin": 0, "background": "#334155", "border": null, "rounded": 4, "shadow": null, "align": "stretch", "justify": "start", "direction": "column", "style": "position: absolute; top: 10px; right: 10px;"}, "children": [{"type": "Text", "props": {"text": "python", "size": "xs", "weight": "medium", "color": "#94a3b8", "align": "left", "italic": false, "underline": false, "font": null}}]}, {"type": "Html", "props": {"html": "\n                <pre style=\"margin: 0; padding: 0; overflow-x: auto;\">\n                    <code style=\"\n                        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;\n                        font-size: 0.9rem;\n                        line-height: 1.6;\n                        color: #e2e8f0;\n                        white-space: pre;\n                    \">Container(width='100%', padding=20, background='white')</code>\n                </pre>\n            "}}]}]}]}, {"type": "Container", "props": {"width": "auto", "height": "auto", "padding": 20, "margin": 0, "background": "#1e293b", "border": null, "rounded": 8, "shadow": null, "align": "stretch", "justify": "start", "direction": "column"}, "children": [{"type": "Column", "props": {"spacing": 10, "align": "start", "justify": "start"}, "children": [{"type": "Heading", "props": {"text": "Row", "level": 3, "color": "#3b82f6", "weight": "bold"}}, {"type": "Text", "props": {"text": "Arranges children horizontally", "size": "md", "weight": "normal", "color": "#cbd5e1", "align": "left", "italic": false, "underline": false, "font": null}}, {"type": "Container", "props": {"width": "100%", "height": "auto", "padding": 20, "margin": 0, "background": "#1e293b", "border": null, "rounded": 8, "shadow": null, "align": "stretch", "justify": "start", "direction": "column", "style": "margin: 20px 0; overflow-x: auto; position: relative;"}, "children": [{"type": "Container", "props": {"width": "auto", "height": "auto", "padding": {"top": 4, "right": 12, "bottom": 4, "left": 12}, "margin": 0, "background": "#334155", "border": null, "rounded": 4, "shadow": null, "align": "stretch", "justify": "start", "direction": "column", "style": "position: absolute; top: 10px; right: 10px;"}, "children": [{"type": "Text", "props": {"text": "python", "size": "xs", "weight": "medium", "color": "#94a3b8", "align": "left", "italic": false, "underline": false, "font": null}}]}, {"type": "Html", "props": {"html": "\n                <pre style=\"margin: 0; padding: 0; overflow-x: auto;\">\n                    <code style=\"\n                        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;\n                        font-size: 0.9rem;\n                        line-height: 1.6;\n                        color: #e2e8f0;\n                        white-space: pre;\n                    \">Row(spacing=10, children=[...])</code>\n                </pre>\n            "}}]}]}]}, {"type": "Container", "props": {"width": "auto", "height": "auto", "padding": 20, "margin": 0, "background": "#1e293b", "border": null, "rounded": 8, "shadow": null, "align": "stretch", "justify": "start", "direction": "column"}, "children": [{"type": "Column", "props": {"spacing": 10, "align": "start", "justify": "start"}, "children": [{"type": "Heading", "props": {"text": "Column", "level": 3, "color": "#3b82f6", "weight": "bold"}}, {"type": "Text", "props": {"text": "Arranges children vertically", "size": "md", "weight": "normal", "color": "#cbd5e1", "align": "left", "italic": false, "underline": false, "font": null}}, {"type": "Container", "props": {"width": "100%", "height": "auto", "padding": 20, "margin": 0, "background": "#1e293b", "border": null, "rounded": 8, "shadow": null, "align": "stretch", "justify": "start", "direction": "column", "style": "margin: 20px 0; overflow-x: auto; position: relative;"}, "children": [{"type": "Container", "props": {"width": "auto", "height": "auto", "padding": {"top": 4, "right": 12, "bottom": 4, "left": 12}, "margin": 0, "background": "#334155", "border": null, "rounded": 4, "shadow": null, "align": "stretch", "justify": "start", "direction": "column", "style": "position: absolute; top: 10px; right: 10px;"}, "children": [{"type": "Text", "props": {"text": "python", "size": "xs", "weight": "medium", "color": "#94a3b8", "align": "left", "italic": false, "underline": false, "font": null}}]}, {"type": "Html", "props": {"html": "\n                <pre style=\"margin: 0; padding: 0; overflow-x: auto;\">\n                    <code style=\"\n                        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;\n                        font-size: 0.9rem;\n                        line-height: 1.6;\n                        color: #e2e8f0;\n                        white-space: pre;\n                    \">Column(spacing=10, children=[...])</code>\n                </pre>\n            "}}]}]}]}, {"type": "Container", "props": {"width": "auto", "height": "auto", "padding": 20, "margin": 0, "background": "#1e293b", "border": null, "rounded": 8, "shadow": null, "align": "stretch", "justify": "start", "direction": "column"}, "children": [{"type": "Column", "props": {"spacing": 10, "align": "start", "justify": "start"}, "children": [{"type": "Heading", "props": {"text": "Stack", "level": 3, "color": "#3b82f6", "weight": "bold"}}, {"type": "Text", "props": {"text": "Overlaps children", "size": "md", "weight": "normal", "color": "#cbd5e1", "align": "left", "italic": false, "underline": false, "font": null}}, {"type": "Container", "props": {"width": "100%", "height": "auto", "padding": 20, "margin": 0, "background": "#1e293b", "border": null, "rounded": 8, "shadow": null, "align": "stretch", "justify": "start", "direction": "column", "style": "margin: 20px 0; overflow-x: auto; position: relative;"}, "children": [{"type": "Container", "props": {"width": "auto", "height": "auto", "padding": {"top": 4, "right": 12, "bottom": 4, "left": 12}, "margin": 0, "background": "#334155", "border": null, "rounded": 4, "shadow": null, "align": "stretch", "justify": "start", "direction": "column", "style": "position: absolute; top: 10px; right: 10px;"}, "children": [{"type": "Text", "props": {"text": "python", "size": "xs", "weight": "medium", "color": "#94a3b8", "align": "left", "italic": false, "underline": false, "font": null}}]}, {"type": "Html", "props": {"html": "\n                <pre style=\"margin: 0; padding: 0; overflow-x: auto;\">\n                    <code style=\"\n                        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;\n                        font-size: 0.9rem;\n                        line-height: 1.6;\n                        color: #e2e8f0;\n                        white-space: pre;\n                    \">Stack(children=[...])</code>\n                </pre>\n            "}}]}]}]}, {"type": "Container", "props": {"width": "auto", "height": "auto", "padding": 20, "margin": 0, "background": "#1e293b", "border": null, "rounded": 8, "shadow": null, "align": "stretch", "justify": "start", "direction": "column"}, "children": [{"type": "Column", "props": {"spacing": 10, "align": "start", "justify": "start"}, "children": [{"type": "Heading", "props": {"text": "Center", "level": 3, "color": "#3b82f6", "weight": "bold"}}, {"type": "Text", "props": {"text": "Centers its child", "size": "md", "weight": "normal", "color": "#cbd5e1", "align": "left", "italic": false, "underline": false, "font": null}}, {"type": "Container", "props": {"width": "100%", "height": "auto", "padding": 20, "margin": 0, "background": "#1e293b", "border": null, "rounded": 8, "shadow": null, "align": "stretch", "justify": "start", "direction": "column", "style": "margin: 20px 0; overflow-x: auto; position: relative;"}, "children": [{"type": "Container", "props": {"width": "auto", "height": "auto", "padding": {"top": 4, "right": 12, "bottom": 4, "left": 12}, "margin": 0, "background": "#334155", "border": null, "rounded": 4, "shadow": null, "align": "stretch", "justify": "start", "direction": "column", "style": "position: absolute; top: 10px; right: 10px;"}, "children": [{"type": "Text", "props": {"text": "python", "size": "xs", "weight": "medium", "color": "#94a3b8", "align": "left", "italic": false, "underline": false, "font": null}}]}, {"type": "Html", "props": {"html": "\n                <pre style=\"margin: 0; padding: 0; overflow-x: auto;\">\n                    <code style=\"\n                        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;\n                        font-size: 0.9rem;\n                        line-height: 1.6;\n                        color: #e2e8f0;\n                        white-space: pre;\n                    \">Center(child=Text('Centered'))</code>\n                </pre>\n            "}}]}]}]}, {"type": "Container", "props": {"width": "auto", "height": "auto", "padding": 20, "margin": 0, "background": "#1e293b", "border": null, "rounded": 8, "shadow": null, "align": "stretch", "justify": "start", "direction": "column"}, "children": [{"type": "Column", "props": {"spacing": 10, "align": "start", "justify": "start"}, "children": [{"type": "Heading", "props": {"text": "Spacer", "level": 3, "color": "#3b82f6", "weight": "bold"}}, {"type": "Text", "props": {"text": "Takes up available space", "size": "md", "weight": "normal", "color": "#cbd5e1", "align": "left", "italic": false, "underline": false, "font": null}}, {"type": "Container", "props": {"width": "100%", "height": "auto", "padding": 20, "margin": 0, "background": "#1e293b", "border": null, "rounded": 8, "shadow": null, "align": "stretch", "justify": "start", "direction": "column", "style": "margin: 20px 0; overflow-x: auto; position: relative;"}, "children": [{"type": "Container", "props": {"width": "auto", "height": "auto", "padding": {"top": 4, "right": 12, "bottom": 4, "left": 12}, "margin": 0, "background": "#334155", "border": null, "rounded": 4, "shadow": null, "align": "stretch", "justify": "start", "direction": "column", "style": "position: absolute; top: 10px; right: 10px;"}, "children": [{"type": "Text", "props": {"text": "python", "size": "xs", "weight": "medium", "color": "#94a3b8", "align": "left", "italic": false, "underline": false, "font": null}}]}, {"type": "Html", "props": {"html": "\n                <pre style=\"margin: 0; padding: 0; overflow-x: auto;\">\n                    <code style=\"\n                        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;\n                        font-size: 0.9rem;\n                        line-height: 1.6;\n                        color: #e2e8f0;\n                        white-space: pre;\n                    \">Spacer()</code>\n                </pre>\n            "}}]}]}]}]}]}, {"type": "Column", "props": {"spacing": 20, "align": "start", "justify": "start"}, "children": [{"type": "Heading", "props": {"text": "Text Widgets", "level": 2, "color": "white", "weight": "bold"}}, {"type": "Column", "props": {"spacing": 15, "align": "start", "justify": "start"}, "children": [{"type": "Container", "props": {"width": "auto", "height": "auto", "padding": 20, "margin": 0, "background": "#1e293b", "border": null, "rounded": 8, "shadow": null, "align": "stretch", "justify": "start", "direction": "column"}, "children": [{"type": "Column", "props": {"spacing": 10, "align": "start", "justify": "start"}, "children": [{"type": "Heading", "props": {"text": "Text", "level": 3, "color": "#3b82f6", "weight": "bold"}}, {"type": "Text", "props": {"text": "Display text", "size": "md", "weight": "normal", "color": "#cbd5e1", "align": "left", "italic": false, "underline": false, "font": null}}, {"type": "Container", "props": {"width": "100%", "height": "auto", "padding": 20, "margin": 0, "background": "#1e293b", "border": null, "rounded": 8, "shadow": null, "align": "stretch", "justify": "start", "direction": "column", "style": "margin: 20px 0; overflow-x: auto; position: relative;"}, "children": [{"type": "Container", "props": {"width": "auto", "height": "auto", "padding": {"top": 4, "right": 12, "bottom": 4, "left": 12}, "margin": 0, "background": "#334155", "border": null, "rounded": 4, "shadow": null, "align": "stretch", "justify": "start", "direction": "column", "style": "position: absolute; top: 10px; right: 10px;"}, "children": [{"type": "Text", "props": {"text": "python", "size": "xs", "weight": "medium", "color": "#94a3b8", "align": "left", "italic": false, "underline": false, "font": null}}]}, {"type": "Html", "props": {"html": "\n                <pre style=\"margin: 0; padding: 0; overflow-x: auto;\">\n                    <code style=\"\n                        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;\n                        font-size: 0.9rem;\n                        line-height: 1.6;\n                        color: #e2e8f0;\n                        white-space: pre;\n                    \">Text('Hello', size='xl', color='primary')</code>\n                </pre>\n            "}}]}]}]}, {"type": "Container", "props": {"width": "auto", "height": "auto", "padding": 20, "margin": 0, "background": "#1e293b", "border": null, "rounded": 8, "shadow": null, "align": "stretch", "justify": "start", "direction": "column"}, "children": [{"type": "Column", "props": {"spacing": 10, "align": "start", "justify": "start"}, "children": [{"type": "Heading", "props": {"text": "Heading", "level": 3, "color": "#3b82f6", "weight": "bold"}}, {"type": "Text", "props": {"text": "Semantic heading (h1-h6)", "size": "md", "weight": "normal", "color": "#cbd5e1", "align": "left", "italic": false, "underline": false, "font": null}}, {"type": "Container", "props": {"width": "100%", "height": "auto", "padding": 20, "margin": 0, "background": "#1e293b", "border": null, "rounded": 8, "shadow": null, "align": "stretch", "justify": "start", "direction": "column", "style": "margin: 20px 0; overflow-x: auto; position: relative;"}, "children": [{"type": "Container", "props": {"width": "auto", "height": "auto", "padding": {"top": 4, "right": 12, "bottom": 4, "left": 12}, "margin": 0, "background": "#334155", "border": null, "rounded": 4, "shadow": null, "align": "stretch", "justify": "start", "direction": "column", "style": "position: absolute; top: 10px; right: 10px;"}, "children": [{"type": "Text", "props": {"text": "python", "size": "xs", "weight": "medium", "color": "#94a3b8", "align": "left", "italic": false, "underline": false, "font": null}}]}, {"type": "Html", "props": {"html": "\n                <pre style=\"margin: 0; padding: 0; overflow-x: auto;\">\n                    <code style=\"\n                        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;\n                        font-size: 0.9rem;\n                        line-height: 1.6;\n                        color: #e2e8f0;\n                        white-space: pre;\n                    \">Heading('Title', level=1)</code>\n                </pre>\n            "}}]}]}]}]}]}, {"type": "Column", "props": {"spacing": 20, "align": "start", "justify": "start"}, "children": [{"type": "Heading", "props": {"text": "Input Widgets", "level": 2, "color": "white", "weight": "bold"}}, {"type": "Column", "props": {"spacing": 15, "align": "start", "justify": "start"}, "children": [{"type": "Container", "props": {"width": "auto", "height": "auto", "padding": 20, "margin": 0, "background": "#1e293b", "border": null, "rounded": 8, "shadow": null, "align": "stretch", "justify": "start", "direction": "column"}, "children": [{"type": "Column", "props": {"spacing": 10, "align": "start", "justify": "start"}, "children": [{"type": "Heading", "props": {"text": "Button", "level": 3, "color": "#3b82f6", "weight": "bold"}}, {"type": "Text", "props": {"text": "Clickable button", "size": "md", "weight": "normal", "color": "#cbd5e1", "align": "left", "italic": false, "underline": false, "font": null}}, {"type": "Container", "props": {"width": "100%", "height": "auto", "padding": 20, "margin": 0, "background": "#1e293b", "border": null, "rounded": 8, "shadow": null, "align": "stretch", "justify": "start", "direction": "column", "style": "margin: 20px 0; overflow-x: auto; position: relative;"}, "children": [{"type": "Container", "props": {"width": "auto", "height": "auto", "padding": {"top": 4, "right": 12, "bottom": 4, "left": 12}, "margin": 0, "background": "#334155", "border": null, "rounded": 4, "shadow": null, "align": "stretch", "justify": "start", "direction": "column", "style": "position: absolute; top: 10px; right: 10px;"}, "children": [{"type": "Text", "props": {"text": "python", "size": "xs", "weight": "medium", "color": "#94a3b8", "align": "left", "italic": false, "underline": false, "font": null}}]}, {"type": "Html", "props": {"html": "\n                <pre style=\"margin: 0; padding: 0; overflow-x: auto;\">\n                    <code style=\"\n                        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;\n                        font-size: 0.9rem;\n                        line-height: 1.6;\n                        color: #e2e8f0;\n                        white-space: pre;\n                    \">Button(text='Click', on_click=handler)</code>\n                </pre>\n            "}}]}]}]}, {"type": "Container", "props": {"width": "auto", "height": "auto", "padding": 20, "margin": 0, "background": "#1e293b", "border": null, "rounded": 8, "shadow": null, "align": "stretch", "justify": "start", "direction": "column"}, "children": [{"type": "Column", "props": {"spacing": 10, "align": "start", "justify": "start"}, "children": [{"type": "Heading", "props": {"text": "TextField", "level": 3, "color": "#3b82f6", "weight": "bold"}}, {"type": "Text", "props": {"text": "Text input", "size": "md", "weight": "normal", "color": "#cbd5e1", "align": "left", "italic": false, "underline": false, "font": null}}, {"type": "Container", "props": {"width": "100%", "height": "auto", "padding": 20, "margin": 0, "background": "#1e293b", "border": null, "rounded": 8, "shadow": null, "align": "stretch", "justify": "start", "direction": "column", "style": "margin: 20px 0; overflow-x: auto; position: relative;"}, "children": [{"type": "Container", "props": {"width": "auto", "height": "auto", "padding": {"top": 4, "right": 12, "bottom": 4, "left": 12}, "margin": 0, "background": "#334155", "border": null, "rounded": 4, "shadow": null, "align": "stretch", "justify": "start", "direction": "column", "style": "position: absolute; top: 10px; right: 10px;"}, "children": [{"type": "Text", "props": {"text": "python", "size": "xs", "weight": "medium", "color": "#94a3b8", "align": "left", "italic": false, "underline": false, "font": null}}]}, {"type": "Html", "props": {"html": "\n                <pre style=\"margin: 0; padding: 0; overflow-x: auto;\">\n                    <code style=\"\n                        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;\n                        font-size: 0.9rem;\n                        line-height: 1.6;\n                        color: #e2e8f0;\n                        white-space: pre;\n                    \">TextField(placeholder='Name', on_change=handler)</code>\n                </pre>\n            "}}]}]}]}, {"type": "Container", "props": {"width": "auto", "height": "auto", "padding": 20, "margin": 0, "background": "#1e293b", "border": null, "rounded": 8, "shadow": null, "align": "stretch", "justify": "start", "direction": "column"}, "children": [{"type": "Column", "props": {"spacing": 10, "align": "start", "justify": "start"}, "children": [{"type": "Heading", "props": {"text": "Checkbox", "level": 3, "color": "#3b82f6", "weight": "bold"}}, {"type": "Text", "props": {"text": "Boolean toggle", "size": "md", "weight": "normal", "color": "#cbd5e1", "align": "left", "italic": false, "underline": false, "font": null}}, {"type": "Container", "props": {"width": "100%", "height": "auto", "padding": 20, "margin": 0, "background": "#1e293b", "border": null, "rounded": 8, "shadow": null, "align": "stretch", "justify": "start", "direction": "column", "style": "margin: 20px 0; overflow-x: auto; position: relative;"}, "children": [{"type": "Container", "props": {"width": "auto", "height": "auto", "padding": {"top": 4, "right": 12, "bottom": 4, "left": 12}, "margin": 0, "background": "#334155", "border": null, "rounded": 4, "shadow": null, "align": "stretch", "justify": "start", "direction": "column", "style": "position: absolute; top: 10px; right: 10px;"}, "children": [{"type": "Text", "props": {"text": "python", "size": "xs", "weight": "medium", "color": "#94a3b8", "align": "left", "italic": false, "underline": false, "font": null}}]}, {"type": "Html", "props": {"html": "\n                <pre style=\"margin: 0; padding: 0; overflow-x: auto;\">\n                    <code style=\"\n                        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;\n                        font-size: 0.9rem;\n                        line-height: 1.6;\n                        color: #e2e8f0;\n                        white-space: pre;\n                    \">Checkbox(checked=True, label='Accept')</code>\n                </pre>\n            "}}]}]}]}, {"type": "Container", "props": {"width": "auto", "height": "auto", "padding": 20, "margin": 0, "background": "#1e293b", "border": null, "rounded": 8, "shadow": null, "align": "stretch", "justify": "start", "direction": "column"}, "children": [{"type": "Column", "props": {"spacing": 10, "align": "start", "justify": "start"}, "children": [{"type": "Heading", "props": {"text": "Radio", "level": 3, "color": "#3b82f6", "weight": "bold"}}, {"type": "Text", "props": {"text": "Radio button", "size": "md", "weight": "normal", "color": "#cbd5e1", "align": "left", "italic": false, "underline": false, "font": null}}, {"type": "Container", "props": {"width": "100%", "height": "auto", "padding": 20, "margin": 0, "background": "#1e293b", "border": null, "rounded": 8, "shadow": null, "align": "stretch", "justify": "start", "direction": "column", "style": "margin: 20px 0; overflow-x: auto; position: relative;"}, "children": [{"type": "Container", "props": {"width": "auto", "height": "auto", "padding": {"top": 4, "right": 12, "bottom": 4, "left": 12}, "margin": 0, "background": "#334155", "border": null, "rounded": 4, "shadow": null, "align": "stretch", "justify": "start", "direction": "column", "style": "position: absolute; top: 10px; right: 10px;"}, "children": [{"type": "Text", "props": {"text": "python", "size": "xs", "weight": "medium", "color": "#94a3b8", "align": "left", "italic": false, "underline": false, "font": null}}]}, {"type": "Html", "props": {"html": "\n                <pre style=\"margin: 0; padding: 0; overflow-x: auto;\">\n                    <code style=\"\n                        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;\n                        font-size: 0.9rem;\n                        line-height: 1.6;\n                        color: #e2e8f0;\n                        white-space: pre;\n                    \">Radio(checked=True, name='group')</code>\n                </pre>\n            "}}]}]}]}, {"type": "Container", "props": {"width": "auto", "height": "auto", "padding": 20, "margin": 0, "background": "#1e293b", "border": null, "rounded": 8, "shadow": null, "align": "stretch", "justify": "start", "direction": "column"}, "children": [{"type": "Column", "props": {"spacing": 10, "align": "start", "justify": "start"}, "children": [{"type": "Heading", "props": {"text": "Select", "level": 3, "color": "#3b82f6", "weight": "bold"}}, {"type": "Text", "props": {"text": "Dropdown select", "size": "md", "weight": "normal", "color": "#cbd5e1", "align": "left", "italic": false, "underline": false, "font": null}}, {"type": "Container", "props": {"width": "100%", "height": "auto", "padding": 20, "margin": 0, "background": "#1e293b", "border": null, "rounded": 8, "shadow": null, "align": "stretch", "justify": "start", "direction": "column", "style": "margin: 20px 0; overflow-x: auto; position: relative;"}, "children": [{"type": "Container", "props": {"width": "auto", "height": "auto", "padding": {"top": 4, "right": 12, "bottom": 4, "left": 12}, "margin": 0, "background": "#334155", "border": null, "rounded": 4, "shadow": null, "align": "stretch", "justify": "start", "direction": "column", "style": "position: absolute; top: 10px; right: 10px;"}, "children": [{"type": "Text", "props": {"text": "python", "size": "xs", "weight": "medium", "color": "#94a3b8", "align": "left", "italic": false, "underline": false, "font": null}}]}, {"type": "Html", "props": {"html": "\n                <pre style=\"margin: 0; padding: 0; overflow-x: auto;\">\n                    <code style=\"\n                        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;\n                        font-size: 0.9rem;\n                        line-height: 1.6;\n                        color: #e2e8f0;\n                        white-space: pre;\n                    \">Select(options=['A', 'B'], on_change=handler)</code>\n                </pre>\n            "}}]}]}]}, {"type": "Container", "props": {"width": "auto", "height": "auto", "padding": 20, "margin": 0, "background": "#1e293b", "border": null, "rounded": 8, "shadow": null, "align": "stretch", "justify": "start", "direction": "column"}, "children": [{"type": "Column", "props": {"spacing": 10, "align": "start", "justify": "start"}, "children": [{"type": "Heading", "props": {"text": "Slider", "level": 3, "color": "#3b82f6", "weight": "bold"}}, {"type": "Text", "props": {"text": "Range slider", "size": "md", "weight": "normal", "color": "#cbd5e1", "align": "left", "italic": false, "underline": false, "font": null}}, {"type": "Container", "props": {"width": "100%", "height": "auto", "padding": 20, "margin": 0, "background": "#1e293b", "border": null, "rounded": 8, "shadow": null, "align": "stretch", "justify": "start", "direction": "column", "style": "margin: 20px 0; overflow-x: auto; position: relative;"}, "children": [{"type": "Container", "props": {"width": "auto", "height": "auto", "padding": {"top": 4, "right": 12, "bottom": 4, "left": 12}, "margin": 0, "background": "#334155", "border": null, "rounded": 4, "shadow": null, "align": "stretch", "justify": "start", "direction": "column", "style": "position: absolute; top: 10px; right: 10px;"}, "children": [{"type": "Text", "props": {"text": "python", "size": "xs", "weight": "medium", "color": "#94a3b8", "align": "left", "italic": false, "underline": false, "font": null}}]}, {"type": "Html", "props": {"html": "\n                <pre style=\"margin: 0; padding: 0; overflow-x: auto;\">\n                    <code style=\"\n                        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;\n                        font-size: 0.9rem;\n                        line-height: 1.6;\n                        color: #e2e8f0;\n                        white-space: pre;\n                    \">Slider(value=50, min=0, max=100)</code>\n                </pre>\n            "}}]}]}]}]}]}, {"type": "Column", "props": {"spacing": 20, "align": "start", "justify": "start"}, "children": [{"type": "Heading", "props": {"text": "API Widgets", "level": 2, "color": "white", "weight": "bold"}}, {"type": "Column", "props": {"spacing": 15, "align": "start", "justify": "start"}, "children": [{"type": "Container", "props": {"width": "auto", "height": "auto", "padding": 20, "margin": 0, "background": "#1e293b", "border": null, "rounded": 8, "shadow": null, "align": "stretch", "justify": "start", "direction": "column"}, "children": [{"type": "Column", "props": {"spacing": 10, "align": "start", "justify": "start"}, "children": [{"type": "Heading", "props": {"text": "ApiRequest", "level": 3, "color": "#3b82f6", "weight": "bold"}}, {"type": "Text", "props": {"text": "Make HTTP requests", "size": "md", "weight": "normal", "color": "#cbd5e1", "align": "left", "italic": false, "underline": false, "font": null}}, {"type": "Container", "props": {"width": "100%", "height": "auto", "padding": 20, "margin": 0, "background": "#1e293b", "border": null, "rounded": 8, "shadow": null, "align": "stretch", "justify": "start", "direction": "column", "style": "margin: 20px 0; overflow-x: auto; position: relative;"}, "children": [{"type": "Container", "props": {"width": "auto", "height": "auto", "padding": {"top": 4, "right": 12, "bottom": 4, "left": 12}, "margin": 0, "background": "#334155", "border": null, "rounded": 4, "shadow": null, "align": "stretch", "justify": "start", "direction": "column", "style": "position: absolute; top: 10px; right: 10px;"}, "children": [{"type": "Text", "props": {"text": "python", "size": "xs", "weight": "medium", "color": "#94a3b8", "align": "left", "italic": false, "underline": false, "font": null}}]}, {"type": "Html", "props": {"html": "\n                <pre style=\"margin: 0; padding: 0; overflow-x: auto;\">\n                    <code style=\"\n                        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;\n                        font-size: 0.9rem;\n                        line-height: 1.6;\n                        color: #e2e8f0;\n                        white-space: pre;\n                    \">ApiRequest(url='...', method='GET', on_success=handler)</code>\n                </pre>\n            "}}]}]}]}, {"type": "Container", "props": {"width": "auto", "height": "auto", "padding": 20, "margin": 0, "background": "#1e293b", "border": null, "rounded": 8, "shadow": null, "align": "stretch", "justify": "start", "direction": "column"}, "children": [{"type": "Column", "props": {"spacing": 10, "align": "start", "justify": "start"}, "children": [{"type": "Heading", "props": {"text": "FetchData", "level": 3, "color": "#3b82f6", "weight": "bold"}}, {"type": "Text", "props": {"text": "Simplified GET requests", "size": "md", "weight": "normal", "color": "#cbd5e1", "align": "left", "italic": false, "underline": false, "font": null}}, {"type": "Container", "props": {"width": "100%", "height": "auto", "padding": 20, "margin": 0, "background": "#1e293b", "border": null, "rounded": 8, "shadow": null, "align": "stretch", "justify": "start", "direction": "column", "style": "margin: 20px 0; overflow-x: auto; position: relative;"}, "children": [{"type": "Container", "props": {"width": "auto", "height": "auto", "padding": {"top": 4, "right": 12, "bottom": 4, "left": 12}, "margin": 0, "background": "#334155", "border": null, "rounded": 4, "shadow": null, "align": "stretch", "justify": "start", "direction": "column", "style": "position: absolute; top: 10px; right: 10px;"}, "children": [{"type": "Text", "props": {"text": "python", "size": "xs", "weight": "medium", "color": "#94a3b8", "align": "left", "italic": false, "underline": false, "font": null}}]}, {"type": "Html", "props": {"html": "\n                <pre style=\"margin: 0; padding: 0; overflow-x: auto;\">\n                    <code style=\"\n                        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;\n                        font-size: 0.9rem;\n                        line-height: 1.6;\n                        color: #e2e8f0;\n                        white-space: pre;\n                    \">FetchData(url='...', on_success=handler)</code>\n                </pre>\n            "}}]}]}]}]}]}, {"type": "Column", "props": {"spacing": 20, "align": "start", "justify": "start"}, "children": [{"type": "Heading", "props": {"text": "Media Widgets", "level": 2, "color": "white", "weight": "bold"}}, {"type": "Column", "props": {"spacing": 15, "align": "start", "justify": "start"}, "children": [{"type": "Container", "props": {"width": "auto", "height": "auto", "padding": 20, "margin": 0, "background": "#1e293b", "border": null, "rounded": 8, "shadow": null, "align": "stretch", "justify": "start", "direction": "column"}, "children": [{"type": "Column", "props": {"spacing": 10, "align": "start", "justify": "start"}, "children": [{"type": "Heading", "props": {"text": "Image", "level": 3, "color": "#3b82f6", "weight": "bold"}}, {"type": "Text", "props": {"text": "Display image", "size": "md", "weight": "normal", "color": "#cbd5e1", "align": "left", "italic": false, "underline": false, "font": null}}, {"type": "Container", "props": {"width": "100%", "height": "auto", "padding": 20, "margin": 0, "background": "#1e293b", "border": null, "rounded": 8, "shadow": null, "align": "stretch", "justify": "start", "direction": "column", "style": "margin: 20px 0; overflow-x: auto; position: relative;"}, "children": [{"type": "Container", "props": {"width": "auto", "height": "auto", "padding": {"top": 4, "right": 12, "bottom": 4, "left": 12}, "margin": 0, "background": "#334155", "border": null, "rounded": 4, "shadow": null, "align": "stretch", "justify": "start", "direction": "column", "style": "position: absolute; top: 10px; right: 10px;"}, "children": [{"type": "Text", "props": {"text": "python", "size": "xs", "weight": "medium", "color": "#94a3b8", "align": "left", "italic": false, "underline": false, "font": null}}]}, {"type": "Html", "props": {"html": "\n                <pre style=\"margin: 0; padding: 0; overflow-x: auto;\">\n                    <code style=\"\n                        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;\n                        font-size: 0.9rem;\n                        line-height: 1.6;\n                        color: #e2e8f0;\n                        white-space: pre;\n                    \">Image(src='/path.jpg', width=200)</code>\n                </pre>\n            "}}]}]}]}, {"type": "Container", "props": {"width": "auto", "height": "auto", "padding": 20, "margin": 0, "background": "#1e293b", "border": null, "rounded": 8, "shadow": null, "align": "stretch", "justify": "start", "direction": "column"}, "children": [{"type": "Column", "props": {"spacing": 10, "align": "start", "justify": "start"}, "children": [{"type": "Heading", "props": {"text": "Video", "level": 3, "color": "#3b82f6", "weight": "bold"}}, {"type": "Text", "props": {"text": "Video player", "size": "md", "weight": "normal", "color": "#cbd5e1", "align": "left", "italic": false, "underline": false, "font": null}}, {"type": "Container", "props": {"width": "100%", "height": "auto", "padding": 20, "margin": 0, "background": "#1e293b", "border": null, "rounded": 8, "shadow": null, "align": "stretch", "justify": "start", "direction": "column", "style": "margin: 20px 0; overflow-x: auto; position: relative;"}, "children": [{"type": "Container", "props": {"width": "auto", "height": "auto", "padding": {"top": 4, "right": 12, "bottom": 4, "left": 12}, "margin": 0, "background": "#334155", "border": null, "rounded": 4, "shadow": null, "align": "stretch", "justify": "start", "direction": "column", "style": "position: absolute; top: 10px; right: 10px;"}, "children": [{"type": "Text", "props": {"text": "python", "size": "xs", "weight": "medium", "color": "#94a3b8", "align": "left", "italic": false, "underline": false, "font": null}}]}, {"type": "Html", "props": {"html": "\n                <pre style=\"margin: 0; padding: 0; overflow-x: auto;\">\n                    <code style=\"\n                        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;\n                        font-size: 0.9rem;\n                        line-height: 1.6;\n                        color: #e2e8f0;\n                        white-space: pre;\n                    \">Video(src='/video.mp4', controls=True)</code>\n                </pre>\n            "}}]}]}]}, {"type": "Container", "props": {"width": "auto", "height": "auto", "padding": 20, "margin": 0, "background": "#1e293b", "border": null, "rounded": 8, "shadow": null, "align": "stretch", "justify": "start", "direction": "column"}, "children": [{"type": "Column", "props": {"spacing": 10, "align": "start", "justify": "start"}, "children": [{"type": "Heading", "props": {"text": "Icon", "level": 3, "color": "#3b82f6", "weight": "bold"}}, {"type": "Text", "props": {"text": "Icon display", "size": "md", "weight": "normal", "color": "#cbd5e1", "align": "left", "italic": false, "underline": false, "font": null}}, {"type": "Container", "props": {"width": "100%", "height": "auto", "padding": 20, "margin": 0, "background": "#1e293b", "border": null, "rounded": 8, "shadow": null, "align": "stretch", "justify": "start", "direction": "column", "style": "margin: 20px 0; overflow-x: auto; position: relative;"}, "children": [{"type": "Container", "props": {"width": "auto", "height": "auto", "padding": {"top": 4, "right": 12, "bottom": 4, "left": 12}, "margin": 0, "background": "#334155", "border": null, "rounded": 4, "shadow": null, "align": "stretch", "justify": "start", "direction": "column", "style": "position: absolute; top: 10px; right: 10px;"}, "children": [{"type": "Text", "props": {"text": "python", "size": "xs", "weight": "medium", "color": "#94a3b8", "align": "left", "italic": false, "underline": false, "font": null}}]}, {"type": "Html", "props": {"html": "\n                <pre style=\"margin: 0; padding: 0; overflow-x: auto;\">\n                    <code style=\"\n                        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;\n                        font-size: 0.9rem;\n                        line-height: 1.6;\n                        color: #e2e8f0;\n                        white-space: pre;\n                    \">Icon(name='heart', size=24)</code>\n                </pre>\n            "}}]}]}]}]}]}, {"type": "Column", "props": {"spacing": 20, "align": "start", "justify": "start"}, "children": [{"type": "Heading", "props": {"text": "Navigation Widgets", "level": 2, "color": "white", "weight": "bold"}}, {"type": "Column", "props": {"spacing": 15, "align": "start", "justify": "start"}, "children": [{"type": "Container", "props": {"width": "auto", "height": "auto", "padding": 20, "margin": 0, "background": "#1e293b", "border": null, "rounded": 8, "shadow": null, "align": "stretch", "justify": "start", "direction": "column"}, "children": [{"type": "Column", "props": {"spacing": 10, "align": "start", "justify": "start"}, "children": [{"type": "Heading", "props": {"text": "Link", "level": 3, "color": "#3b82f6", "weight": "bold"}}, {"type": "Text", "props": {"text": "Clickable link", "size": "md", "weight": "normal", "color": "#cbd5e1", "align": "left", "italic": false, "underline": false, "font": null}}, {"type": "Container", "props": {"width": "100%", "height": "auto", "padding": 20, "margin": 0, "background": "#1e293b", "border": null, "rounded": 8, "shadow": null, "align": "stretch", "justify": "start", "direction": "column", "style": "margin: 20px 0; overflow-x: auto; position: relative;"}, "children": [{"type": "Container", "props": {"width": "auto", "height": "auto", "padding": {"top": 4, "right": 12, "bottom": 4, "left": 12}, "margin": 0, "background": "#334155", "border": null, "rounded": 4, "shadow": null, "align": "stretch", "justify": "start", "direction": "column", "style": "position: absolute; top: 10px; right: 10px;"}, "children": [{"type": "Text", "props": {"text": "python", "size": "xs", "weight": "medium", "color": "#94a3b8", "align": "left", "italic": false, "underline": false, "font": null}}]}, {"type": "Html", "props": {"html": "\n                <pre style=\"margin: 0; padding: 0; overflow-x: auto;\">\n                    <code style=\"\n                        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;\n                        font-size: 0.9rem;\n                        line-height: 1.6;\n                        color: #e2e8f0;\n                        white-space: pre;\n                    \">Link(text='GitHub', to='https://...')</code>\n                </pre>\n            "}}]}]}]}]}]}, {"type": "Column", "props": {"spacing": 20, "align": "start", "justify": "start"}, "children": [{"type": "Heading", "props": {"text": "Advanced Widgets", "level": 2, "color": "white", "weight": "bold"}}, {"type": "Column", "props": {"spacing": 15, "align": "start", "justify": "start"}, "children": [{"type": "Container", "props": {"width": "auto", "height": "auto", "padding": 20, "margin": 0, "background": "#1e293b", "border": null, "rounded": 8, "shadow": null, "align": "stretch", "justify": "start", "direction": "column"}, "children": [{"type": "Column", "props": {"spacing": 10, "align": "start", "justify": "start"}, "children": [{"type": "Heading", "props": {"text": "Html", "level": 3, "color": "#3b82f6", "weight": "bold"}}, {"type": "Text", "props": {"text": "Raw HTML", "size": "md", "weight": "normal", "color": "#cbd5e1", "align": "left", "italic": false, "underline": false, "font": null}}, {"type": "Container", "props": {"width": "100%", "height": "auto", "padding": 20, "margin": 0, "background": "#1e293b", "border": null, "rounded": 8, "shadow": null, "align": "stretch", "justify": "start", "direction": "column", "style": "margin: 20px 0; overflow-x: auto; position: relative;"}, "children": [{"type": "Container", "props": {"width": "auto", "height": "auto", "padding": {"top": 4, "right": 12, "bottom": 4, "left": 12}, "margin": 0, "background": "#334155", "border": null, "rounded": 4, "shadow": null, "align": "stretch", "justify": "start", "direction": "column", "style": "position: absolute; top: 10px; right: 10px;"}, "children": [{"type": "Text", "props": {"text": "python", "size": "xs", "weight": "medium", "color": "#94a3b8", "align": "left", "italic": false, "underline": false, "font": null}}]}, {"type": "Html", "props": {"html": "\n                <pre style=\"margin: 0; padding: 0; overflow-x: auto;\">\n                    <code style=\"\n                        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;\n                        font-size: 0.9rem;\n                        line-height: 1.6;\n                        color: #e2e8f0;\n                        white-space: pre;\n                    \">Html(html='<div>Custom</div>')</code>\n                </pre>\n            "}}]}]}]}, {"type": "Container", "props": {"width": "auto", "height": "auto", "padding": 20, "margin": 0, "background": "#1e293b", "border": null, "rounded": 8, "shadow": null, "align": "stretch", "justify": "start", "direction": "column"}, "children": [{"type": "Column", "props": {"spacing": 10, "align": "start", "justify": "start"}, "children": [{"type": "Heading", "props": {"text": "Css", "level": 3, "color": "#3b82f6", "weight": "bold"}}, {"type": "Text", "props": {"text": "Inject CSS", "size": "md", "weight": "normal", "color": "#cbd5e1", "align": "left", "italic": false, "underline": false, "font": null}}, {"type": "Container", "props": {"width": "100%", "height": "auto", "padding": 20, "margin": 0, "background": "#1e293b", "border": null, "rounded": 8, "shadow": null, "align": "stretch", "justify": "start", "direction": "column", "style": "margin: 20px 0; overflow-x: auto; position: relative;"}, "children": [{"type": "Container", "props": {"width": "auto", "height": "auto", "padding": {"top": 4, "right": 12, "bottom": 4, "left": 12}, "margin": 0, "background": "#334155", "border": null, "rounded": 4, "shadow": null, "align": "stretch", "justify": "start", "direction": "column", "style": "position: absolute; top: 10px; right: 10px;"}, "children": [{"type": "Text", "props": {"text": "python", "size": "xs", "weight": "medium", "color": "#94a3b8", "align": "left", "italic": false, "underline": false, "font": null}}]}, {"type": "Html", "props": {"html": "\n                <pre style=\"margin: 0; padding: 0; overflow-x: auto;\">\n                    <code style=\"\n                        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;\n                        font-size: 0.9rem;\n                        line-height: 1.6;\n                        color: #e2e8f0;\n                        white-space: pre;\n                    \">Css(css='.class { color: red; }')</code>\n                </pre>\n            "}}]}]}]}]}]}]}]}]}, {"type": "Html", "props": {"html": "</div>"}}, {"type": "Container", "props": {"width": "100%", "height": "auto", "padding": 40, "margin": 0, "background": "#1e293b", "border": null, "rounded": false, "shadow": null, "align": "stretch", "justify": "start", "direction": "column", "style": "margin-top: 80px; border-top: 1px solid #334155;"}, "children": [{"type": "Container", "props": {"width": "auto", "height": "auto", "padding": 0, "margin": 0, "background": null, "border": null, "rounded": false, "shadow": null, "align": "stretch", "justify": "start", "direction": "column"}, "children": [{"type": "Column", "props": {"spacing": 20, "align": "center", "justify": "start"}, "children": [{"type": "Row", "props": {"spacing": 30, "align": "start", "justify": "center", "wrap": false}, "children": [{"type": "Link", "props": {"text": "GitHub", "to": "https://github.com/GrandpaEJ/dreamweb", "color": "#3b82f6", "underline": false, "style": "font-size: 1.1rem;"}}, {"type": "Link", "props": {"text": "Documentation", "to": "#", "color": "#3b82f6", "underline": false, "style": "font-size: 1.1rem;"}}]}, {"type": "Container", "props": {"width": "100%", "height": 1, "padding": 0, "margin": 0, "background": "#334155", "border": null, "rounded": false, "shadow": null, "align": "stretch", "justify": "start", "direction": "column", "style": "max-width: 600px; margin: 10px auto;"}, "children": []}, {"type": "Column", "props": {"spacing": 5, "align": "center", "justify": "start"}, "children": [{"type": "Text", "props": {"text": "Built with \u2764\ufe0f using DreamWeb", "size": "md", "weight": "normal", "color": "#94a3b8", "align": "left", "italic": false, "underline": false, "font": null}}, {"type": "Text", "props": {"text": "\u00a9 2025 DreamWeb. MIT License.", "size": "sm", "weight": "normal", "color": "#64748b", "align": "left", "italic": false, "underline": false, "font": null}}]}]}]}]}]};
    const runtime = new DreamWebRuntime(document.getElementById('app'));
    runtime.init(componentTree);
})();
