# Keyboard navigation（键盘导航）

Three keyboard behaviours for DSH navigation, and nothing else.

## Install

```sh
dsh plugin add dsh-keynav
# or straight from this repository, before the npm release:
dsh plugin add git+https://github.com/lijianbin2/dsh-keynav.git
```

In the Web GUI the same bundle also installs from **Plugins → Add plugin** with a
local directory. Requires DSH `>=0.2.2-rc.5 <0.3.0-0`.

## Behaviours

| Keys (Windows / macOS Desktop) | Keys (Web) | What it does |
| --- | --- | --- |
| `Ctrl + ↑` / `Ctrl + ↓` | unbound by default | Moves the selection inside the **plugin area**: the sidebar's panel rows in their row order, with the Conversation as the first stop. Wraps at both ends. |
| `Alt + ↑` / `Alt + ↓` | unbound by default | Moves through the **sessions of the current workspace** — never across workspaces. One Session per press, wrapping inside that workspace. |
| `Ctrl + J` | `Ctrl + Alt + J` | Returns to the Conversation and puts the caret in the current Session's input box. |

On macOS `Ctrl` is `Cmd` (`primary`). All five commands appear in
**Settings → General → Keyboard shortcuts**, where they can be rebound, cleared,
or restored; the plugin's panel shows the effective keycaps.

## Which sessions Alt+↑ / Alt+↓ walks

The workspace of the Session you are looking at, with the same rows the sidebar
shows in its default view:

1. the selected blank **New Session** row, if one belongs to this workspace;
2. then **pinned** sessions;
3. then the rest, newest activity first;
4. with **archived** sessions and **subagent** children left out (the default
   archived filter hides them).

The sidebar's Workspace group must be the same one you are in; if the current
Session sits in the **Ungrouped** bucket, the step stays inside that bucket.

## Why the arrow chords are Windows/macOS Desktop only

The shortcut service treats bare arrow keys as reserved for text editing on the
Web/Linux validation path, so declaring such a default there fails registration
outright. The arrow commands therefore ship `desktop:windows` and
`desktop:macos` defaults only; `Ctrl + J` also keeps a `desktop:linux` default.
On Web (and Linux Desktop) bind the arrows yourself in the shortcut settings with
a combination the browser admits, for example `Ctrl + Alt + ↑`.

On Desktop the native keyboard bridge intercepts an accepted chord before the
page sees it, so `Ctrl + ↑` inside the message input navigates the plugin area
instead of moving the caret by paragraph. That is the intended trade for these
bindings; rebind them if it gets in the way. The commands stand aside (the key is
left alone) while a dialog is open and while a terminal has focus.

## The panel

The **键盘导航 / Keyboard navigation** row in the left sidebar (order 40) opens a small page that
lists the three behaviours with their live keycaps. It is a reference page — the
plugin adds no other UI.

## Limits

- Session order reproduces the sidebar's default **sort by last update** mode.
  When the sidebar is switched to **manual order**, the step still walks newest
  first rather than your arrangement; the browser keeps that order privately.
- A workspace with a single Session does nothing on `Alt + ↑/↓` (there is
  nowhere to go).
- The plugin-area cycle covers every registered panel entry. After a panel is
  unpinned into the sidebar's **More** menu it stays in the cycle, because that
  pin list is private to the sidebar.
- With no Session presented, `Alt + ↑/↓` and `Ctrl + J` do nothing (the shortcut
  service does not surface a blocked reason).
- The plugin only runs in the browser half: no Host service, no model request, no
  network traffic. Disabling it removes the sidebar row, the panel, and all five
  commands; saved key overrides stay in the keybinding store for a reinstall.
- Copy ships in English, Chinese, Japanese, Spanish, French, German, Russian, and
  Portuguese; other UI languages fall back to English.
- Publishing steps for the DSH plugin markets are in [PUBLISH.md](PUBLISH.md).
