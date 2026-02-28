// DreamWeb Runtime
// Pure renderer + WebSocket client.
// All application logic executes server-side in Python.
// This file handles: rendering, virtual DOM diffing, and event forwarding.

// ---------------------------------------------------------------------------
// Virtual DOM helpers
// ---------------------------------------------------------------------------

/**
 * Diff two vdom trees and return a list of patch operations.
 * Patches: { type, ... }  where type is one of:
 *   REPLACE       – replace the whole DOM node
 *   UPDATE_PROPS  – update only changed props / style
 *   UPDATE_TEXT   – update a text node value
 *   SET_CHILDREN  – reconcile children list
 */
function diff(oldNode, newNode) {
    if (!oldNode) return [{ type: 'REPLACE', newNode }];
    if (!newNode) return [{ type: 'REMOVE' }];

    // Different types → full replace
    if (oldNode.type !== newNode.type) {
        return [{ type: 'REPLACE', newNode }];
    }

    const patches = [];

    // Text node diff
    if (newNode.type === 'TextNode') {
        if (oldNode.text !== newNode.text) {
            patches.push({ type: 'UPDATE_TEXT', text: newNode.text });
        }
        return patches;
    }

    // Props diff
    const propPatches = diffProps(oldNode.props || {}, newNode.props || {});
    if (Object.keys(propPatches).length > 0) {
        patches.push({ type: 'UPDATE_PROPS', props: propPatches });
    }

    // Events diff
    const oldEvents = oldNode.events || {};
    const newEvents = newNode.events || {};
    if (JSON.stringify(oldEvents) !== JSON.stringify(newEvents)) {
        patches.push({ type: 'UPDATE_EVENTS', events: newEvents });
    }

    // Children diff
    const oldChildren = oldNode.children || [];
    const newChildren = newNode.children || [];
    patches.push({ type: 'SET_CHILDREN', oldChildren, newChildren });

    return patches;
}

function diffProps(oldProps, newProps) {
    const changes = {};
    const allKeys = new Set([...Object.keys(oldProps), ...Object.keys(newProps)]);
    for (const key of allKeys) {
        if (key === 'children') continue;
        if (JSON.stringify(oldProps[key]) !== JSON.stringify(newProps[key])) {
            changes[key] = newProps[key];
        }
    }
    return changes;
}

// ---------------------------------------------------------------------------
// DreamWebRuntime
// ---------------------------------------------------------------------------

class DreamWebRuntime {
    constructor(rootElement) {
        this.root = rootElement;
        this.componentTree = null;  // current vdom tree
        this.ws = null;
        this._domMap = new WeakMap(); // vdom node → real DOM node (for patching)
    }

    // -------------------------------------------------------------------------
    // Connection
    // -------------------------------------------------------------------------

    /** Dev mode: server provides the initial tree over HTTP, WS handles updates */
    init(componentTree, initialStates = {}) {
        this.componentTree = componentTree;
        this._render();
        this.setupHotReload();
    }

