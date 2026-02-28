# DreamWeb TODO

> Structured around the [upgrade_plan.md](./upgrade_plan.md). Work top-to-bottom — later phases depend on earlier ones.

---

## ✅ Completed

- [x] Remove useless files (cli_usage_guide.md, docs_site.py, index.html, web/dreamweb.js, main.py, uv.lock)
- [x] Verify core functionality still works after cleanup
- [x] Maintain clean project structure with only essential files

---

## 🔴 Phase 1 — Critical Architecture Fixes

### 1.1 Replace Handler Serialization

- [x] Decide on runtime strategy: **persistent Python server** (WebSocket as single runtime for dev + prod)
- [x] If Pyodide: bundle user's Python source in production build and load via Pyodide in browser
- [x] If server-mode: WebSocket server serves both dev and prod; `builder.py` outputs `server.py` launcher
- [x] Remove `_serialize_handler()` and all `inspect.getsource()` hacks from `core/app.py`
- [x] Remove `new Function('state', handlerCode)` from `runtime/runtime.js`
- [x] Remove hardcoded `self.count.set` → `state.count.set` string replacements

### 1.2 Fix Dev/Prod Parity

- [x] Ensure event handlers execute via the same code path in both dev and prod
- [x] Write a test that runs the same event handler scenarios in both modes

### 1.3 Virtual DOM Diffing

- [x] Replace `this.root.innerHTML = ''` full re-render in `runtime.js` with a tree-diff algorithm
- [x] Add `key` prop support to all widgets for efficient keyed reconciliation
- [x] Implement `diff(oldTree, newTree)` → patch list → apply patches to real DOM
- [ ] Verify: input focus is not lost on state change (manual)
- [ ] Verify: scroll position is preserved on state change (manual)

---

## 🟡 Phase 2 — Developer Experience

### 2.1 True Hot Module Replacement

- [x] Use `importlib.reload()` to reload the user's app module on file change in `dev_server.py`
- [x] Preserve state values across reloads (hot state preservation)
- [ ] Show a visible reload toast/banner in the browser on hot reload

### 2.2 JS Minification

- [ ] Add `rjsmin` or `jsmin` as an optional dev dependency (Phase 2)
- [ ] Run minification on `dreamweb.js` during `builder.py` production build
- [ ] Remove the `# TODO: Minify JS in production` comment once done

### 2.3 Error Boundaries

- [x] Wrap every `build()` call in `try/except` in both `dev_server.py` and `builder.py`
- [x] In dev mode: render a styled Python traceback overlay in the browser
- [ ] In prod mode: render a graceful fallback widget (not a blank page)

### 2.4 CLI Commands

- [ ] `dreamweb init <name>` — scaffold a new project with boilerplate `main.py`
- [ ] `dreamweb dev` — start dev server (replace inline `run(dev=True)`)
- [ ] `dreamweb build` — production build (replace inline `run(dev=False)`)
- [ ] `dreamweb doctor` — environment diagnostics (check Python version, dependencies)

---

## 🟢 Phase 3 — Widget Ecosystem

### Layout

- [ ] `Grid` — CSS Grid-based layout widget
- [ ] `ScrollView` — overflow-scrollable container
- [ ] `Responsive` — breakpoint-aware container (`sm`, `md`, `lg`, `xl`)
- [ ] `Drawer` — slide-out side panel
- [ ] `Tab` / `TabView` — tabbed interface
- [ ] `Accordion` — collapsible sections
- [ ] `Masonry` — Pinterest-style masonry layout

### Navigation — Complete the Router

- [ ] Implement hash-based (`#/path`) or History API (`/path`) client-side routing
- [ ] Add `Router`, `Route`, and `Navigate` widgets
- [ ] Ensure state survives route transitions (no full re-render on navigation)
- [ ] Add `Breadcrumbs` and `Pagination` widgets

### Feedback & Overlays

- [ ] `Modal` / `Dialog`
- [ ] `Toast` / `Snackbar`
- [ ] `Tooltip`
- [ ] `Spinner` / `ProgressBar`
- [ ] `Alert` / `Banner`

### Input Widgets

- [ ] `DatePicker`
- [ ] `TimePicker`
- [ ] `FileUpload` with drag-and-drop support
- [ ] `ColorPicker`
- [ ] `MultiSelect`
- [ ] `RichText` editor

### Media

- [ ] `Audio` playback widget
- [ ] `Gallery` — image gallery
- [ ] `Chart` — Chart.js integration

---

## 🔵 Phase 4 — State Management

- [ ] `GlobalState` / `Store` — shared app state (no prop-drilling)
- [ ] Allow widgets to subscribe to slices of global state
- [ ] `Computed` — derived/computed state values (`Computed(lambda: self.count.value * 2)`)
- [ ] `PersistentState` — auto-persist to `localStorage` / `sessionStorage`
- [ ] Undo/redo support via state history
- [ ] State debugging tools (time-travel debugging)

---

## 🟣 Phase 5 — Security & Hardening

- [ ] Remove `new Function()` / `eval()` from `runtime.js` entirely (blocked by Phase 1)
- [ ] Add `sanitize=True` parameter to `Html()` widget, integrate DOMPurify
- [ ] Generate strict Content Security Policy `<meta>` header in `builder.py`
- [ ] Add CSRF protection helpers for form submissions
- [ ] Add `XSS` protection utilities for user-generated content
- [ ] Add HTTPS enforcement helpers
- [ ] Document security model and CSP compatibility

---

## 📋 Phase 6 — Testing & Documentation

### Tests

- [x] Unit tests for all widget `to_dict()` serialization (Phase 1 tests)
- [x] Unit tests for `State` subscription and `_trigger_rebuild`
- [x] Integration tests for `DevServer` (mock WS events via `_handle_event`, verify tree updates)
- [ ] Snapshot/golden file tests for `Builder` HTML/JS output
- [ ] End-to-end tests with Playwright

### Documentation

- [ ] Set up MkDocs or Sphinx with autodoc from existing docstrings
- [ ] Tutorial: Hello World → Counter → Todo App → API integration
- [ ] Widget reference with live examples
- [ ] Migration guide for future breaking changes
- [ ] Host docs via GitHub Pages (`.github` already present)
