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
- **`↑` / `↓` recall sent messages from an empty composer.** Repeated `↑` goes
  older, `↓` goes newer and clears the draft after the newest item; editing a
  recalled message hands the arrows back to the editor. Reads the official Chat
  projection and restores text only from currently loaded history.
- **`Ctrl+M` opens DSH's official model selector** without changing an existing
  draft. Uses `Ctrl+Alt+M` on Web, where bare `Ctrl+M` is not an admitted binding.
- The sidebar reference page now lists message history and model selection, with
  live editable keycaps and read-only fixed-arrow rows.
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
