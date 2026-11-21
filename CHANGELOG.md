# Changelog

## 1.1.0

- **Session stepping stays inside the current workspace.** `Alt+↑ / Alt+↓` walks
  the rows of the workspace that owns the visible Session, in the sidebar's
  default last-update order (selected blank first, then pinned, then newest
  activity), and never crosses into another workspace.
- **Session stepping works with no Session presented.** Archiving the open
  conversation leaves the blank New Session page in the middle column; the step
  now enters that workspace's list from the side the arrow points at, and a
  presented-but-archived Session is handled the same way.
- **`Ctrl+J` restores a Session when none is presented**, then focuses its input
  once the Conversation mounts.
- Session stepping skips archived sessions and subagent children, matching the
  sidebar's default archived filter.
- The workspace lookup builds one Session→Workspace index per press instead of
  searching every workspace per Session.
- Dictionaries for Spanish, French, German, Russian, and Portuguese.
- `meta.detail` document with a feature image for the bundle detail page, and a
  raster `assets/icon-180.png` storefront tile for the plugin markets.
- Package metadata for the plugin market: license, keywords, `engines.dsh`, and
  `repository`.
- One stand-aside guard for dialogs and terminals instead of two checks.

## 1.0.0

- First release: `Ctrl+↑ / Ctrl+↓` cycle the sidebar plugin area (Conversation
  first), `Alt+↑ / Alt+↓` move between sessions, `Ctrl+J` focuses the current
  Session's message input.
- Sidebar entry with a keycap reference page showing the effective keycaps.
- English, Chinese, and Japanese dictionaries.
