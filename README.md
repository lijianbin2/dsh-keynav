# Keyboard navigation（键盘导航）

Five keyboard behaviours for DSH navigation, and nothing else.

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
| `Ctrl + J` | `Ctrl + Alt + J` | Returns to the Conversation and puts the caret in the current Session's input box. With no Session presented, restores the first row of the anchored workspace and focuses it. |
| `↑` / `↓` in an empty composer | same fixed local input | Recalls the most recent sent message; repeated `↑` goes older, `↓` goes newer and clears the draft after the newest item. Edited text is never clobbered. |
| `Ctrl + M` | `Ctrl + Alt + M` | Opens DSH's official model selector (`/model`) without changing the current draft. |

On macOS `Ctrl` is `Cmd` (`primary`). The six editable commands appear in
**Settings → General → Keyboard shortcuts**, where they can be rebound, cleared,
or restored; the plugin's panel shows their effective keycaps. Message-history
`↑`/`↓` are fixed local input and appear as read-only rows, because the shortcut
service reserves bare arrow keys for text editing.

## Message history and model selection

Message history reads the official Chat projection, in durable event order. It
includes ordinary user messages and human steering messages, but not injected
context, notices, or subagent rows. Only text from the **currently loaded**
history is recalled; images and attachments are not restored. The cursor is
per-Session and resets as soon as the recalled text is edited.

`Ctrl + M` opens the same `/model` contribution used by the slash menu. The
launcher uses a collapsed synthetic span, so opening the picker, choosing a
model, or pressing Escape leaves an existing draft untouched. Addressed
subagent Sessions do not expose Agent-bound model selection and are left alone.

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

## Why some arrow defaults are Desktop-only

The shortcut service treats the plugin/session arrow chords as reserved for
text editing on the Web/Linux validation path, so those defaults ship for
`desktop:windows` and `desktop:macos` only; `Ctrl + J` and `Ctrl + M` also keep a
`desktop:linux` default. On Web, the plugin/session arrows are unbound until the
user assigns an admitted combination such as `Ctrl + Alt + ↑`.

Message-history `↑`/`↓` are different: they are fixed local input observed after
the composer's own controls, so they work on Web too and only act when the
composer is empty (or still exactly matches the recalled item). `Ctrl + M` uses
`Ctrl + Alt + M` on Web because bare `Ctrl + M` is not an admitted browser
binding.

On Desktop the native keyboard bridge intercepts an accepted chord before the
page sees it, so `Ctrl + ↑` inside the message input navigates the plugin area
instead of moving the caret by paragraph. That is the intended trade for these
bindings; rebind them if it gets in the way. The commands stand aside (the key is
left alone) while a dialog is open and while a terminal has focus.

## The panel

The **键盘导航 / Keyboard navigation** row in the left sidebar (order 40) opens a small page that
lists all five behaviours with their live keycaps. It is a reference page — the
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
- With no Session presented, `Alt + ↑/↓` enters the anchored workspace list and
  `Ctrl + J` restores its first row; `Ctrl + M` and message history do nothing
  until a Session is presented (the shortcut service does not surface a blocked
  reason).
- Message history covers only text in the currently loaded Chat window; older
  pages are not fetched by the arrow gesture, and images/attachments are not
  restored.
- The plugin only runs in the browser half: no Host service, no model request, no
  network traffic. Disabling it removes the sidebar row, the panel, and all eight
  commands; saved editable-key overrides stay in the keybinding store for a
  reinstall.
- Copy ships in English, Chinese, Japanese, Spanish, French, German, Russian, and
  Portuguese; other UI languages fall back to English.
- Publishing steps for the DSH plugin markets are in [PUBLISH.md](PUBLISH.md).
