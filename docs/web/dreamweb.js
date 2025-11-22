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
    const componentTree = {"type": "Container", "props": {"width": "100%", "height": "100vh", "padding": 0, "margin": 0, "background": "#0f172a", "border": null, "rounded": false, "shadow": null, "align": "stretch", "justify": "start", "direction": "column"}, "children": [{"type": "Row", "props": {"spacing": 0, "align": "start", "justify": "start", "wrap": false}, "children": [{"type": "Container", "props": {"width": 280, "height": "100vh", "padding": 20, "margin": 0, "background": "#1e293b", "border": null, "rounded": false, "shadow": null, "align": "stretch", "justify": "start", "direction": "column"}, "children": [{"type": "Container", "props": {"width": "auto", "height": "auto", "padding": {"bottom": 30}, "margin": 0, "background": null, "border": null, "rounded": false, "shadow": null, "align": "stretch", "justify": "start", "direction": "column"}, "children": [{"type": "Text", "props": {"text": "\ud83d\ude80 DreamWeb", "size": "2xl", "weight": "bold", "color": "white", "align": "left", "italic": false, "underline": false, "font": null}}, {"type": "Text", "props": {"text": "v0.1.0", "size": "sm", "weight": "normal", "color": "#94a3b8", "align": "left", "italic": false, "underline": false, "font": null}}]}, {"type": "Column", "props": {"spacing": 5, "align": "start", "justify": "start"}, "children": [{"type": "Button", "props": {"text": "\ud83d\ude80 Introduction", "color": "#3b82f6", "size": "md", "variant": "solid", "rounded": true, "icon": null, "disabled": false}, "events": {"click": "on_click_125642545245184"}}, {"type": "Button", "props": {"text": "\ud83d\udce6 Getting Started", "color": "#475569", "size": "md", "variant": "ghost", "rounded": true, "icon": null, "disabled": false}, "events": {"click": "on_click_125642545789536"}}, {"type": "Button", "props": {"text": "\ud83d\udca1 Core Concepts", "color": "#475569", "size": "md", "variant": "ghost", "rounded": true, "icon": null, "disabled": false}, "events": {"click": "on_click_125642545789696"}}, {"type": "Button", "props": {"text": "\ud83c\udfa8 Widget Library", "color": "#475569", "size": "md", "variant": "ghost", "rounded": true, "icon": null, "disabled": false}, "events": {"click": "on_click_125642545790176"}}, {"type": "Button", "props": {"text": "\u2328\ufe0f CLI Reference", "color": "#475569", "size": "md", "variant": "ghost", "rounded": true, "icon": null, "disabled": false}, "events": {"click": "on_click_125642543775808"}}, {"type": "Button", "props": {"text": "\ud83d\udd0d SEO & Metadata", "color": "#475569", "size": "md", "variant": "ghost", "rounded": true, "icon": null, "disabled": false}, "events": {"click": "on_click_125642543958432"}}, {"type": "Button", "props": {"text": "\ud83c\udf10 Deployment", "color": "#475569", "size": "md", "variant": "ghost", "rounded": true, "icon": null, "disabled": false}, "events": {"click": "on_click_125642543958592"}}]}]}, {"type": "Container", "props": {"width": "100%", "height": "100vh", "padding": 60, "margin": 0, "background": "#0f172a", "border": null, "rounded": false, "shadow": null, "align": "stretch", "justify": "start", "direction": "column"}, "children": [{"type": "Container", "props": {"width": "100%", "height": "auto", "padding": 0, "margin": 0, "background": null, "border": null, "rounded": false, "shadow": null, "align": "stretch", "justify": "start", "direction": "column"}, "children": [{"type": "Column", "props": {"spacing": 30, "align": "start", "justify": "start"}, "children": [{"type": "Text", "props": {"text": "\ud83d\ude80 DreamWeb", "size": "4xl", "weight": "bold", "color": "white", "align": "left", "italic": false, "underline": false, "font": null}}, {"type": "Text", "props": {"text": "A Flutter-like Python Web Framework", "size": "2xl", "weight": "normal", "color": "#94a3b8", "align": "left", "italic": false, "underline": false, "font": null}}, {"type": "Container", "props": {"width": "auto", "height": "auto", "padding": {"top": 20}, "margin": 0, "background": null, "border": null, "rounded": false, "shadow": null, "align": "stretch", "justify": "start", "direction": "column"}, "children": [{"type": "Text", "props": {"text": "Build beautiful web UIs using pure Python with a Flutter-style API. No HTML, CSS, or JavaScript knowledge required!", "size": "lg", "weight": "normal", "color": "#cbd5e1", "align": "left", "italic": false, "underline": false, "font": null}}]}, {"type": "Container", "props": {"width": "auto", "height": "auto", "padding": {"top": 30}, "margin": 0, "background": null, "border": null, "rounded": false, "shadow": null, "align": "stretch", "justify": "start", "direction": "column"}, "children": [{"type": "Text", "props": {"text": "\u2728 Features", "size": "2xl", "weight": "bold", "color": "white", "align": "left", "italic": false, "underline": false, "font": null}}, {"type": "Column", "props": {"spacing": 15, "align": "start", "justify": "start"}, "children": [{"type": "Container", "props": {"width": "auto", "height": "auto", "padding": 20, "margin": 0, "background": "#1e293b", "border": null, "rounded": 12, "shadow": null, "align": "stretch", "justify": "start", "direction": "column"}, "children": [{"type": "Text", "props": {"text": "\ud83c\udfa8 Flutter-Style Widgets", "size": "lg", "weight": "bold", "color": "white", "align": "left", "italic": false, "underline": false, "font": null}}, {"type": "Text", "props": {"text": "Familiar API with Container, Row, Column, Text, Button, etc.", "size": "md", "weight": "normal", "color": "#94a3b8", "align": "left", "italic": false, "underline": false, "font": null}}]}, {"type": "Container", "props": {"width": "auto", "height": "auto", "padding": 20, "margin": 0, "background": "#1e293b", "border": null, "rounded": 12, "shadow": null, "align": "stretch", "justify": "start", "direction": "column"}, "children": [{"type": "Text", "props": {"text": "\ud83c\udfaf Parameter-Based Styling", "size": "lg", "weight": "bold", "color": "white", "align": "left", "italic": false, "underline": false, "font": null}}, {"type": "Text", "props": {"text": "Style everything with simple parameters, no CSS needed", "size": "md", "weight": "normal", "color": "#94a3b8", "align": "left", "italic": false, "underline": false, "font": null}}]}, {"type": "Container", "props": {"width": "auto", "height": "auto", "padding": 20, "margin": 0, "background": "#1e293b", "border": null, "rounded": 12, "shadow": null, "align": "stretch", "justify": "start", "direction": "column"}, "children": [{"type": "Text", "props": {"text": "\u26a1 Hot Reload", "size": "lg", "weight": "bold", "color": "white", "align": "left", "italic": false, "underline": false, "font": null}}, {"type": "Text", "props": {"text": "See changes instantly in dev mode", "size": "md", "weight": "normal", "color": "#94a3b8", "align": "left", "italic": false, "underline": false, "font": null}}]}, {"type": "Container", "props": {"width": "auto", "height": "auto", "padding": 20, "margin": 0, "background": "#1e293b", "border": null, "rounded": 12, "shadow": null, "align": "stretch", "justify": "start", "direction": "column"}, "children": [{"type": "Text", "props": {"text": "\ud83d\udd04 Reactive State", "size": "lg", "weight": "bold", "color": "white", "align": "left", "italic": false, "underline": false, "font": null}}, {"type": "Text", "props": {"text": "Built-in state management with automatic re-rendering", "size": "md", "weight": "normal", "color": "#94a3b8", "align": "left", "italic": false, "underline": false, "font": null}}]}, {"type": "Container", "props": {"width": "auto", "height": "auto", "padding": 20, "margin": 0, "background": "#1e293b", "border": null, "rounded": 12, "shadow": null, "align": "stretch", "justify": "start", "direction": "column"}, "children": [{"type": "Text", "props": {"text": "\ud83d\udd0d SEO Friendly", "size": "lg", "weight": "bold", "color": "white", "align": "left", "italic": false, "underline": false, "font": null}}, {"type": "Text", "props": {"text": "Built-in support for metadata and head tags", "size": "md", "weight": "normal", "color": "#94a3b8", "align": "left", "italic": false, "underline": false, "font": null}}]}, {"type": "Container", "props": {"width": "auto", "height": "auto", "padding": 20, "margin": 0, "background": "#1e293b", "border": null, "rounded": 12, "shadow": null, "align": "stretch", "justify": "start", "direction": "column"}, "children": [{"type": "Text", "props": {"text": "\ud83d\udce6 Single Build Output", "size": "lg", "weight": "bold", "color": "white", "align": "left", "italic": false, "underline": false, "font": null}}, {"type": "Text", "props": {"text": "Compiles to index.html + dreamweb.js", "size": "md", "weight": "normal", "color": "#94a3b8", "align": "left", "italic": false, "underline": false, "font": null}}]}]}]}]}]}]}]}]};
    const runtime = new DreamWebRuntime(document.getElementById('app'));
    runtime.init(componentTree);
})();