    /** Prod mode: connect to WS server which sends the initial tree */
    connectAndInit(host, wsPort) {
        const wsUrl = `ws://${host}:${wsPort}`;
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
            console.log('🔌 Connected to DreamWeb server');
            // Request the initial tree
            this.ws.send(JSON.stringify({ type: 'init' }));
        };

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this._handleServerMessage(data);
        };

        this.ws.onclose = () => {
            console.log('🔌 Disconnected — reconnecting in 1s...');
            setTimeout(() => this.connectAndInit(host, wsPort), 1000);
        };

        this.ws.onerror = (err) => {
            console.error('WebSocket error:', err);
        };
    }

    setupHotReload() {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            const wsPort = parseInt(window.location.port) + 1;
            this.ws = new WebSocket(`ws://${window.location.hostname}:${wsPort}`);

            this.ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this._handleServerMessage(data);
            };

            this.ws.onclose = () => {
                setTimeout(() => this.setupHotReload(), 1000);
            };
        }
    }

    _handleServerMessage(data) {
        if (data.type === 'reload' || data.type === 'init_tree') {
            const newTree = data.tree;
            if (!this.componentTree) {
                // First render
                this.componentTree = newTree;
                this._render();
            } else {
                this._patch(this.root.firstChild, this.componentTree, newTree);
                this.componentTree = newTree;
            }
            if (data.type === 'reload') console.log('🔄 Hot reload applied');
        }
    }

    // -------------------------------------------------------------------------
    // Rendering
    // -------------------------------------------------------------------------

    _render() {
        this.root.innerHTML = '';
        const el = this.createElement(this.componentTree);
        if (el) this.root.appendChild(el);
    }

    /**
     * Patch a real DOM node given old and new vdom nodes.
     * Returns the (possibly replaced) DOM node.
     */
    _patch(domNode, oldNode, newNode) {
        const patches = diff(oldNode, newNode);

        for (const patch of patches) {
            if (patch.type === 'REPLACE') {
                const newDom = this.createElement(patch.newNode);
                if (domNode && domNode.parentNode) {
                    domNode.parentNode.replaceChild(newDom, domNode);
                }
                domNode = newDom;
            } else if (patch.type === 'REMOVE') {
                if (domNode && domNode.parentNode) {
                    domNode.parentNode.removeChild(domNode);
                }
                domNode = null;
            } else if (patch.type === 'UPDATE_TEXT') {
                domNode.textContent = patch.text;
            } else if (patch.type === 'UPDATE_PROPS') {
                this._applyPropUpdates(domNode, oldNode, patch.props);
            } else if (patch.type === 'UPDATE_EVENTS') {
                domNode = this._reattachEvents(domNode, patch.events);
            } else if (patch.type === 'SET_CHILDREN') {
                this._reconcileChildren(domNode, patch.oldChildren, patch.newChildren);
            }
        }

        return domNode;
    }

    /**
     * Reconcile a DOM node's children list.
     * Uses the `key` prop for stable matching when present.
     */
    _reconcileChildren(parentDom, oldChildren, newChildren) {
        const oldKeyed = new Map();
        const oldIndexed = [];

        oldChildren.forEach((child, i) => {
            const key = child && child.props && child.props.key;
            if (key != null) {
                oldKeyed.set(String(key), { vnode: child, dom: parentDom.childNodes[i] });
            } else {
                oldIndexed.push({ vnode: child, dom: parentDom.childNodes[i] });
            }
        });

        const usedKeys = new Set();
        const newDoms = newChildren.map((newChild) => {
            if (!newChild) return null;
            const key = newChild.props && newChild.props.key;
            if (key != null) {
                const strKey = String(key);
                usedKeys.add(strKey);
                if (oldKeyed.has(strKey)) {
                    const { vnode: oldChild, dom: oldDom } = oldKeyed.get(strKey);
                    return this._patch(oldDom, oldChild, newChild);
                }
                // New keyed node — create fresh
                return this.createElement(newChild);
            }
            // Unkeyed — match by index
            const match = oldIndexed.shift();
            if (match) {
                return this._patch(match.dom, match.vnode, newChild);
            }
            return this.createElement(newChild);
        });

        // Remove old keyed nodes no longer present
        for (const [k, { dom }] of oldKeyed) {
            if (!usedKeys.has(k) && dom && dom.parentNode) dom.parentNode.removeChild(dom);
        }
        // Remove leftover unmatched old indexed nodes
        for (const { dom } of oldIndexed) {
            if (dom && dom.parentNode) dom.parentNode.removeChild(dom);
        }

        // Re-order/append new nodes
        newDoms.forEach((newDom, i) => {
            if (!newDom) return;
            const current = parentDom.childNodes[i];
            if (current !== newDom) {
                parentDom.insertBefore(newDom, current || null);
            }
        });
    }

    _applyPropUpdates(domNode, oldVNode, changedProps) {
        // Re-apply all styles by rebuilding from scratch on the node type
        const type = oldVNode && oldVNode.type;
        const mergedProps = Object.assign({}, (oldVNode && oldVNode.props) || {}, changedProps);

        // Update textContent if it changed
        if (changedProps.text !== undefined && (type === 'Text' || type === 'Heading')) {
            domNode.textContent = changedProps.text;
        }

        switch (type) {
            case 'Container': this.applyContainerStyles(domNode, mergedProps); break;
            case 'Row': this.applyRowStyles(domNode, mergedProps); break;
            case 'Column': this.applyColumnStyles(domNode, mergedProps); break;
            case 'Text': case 'Heading': this.applyTextStyles(domNode, mergedProps); break;
        }
    }

    _reattachEvents(domNode, events) {
        // Clone node to remove all existing listeners, then re-attach
        const clone = domNode.cloneNode(true);
        if (domNode.parentNode) {
            domNode.parentNode.replaceChild(clone, domNode);
        }
        this.attachEvents(clone, events);
        return clone;
    }

    // -------------------------------------------------------------------------
    // Element creation (same as before, unchanged API surface)
    // -------------------------------------------------------------------------

    createElement(component) {
        if (!component) return document.createTextNode('');

        if (component.type === 'TextNode') {
            return document.createTextNode(component.text || '');
        }

        let element;

        switch (component.type) {
            case 'Container':
                element = document.createElement('div');
                this.applyContainerStyles(element, component.props);
                break;
            case 'Row':
                element = document.createElement('div');
                this.applyRowStyles(element, component.props);
                break;
            case 'Column':
                element = document.createElement('div');
                this.applyColumnStyles(element, component.props);
                break;
            case 'Center':
                element = document.createElement('div');
                element.style.cssText = 'display:flex;align-items:center;justify-content:center;width:100%;height:100%;';
                break;
            case 'Stack':
                element = document.createElement('div');
                element.style.cssText = 'position:relative;width:100%;height:100%;';
                break;
            case 'Spacer':
                element = document.createElement('div');
                element.style.flex = component.props && component.props.size ? `0 0 ${component.props.size}px` : '1';
                break;
            case 'Text':
                element = document.createElement('span');
                this.applyTextStyles(element, component.props);
                element.textContent = (component.props && component.props.text) || '';
                break;
            case 'Heading':
                element = document.createElement(`h${(component.props && component.props.level) || 1}`);
                this.applyTextStyles(element, component.props);
                element.textContent = (component.props && component.props.text) || '';
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
                element.innerHTML = (component.props && component.props.html) || '';
                break;
            case 'Css':
                element = document.createElement('style');
                element.textContent = (component.props && component.props.css) || '';
                break;
            case 'ApiRequest':
            case 'FetchData':
                element = document.createElement('div');
                element.style.display = 'none';
                this.handleApiRequest(component);
                break;
            default:
                console.warn(`Unknown component type: ${component.type}`);
                element = document.createElement('div');
        }

        // Render children
        if (component.children && component.children.length > 0) {
            if (!['Button', 'TextField', 'Checkbox', 'Image', 'Css'].includes(component.type)) {
                component.children.forEach(child => {
                    const childEl = this.createElement(child);
                    if (childEl) element.appendChild(childEl);
                });
            }
        }

        // Attach event handlers (forwarded to Python server via WS)
        if (component.events) {
            this.attachEvents(element, component.events);
        }

        return element;
    }

    // -------------------------------------------------------------------------
    // Style application
    // -------------------------------------------------------------------------

    applyContainerStyles(element, props) {
        if (!props) return;
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
        if (!props) return;
        Object.assign(element.style, {
            display: 'flex',
            flexDirection: 'row',
            alignItems: this.mapAlign(props.align),
            justifyContent: this.mapJustify(props.justify),
            gap: `${props.spacing || 0}px`,
            flexWrap: props.wrap ? 'wrap' : 'nowrap',
        });
    }

    applyColumnStyles(element, props) {
        if (!props) return;
        Object.assign(element.style, {
            display: 'flex',
            flexDirection: 'column',
            alignItems: this.mapAlign(props.align),
            justifyContent: this.mapJustify(props.justify),
            gap: `${props.spacing || 0}px`,
        });
    }

    applyTextStyles(element, props) {
        if (!props) return;
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

    // -------------------------------------------------------------------------
    // Widget creators
    // -------------------------------------------------------------------------

    createButton(component) {
        const button = document.createElement('button');
        const props = component.props || {};
        button.textContent = props.text || '';
        Object.assign(button.style, {
            padding: this.parseButtonSize(props.size),
            fontSize: this.parseButtonFontSize(props.size),
            borderRadius: props.rounded ? '0.375rem' : '0',
            border: 'none',
            cursor: props.disabled ? 'not-allowed' : 'pointer',
            opacity: props.disabled ? '0.5' : '1',
            fontWeight: '500',
            transition: 'all 0.2s',
        });
        Object.assign(button.style, this.getButtonColors(props.color, props.variant));
        if (!props.disabled) {
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
        const props = component.props || {};
        input.type = props.type || 'text';
        input.placeholder = props.placeholder || '';
        input.value = props.value || '';
        input.disabled = props.disabled || false;
        Object.assign(input.style, {
            padding: '0.5rem 0.75rem',
            fontSize: '1rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            outline: 'none',
            transition: 'all 0.2s',
        });
        input.addEventListener('focus', () => {
            input.style.borderColor = '#3b82f6';
            input.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)';
        });
        input.addEventListener('blur', () => {
            input.style.borderColor = '#d1d5db';
            input.style.boxShadow = 'none';
        });
        return input;
    }

    createCheckbox(component) {
        const label = document.createElement('label');
        Object.assign(label.style, { display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' });
        const input = document.createElement('input');
        const props = component.props || {};
        input.type = 'checkbox';
        input.checked = props.checked || false;
        input.disabled = props.disabled || false;
        const span = document.createElement('span');
        span.textContent = props.label || '';
        label.appendChild(input);
        label.appendChild(span);
        return label;
    }

    createImage(component) {
        const img = document.createElement('img');
        const props = component.props || {};
        img.src = props.src || '';
        img.alt = props.alt || '';
        const styles = {};
        if (props.width) styles.width = this.parseSize(props.width);
        if (props.height) styles.height = this.parseSize(props.height);
        if (props.fit) styles.objectFit = props.fit;
        if (props.rounded) styles.borderRadius = this.parseRounded(props.rounded);
        Object.assign(img.style, styles);
        return img;
    }

    createLink(component) {
        const a = document.createElement('a');
        const props = component.props || {};
        a.href = props.to || '#';
        a.textContent = props.text || '';
        Object.assign(a.style, {
            color: this.parseColor(props.color),
            textDecoration: props.underline ? 'underline' : 'none',
        });
        return a;
    }

    // -------------------------------------------------------------------------
    // Event handling — all events forwarded to Python via WebSocket
    // -------------------------------------------------------------------------

    attachEvents(element, events) {
        if (!events) return;
        if (events.click) {
            element.addEventListener('click', () => this._sendEvent('click', events.click, null));
        }
        if (events.change) {
            element.addEventListener('change', (e) => this._sendEvent('change', events.change, e.target.value));
        }
        if (events.input) {
            element.addEventListener('input', (e) => this._sendEvent('input', events.input, e.target.value));
        }
    }

    _sendEvent(eventType, handlerId, value) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type: 'event', event: eventType, handler: handlerId, value }));
        } else {
            console.warn('DreamWeb: WebSocket not connected — event dropped:', eventType, handlerId);
        }
    }

    // -------------------------------------------------------------------------
    // API request widget (browser-side only, not forwarded to Python)
    // -------------------------------------------------------------------------

    async handleApiRequest(component) {
        const props = component.props || {};
        const { url, method, headers, body, auto_fetch, credentials, callbacks } = props;
        if (auto_fetch === false) return;

        try {
            if (callbacks && callbacks.on_loading) this._sendEvent('api_loading', callbacks.on_loading, true);

            const fetchOptions = {
                method: (method || 'GET').toUpperCase(),
                headers: { 'Content-Type': 'application/json', ...(headers || {}) },
                credentials: credentials || 'same-origin',
            };
            if (body && !['GET', 'HEAD'].includes(fetchOptions.method)) {
                fetchOptions.body = typeof body === 'object' ? JSON.stringify(body) : body;
            }

            const response = await fetch(url, fetchOptions);
            if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

            const contentType = response.headers.get('content-type') || '';
            let data;
            if (contentType.includes('application/json')) data = await response.json();
            else if (contentType.includes('text/')) data = await response.text();
            else data = await response.blob();

            if (callbacks && callbacks.on_loading) this._sendEvent('api_loading', callbacks.on_loading, false);
            if (callbacks && callbacks.on_success) this._sendEvent('api_success', callbacks.on_success, data);
        } catch (error) {
            if (callbacks && callbacks.on_loading) this._sendEvent('api_loading', callbacks.on_loading, false);
            if (callbacks && callbacks.on_error) this._sendEvent('api_error', callbacks.on_error, { message: error.message, name: error.name });
            console.error('DreamWeb API Error:', error);
        }
    }

    // -------------------------------------------------------------------------
    // Style utilities
    // -------------------------------------------------------------------------

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
        const colorMap = {
            'primary': '#3b82f6', 'secondary': '#6b7280', 'success': '#10b981',
            'danger': '#ef4444', 'warning': '#f59e0b', 'info': '#06b6d4',
            'black': '#000000', 'white': '#ffffff', 'gray': '#6b7280',
            'red': '#ef4444', 'blue': '#3b82f6', 'green': '#10b981',
            'yellow': '#f59e0b', 'purple': '#8b5cf6', 'pink': '#ec4899',
        };
        if (color && color.startsWith('gradient-')) {
            const parts = color.replace('gradient-', '').split('-');
            if (parts.length >= 2) {
                const from = colorMap[parts[0]] || parts[0];
                const to = colorMap[parts[parts.length - 1]] || parts[parts.length - 1];
                return `linear-gradient(135deg, ${from}, ${to})`;
            }
        }
        return colorMap[color] || color;
    }

    parseFontSize(size) {
        const m = { xs: '0.75rem', sm: '0.875rem', md: '1rem', lg: '1.125rem', xl: '1.25rem', '2xl': '1.5rem', '3xl': '1.875rem', '4xl': '2.25rem' };
        return m[size] || (typeof size === 'number' ? `${size}px` : size);
    }

    parseFontWeight(weight) {
        const m = { normal: '400', medium: '500', semibold: '600', bold: '700' };
        return m[weight] || weight;
    }

    parseRounded(rounded) {
        if (typeof rounded === 'boolean') return rounded ? '0.375rem' : '0';
        if (typeof rounded === 'number') return `${rounded}px`;
        return rounded;
    }

    parseShadow(shadow) {
        const m = {
            sm: '0 1px 2px 0 rgba(0,0,0,0.05)',
            md: '0 4px 6px -1px rgba(0,0,0,0.1)',
            lg: '0 10px 15px -3px rgba(0,0,0,0.1)',
            xl: '0 20px 25px -5px rgba(0,0,0,0.1)',
            '2xl': '0 25px 50px -12px rgba(0,0,0,0.25)',
            none: 'none',
        };
        return m[shadow] || shadow;
    }

    parseButtonSize(size) {
        const m = { sm: '0.5rem 1rem', md: '0.625rem 1.25rem', lg: '0.75rem 1.5rem', xl: '1rem 2rem' };
        return m[size] || m['md'];
    }

    parseButtonFontSize(size) {
        const m = { sm: '0.875rem', md: '1rem', lg: '1.125rem', xl: '1.25rem' };
        return m[size] || m['md'];
    }

    getButtonColors(color, variant) {
        const base = this.parseColor(color);
        if (variant === 'outline') return { background: 'transparent', color: base, border: `2px solid ${base}` };
        if (variant === 'ghost') return { background: 'transparent', color: base, border: 'none' };
        if (variant === 'link') return { background: 'transparent', color: base, border: 'none', textDecoration: 'underline' };
        return { background: base, color: '#ffffff', border: 'none' };
    }

    applyBorder(element, border) {
        if (typeof border === 'number') {
            element.style.border = `${border}px solid #d1d5db`;
        } else if (typeof border === 'object') {
            const { width = 1, color = '#d1d5db', style = 'solid' } = border;
            element.style.border = `${width}px ${style} ${color}`;
        }
    }

    mapAlign(align) {
        const m = { start: 'flex-start', center: 'center', end: 'flex-end', stretch: 'stretch' };
        return m[align] || 'stretch';
    }

    mapJustify(justify) {
        const m = { start: 'flex-start', center: 'center', end: 'flex-end', between: 'space-between', around: 'space-around' };
        return m[justify] || 'flex-start';
    }
}

// ---------------------------------------------------------------------------
// Expose globally
// ---------------------------------------------------------------------------
if (typeof window !== 'undefined') {
    window.DreamWebRuntime = DreamWebRuntime;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DreamWebRuntime;
}
