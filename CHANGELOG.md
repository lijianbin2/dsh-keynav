# Changelog

## 1.1.0

- **Session stepping now stays inside the current workspace.** `Alt+↑ / Alt+↓`
  walks the rows of the workspace that owns the visible Session, in the
  sidebar's default last-update order (selected blank first, then pinned, then
  newest activity), and never crosses into another workspace.
- Session stepping skips archived sessions and subagent children, matching the
  sidebar's default archived filter.
- Dictionaries for Spanish, French, German, Russian, and Portuguese.
- `meta.detail` document with a feature image for the bundle detail page.
- Package metadata for the plugin market: license, keywords, `engines.dsh`.
- One stand-aside guard for dialogs and terminals instead of two checks.

## 1.0.0

- First release: `Ctrl+↑ / Ctrl+↓` cycle the sidebar plugin area (Conversation
  first), `Alt+↑ / Alt+↓` move between sessions, `Ctrl+J` focuses the current
  Session's message input.
- Sidebar entry with a keycap reference page showing the effective keycaps.
- English, Chinese, and Japanese dictionaries.
