/**
 * Browser half of the KeyNav bundle.
 *
 * Three behaviours, five editable commands:
 *
 *   Ctrl+↑ / Ctrl+↓  move the selection inside the plugin area — the sidebar's
 *                    panel rows, with the Conversation as the first stop.
 *   Alt+↑  / Alt+↓   move through the session area, one Session per press.
 *   Ctrl+J           put the caret back in the current Session's input box.
 *
 * The arrow commands declare Desktop defaults only: the shortcut service
 * reserves bare arrow keys for text editing on Web/Linux, so such a default
 * would be rejected at registration. Ctrl+J keeps a Web default.
 *
 * Every command resolves its target in `resolve` and acts in `run`, which is the
 * contract the shortcut service expects.
 *
 * No Harness Client package is imported: React and its hooks come from the
 * browser module table, every colour is a host theme token, and the small
 * component-local stylesheet is rendered as an element so unmounting removes it.
 */
window.__ModuleLoader__.load({
  id: 'dsh-keynav',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const { useSyncExternalStore } = React

    /** Dictionary namespace owned by this plugin. */
    const NS = 'keynav'
    /** Id shared by the sidebar row and the main panel it opens. */
    const PANEL_ID = 'keynav'
    /** Stable empty catalog so `useSyncExternalStore` never sees a fresh array. */
    const EMPTY_CATALOG = Object.freeze([])

    const PANEL_PREVIOUS = 'keynav.panel.previous'
    const PANEL_NEXT = 'keynav.panel.next'
    const SESSION_PREVIOUS = 'keynav.session.previous'
    const SESSION_NEXT = 'keynav.session.next'
    const FOCUS_INPUT = 'keynav.focus'

    const zh = {
      panel: '键盘导航',
      title: '键盘导航',
      subtitle: '用方向键在插件区和当前工作区的会话之间移动，按 Ctrl+J 随时回到输入框。所有键位都能在「设置 → 通用 → 快捷键」里改。',
      sectionPanels: '插件区',
      sectionSessions: '会话区 · 当前工作区',
      sectionInput: '输入框',
      panelPrevious: '上一个（含会话）',
      panelNext: '下一个',
      sessionPrevious: '上一个会话',
      sessionNext: '下一个会话',
      focusInput: '聚焦会话输入框',
      unbound: '未绑定',
      noSession: '当前工作区没有其它会话',
      desktopOnly: '方向键组合只有桌面端默认可用：浏览器把方向键保留给文本编辑。在 Web 端请到快捷键设置里自行指定组合。',
    }

    const en = {
      panel: 'Keyboard navigation',
      title: 'Keyboard navigation',
      subtitle: 'Arrow chords move through the plugin area and the current workspace’s sessions; Ctrl+J always puts the caret back in the input box. Every binding is editable in Settings → General → Keyboard shortcuts.',
      sectionPanels: 'Plugin area',
      sectionSessions: 'Session area · current workspace',
      sectionInput: 'Input box',
      panelPrevious: 'Previous (Conversation included)',
      panelNext: 'Next',
      sessionPrevious: 'Previous session',
      sessionNext: 'Next session',
      focusInput: 'Focus session input',
      unbound: 'No shortcut',
      noSession: 'This workspace has no other Session',
      desktopOnly: 'The arrow chords have Desktop defaults only: browsers reserve arrow keys for text editing. On Web, assign a combination in the shortcut settings.',
    }

    const ja = {
      panel: 'キーボード操作',
      title: 'キーボード操作',
      subtitle: '方向キーの組み合わせでプラグイン領域と現在のワークスペースのセッションを移動し、Ctrl+J でいつでも入力欄へ戻ります。キーは「設定 → 一般 → キーボード ショートカット」で変更できます。',
      sectionPanels: 'プラグイン領域',
      sectionSessions: 'セッション領域・現在のワークスペース',
      sectionInput: '入力欄',
      panelPrevious: '前へ（会話を含む）',
      panelNext: '次へ',
      sessionPrevious: '前のセッション',
      sessionNext: '次のセッション',
      focusInput: 'セッションの入力欄にフォーカス',
      unbound: '未割り当て',
      noSession: 'このワークスペースに他のセッションはありません',
      desktopOnly: '方向キーの組み合わせはデスクトップ版のみ既定で有効です。ブラウザは方向キーをテキスト編集用に予約しているため、Web では設定で割り当ててください。',
    }

    const es = {
      panel: 'Navegación con teclado',
      title: 'Navegación con teclado',
      subtitle: 'Las combinaciones con flechas recorren el área de plugins y las sesiones del espacio de trabajo actual; Ctrl+J devuelve el cursor al cuadro de entrada. Todos los atajos se cambian en Ajustes → General → Atajos de teclado.',
      sectionPanels: 'Área de plugins',
      sectionSessions: 'Área de sesiones · espacio actual',
      sectionInput: 'Cuadro de entrada',
      panelPrevious: 'Anterior (incluye la conversación)',
      panelNext: 'Siguiente',
      sessionPrevious: 'Sesión anterior',
      sessionNext: 'Sesión siguiente',
      focusInput: 'Enfocar la entrada de la sesión',
      unbound: 'Sin atajo',
      noSession: 'Este espacio de trabajo no tiene otra sesión',
      desktopOnly: 'Las combinaciones con flechas solo tienen valor por defecto en Windows y macOS Desktop: los navegadores reservan las flechas para editar texto. En la versión web, asigna una combinación en los ajustes de atajos.',
    }

    const fr = {
      panel: 'Navigation clavier',
      title: 'Navigation clavier',
      subtitle: 'Les raccourcis fléchés parcourent la zone des extensions et les sessions de l’espace de travail courant ; Ctrl+J ramène le curseur dans le champ de saisie. Tous les raccourcis se modifient dans Réglages → Général → Raccourcis clavier.',
      sectionPanels: 'Zone des extensions',
      sectionSessions: 'Zone des sessions · espace courant',
      sectionInput: 'Champ de saisie',
      panelPrevious: 'Précédent (conversation incluse)',
      panelNext: 'Suivant',
      sessionPrevious: 'Session précédente',
      sessionNext: 'Session suivante',
      focusInput: 'Cibler la saisie de la session',
      unbound: 'Aucun raccourci',
      noSession: 'Cet espace de travail n’a pas d’autre session',
      desktopOnly: 'Les raccourcis fléchés n’ont de valeur par défaut que sur Windows et macOS Desktop : les navigateurs réservent les flèches à l’édition de texte. Sur le Web, attribuez une combinaison dans les réglages de raccourcis.',
    }

    const de = {
      panel: 'Tastaturnavigation',
      title: 'Tastaturnavigation',
      subtitle: 'Pfeiltasten-Kürzel bewegen durch den Plugin-Bereich und die Sitzungen des aktuellen Arbeitsbereichs; Ctrl+J setzt den Cursor zurück ins Eingabefeld. Alle Kürzel lassen sich unter Einstellungen → Allgemein → Tastenkürzel ändern.',
      sectionPanels: 'Plugin-Bereich',
      sectionSessions: 'Sitzungsbereich · aktueller Arbeitsbereich',
      sectionInput: 'Eingabefeld',
      panelPrevious: 'Vorheriges (inkl. Unterhaltung)',
      panelNext: 'Nächstes',
      sessionPrevious: 'Vorherige Sitzung',
      sessionNext: 'Nächste Sitzung',
      focusInput: 'Sitzungseingabe fokussieren',
      unbound: 'Kein Kürzel',
      noSession: 'Dieser Arbeitsbereich hat keine weitere Sitzung',
      desktopOnly: 'Die Pfeiltasten-Kürzel gelten standardmäßig nur unter Windows und macOS Desktop: Browser reservieren Pfeiltasten für die Textbearbeitung. Unter Web eine Kombination in den Kürzel-Einstellungen zuweisen.',
    }

    const ru = {
      panel: 'Навигация с клавиатуры',
      title: 'Навигация с клавиатуры',
      subtitle: 'Сочетания со стрелками перемещают по области плагинов и сессиям текущего рабочего пространства; Ctrl+J возвращает курсор в поле ввода. Все сочетания меняются в «Настройки → Общие → Сочетания клавиш».',
      sectionPanels: 'Область плагинов',
      sectionSessions: 'Область сессий · текущее пространство',
      sectionInput: 'Поле ввода',
      panelPrevious: 'Предыдущий (включая диалог)',
      panelNext: 'Следующий',
      sessionPrevious: 'Предыдущая сессия',
      sessionNext: 'Следующая сессия',
      focusInput: 'Фокус на ввод сессии',
      unbound: 'Без сочетания',
      noSession: 'В этом рабочем пространстве нет другой сессии',
      desktopOnly: 'Сочетания со стрелками по умолчанию работают только в Windows и macOS Desktop: браузеры зарезервировали стрелки для редактирования текста. В веб-версии задайте сочетание в настройках.',
    }

    const pt = {
      panel: 'Navegação por teclado',
      title: 'Navegação por teclado',
      subtitle: 'Os atalhos com setas percorrem a área de plugins e as sessões do espaço de trabalho atual; Ctrl+J devolve o cursor à caixa de entrada. Todos os atalhos podem ser alterados em Configurações → Geral → Atalhos de teclado.',
      sectionPanels: 'Área de plugins',
      sectionSessions: 'Área de sessões · espaço atual',
      sectionInput: 'Caixa de entrada',
      panelPrevious: 'Anterior (inclui a conversa)',
      panelNext: 'Próximo',
      sessionPrevious: 'Sessão anterior',
      sessionNext: 'Sessão seguinte',
      focusInput: 'Focar a entrada da sessão',
      unbound: 'Sem atalho',
      noSession: 'Este espaço de trabalho não tem outra sessão',
      desktopOnly: 'Os atalhos com setas só têm valor predefinido no Windows e macOS Desktop: os navegadores reservam as setas para editar texto. Na Web, defina uma combinação nas configurações de atalhos.',
    }

    /**
     * Read one slot's entries, tolerating both accessor names.
     * @param ctx - the browser context the plugin runs on.
     * @param name - slot name.
     * @returns the registered entries, or an empty list.
     */
    function slotEntries(ctx, name) {
      try {
        const list = ctx.slots.entriesOfSlot(name)
        if (Array.isArray(list)) return list
      } catch (error) {
        console.error(`[keynav] cannot read slot ${name}:`, error)
      }
      try {
        return ctx.slots.entries(name)
      } catch (error) {
        return []
      }
    }

    /**
     * Plugin area in sidebar order, starting with the Conversation (null).
     * @param ctx - the browser context the plugin runs on.
     * @returns the selectable panel ids, Conversation first.
     */
    function panelOrder(ctx) {
      const mains = new Set()
      for (const entry of slotEntries(ctx, 'main')) {
        const options = entry === undefined || entry === null ? undefined : entry.options
        if (options === undefined || options === null) continue
        if (options.key !== undefined) mains.add(options.key)
      }
      const rows = []
      let index = 0
      for (const entry of slotEntries(ctx, 'sidebar.panellist')) {
        const options = entry === undefined || entry === null ? undefined : entry.options
        if (options === undefined || options === null) continue
        // A row without a page behind it cannot be selected.
        if (options.id === undefined || !mains.has(options.id)) continue
        rows.push({ id: options.id, order: typeof options.order === 'number' ? options.order : 0, index })
        index += 1
      }
      rows.sort((left, right) => left.order - right.order || left.index - right.index)
      return [null, ...rows.map(row => row.id)]
    }

    /**
     * Resolve the next panel selection without changing anything.
     * @param ctx - the browser context the plugin runs on.
     * @param delta - +1 for down, -1 for up.
     * @returns the layout service and the target id, or undefined when unavailable.
     */
    function planPanel(ctx, delta) {
      const layout = ctx.get('layout')
      if (layout === undefined) return undefined
      const order = panelOrder(ctx)
      if (order.length === 0) return undefined
      const current = layout.panelInfo.getSnapshot().activePanelId
      const at = order.indexOf(current === undefined ? null : current)
      return { layout, id: order[(at < 0 ? 0 : at + delta + order.length) % order.length] }
    }

    /**
     * Apply a panel plan.
     * @param plan - resolved layout and target id.
     */
    function applyPanel(plan) {
      try {
        plan.layout.selectPanel(plan.id)
      } catch (error) {
        console.error('[keynav] selecting the panel failed:', error)
      }
    }

    /**
     * The Session the main column presents.
     * @param ctx - the browser context the plugin runs on.
     * @returns its id and listed row, if any.
     */
    function currentSession(ctx) {
      const sessions = ctx.get('sessions')
      if (sessions === undefined) return undefined
      const snapshot = sessions.list.getSnapshot()
      if (snapshot === undefined || snapshot === null) return undefined
      const byId = snapshot.byId === undefined || snapshot.byId === null ? {} : snapshot.byId
      const presented = (id) => {
        const row = byId[id]
        if (row === undefined || row === null) return undefined
        const count = row.retainedBy === undefined || row.retainedBy === null ? 0 : row.retainedBy.mainView
        return typeof count === 'number' && count > 0 ? row : undefined
      }
      // Host-list members first: those are the rows the session area shows.
      for (const id of snapshot.ids === undefined ? [] : snapshot.ids) {
        const row = presented(id)
        if (row !== undefined) return { id, row }
      }
      // Retained subagent fallback rows stay outside the list but can be shown.
      for (const id of Object.keys(byId)) {
        const row = presented(id)
        if (row !== undefined) return { id, row }
      }
      return undefined
    }

    /**
     * The sessions of one workspace, in the sidebar's default ("updated") row
     * order: the selected blank first, then pinned rows, then the rest newest
     * first — the same partitions `sectionMembers` applies. Archived rows stay
     * hidden, like the default archived filter, and subagent children never
     * appear as rows.
     *
     * The workspace is the one that owns `anchorId`. Without a presented Session
     * — archiving the open conversation leaves the blank New Session page behind
     * — the most recent listed Session names the workspace instead, so stepping
     * still starts inside the workspace the user was working in.
     * @param ctx - the browser context the plugin runs on.
     * @param anchorId - the presented Session, or undefined when none is shown.
     * @returns ordered member ids, or undefined without a session list.
     */
    function workspaceSequence(ctx, anchorId) {
      const sessions = ctx.get('sessions')
      if (sessions === undefined) return undefined
      const snapshot = sessions.list.getSnapshot()
      if (snapshot === undefined || snapshot === null) return undefined
      const byId = snapshot.byId === undefined || snapshot.byId === null ? {} : snapshot.byId
      const listed = snapshot.ids === undefined ? [] : snapshot.ids

      const workspaces = ctx.get('workspaces')
      const listedWorkspaces = workspaces === undefined ? undefined : workspaces.list.getSnapshot()
      const items = listedWorkspaces === undefined || listedWorkspaces === null || listedWorkspaces.items === undefined
        ? []
        : listedWorkspaces.items
      const archived = new Set(listedWorkspaces === undefined || listedWorkspaces === null || listedWorkspaces.archivedSessionIds === undefined
        ? []
        : listedWorkspaces.archivedSessionIds)
      const pinned = new Set(listedWorkspaces === undefined || listedWorkspaces === null || listedWorkspaces.pinnedSessionIds === undefined
        ? []
        : listedWorkspaces.pinnedSessionIds)

      // One pass: which workspace accounts for which Session.
      const ownerOf = new Map()
      for (const workspace of items) {
        for (const id of workspace.sessionIds) {
          if (!ownerOf.has(id)) ownerOf.set(id, workspace)
        }
      }

      let members
      const anchor = anchorId === undefined ? listed.find(id => ownerOf.has(id)) : anchorId
      const owner = anchor === undefined ? undefined : ownerOf.get(anchor)
      if (owner !== undefined) {
        members = owner.sessionIds
      } else if (items.length > 0) {
        // Ungrouped bucket: listed Sessions no workspace accounts for.
        members = listed.filter(id => !ownerOf.has(id))
      } else {
        // No workspace registry: keep the flat list so the command still works.
        members = listed
      }

      const visible = members.filter((id) => {
        const row = byId[id]
        if (row === undefined || row === null) return false
        if (row.origin === 'subagent') return false
        if (row.blank === true && id !== anchorId) return false
        return !archived.has(id)
      })
      const recency = (id) => {
        const value = byId[id].updatedAt
        return typeof value === 'number' ? value : 0
      }
      const newestFirst = visible.slice().sort((left, right) => recency(right) - recency(left))
      const blanks = newestFirst.filter(id => byId[id].blank === true)
      const leading = newestFirst.filter(id => byId[id].blank !== true && pinned.has(id))
      const rest = newestFirst.filter(id => byId[id].blank !== true && !pinned.has(id))
      return [...blanks, ...leading, ...rest]
    }

    /**
     * Resolve the next Session inside the current workspace, wrapping at both ends.
     * @param ctx - the browser context the plugin runs on.
     * @param delta - +1 for down, -1 for up.
     * @returns the workspace service and the target id, or undefined when unavailable.
     */
    function planSession(ctx, delta) {
      const workspace = ctx.get('uiWorkspace')
      if (workspace === undefined) return undefined
      const current = currentSession(ctx)
      const sequence = workspaceSequence(ctx, current === undefined ? undefined : current.id)
      if (sequence === undefined || sequence.length === 0) return undefined
      // Nothing is presented — for example the open conversation was archived:
      // enter that workspace's list from the side the arrow points at.
      const at = current === undefined ? -1 : sequence.indexOf(current.id)
      const next = at < 0
        ? sequence[delta > 0 ? 0 : sequence.length - 1]
        : sequence[(at + delta + sequence.length) % sequence.length]
      if (next === undefined) return undefined
      if (current !== undefined && next === current.id) return undefined
      return { workspace, id: next }
    }

    /**
     * Apply a session plan.
     * @param plan - resolved workspace and target id.
     */
    function applySession(plan) {
      try {
        plan.workspace.openSession(plan.id)
      } catch (error) {
        console.error('[keynav] opening the session failed:', error)
      }
    }

    /**
     * Resolve the composer facade of one Session through its scope.
     * @param ctx - the browser context the plugin runs on.
     * @param sessionId - the Session whose composer is wanted.
     * @returns the input facade, or undefined while the Session is not resident.
     */
    function composerInput(ctx, sessionId) {
      const sessions = ctx.get('sessions')
      if (sessions === undefined) return undefined
      const scope = sessions.scope(sessionId)
      if (scope === undefined) return undefined
      const conversation = scope.get('conversation')
      if (conversation === undefined || conversation === null) return undefined
      if (conversation.input === undefined || conversation.input === null) return undefined
      try {
        return conversation.input.for(scope)
      } catch (error) {
        console.error('[keynav] composer facade unavailable:', error)
        return undefined
      }
    }

    /**
     * Hand the keyboard to the composer, retrying while the Conversation mounts.
     * @param input - the Session's composer facade.
     * @param remaining - frames still allowed.
     */
    function ensureFocus(input, remaining) {
      const active = typeof document === 'undefined' ? null : document.activeElement
      if (active !== null && active !== undefined && active.isContentEditable === true) return
      try {
        input.focus()
      } catch (error) {
        console.error('[keynav] focus failed:', error)
        return
      }
      if (remaining > 0 && typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(() => { ensureFocus(input, remaining - 1) })
      }
    }

    /**
     * Resolve what "focus the input box" means right now.
     *
     * Usually that is the presented Session's composer. When nothing is
     * presented — archiving the open conversation leaves the blank New Session
     * page behind — the plan restores the first row of the same workspace list
     * the session step uses, and focuses it once it is resident.
     * @param ctx - the browser context the plugin runs on.
     * @returns a focus plan, or undefined when there is nothing to focus.
     */
    function planFocus(ctx) {
      const layout = ctx.get('layout')
      const current = currentSession(ctx)
      if (current !== undefined) {
        const input = composerInput(ctx, current.id)
        return input === undefined ? undefined : { input, layout }
      }
      const workspace = ctx.get('uiWorkspace')
      if (workspace === undefined) return undefined
      const sequence = workspaceSequence(ctx, undefined)
      if (sequence === undefined || sequence.length === 0) return undefined
      const id = sequence[0]
      if (id === undefined) return undefined
      return { workspace, id, layout }
    }

    /**
     * Apply a focus plan, opening the target Session first when there was none.
     * @param plan - resolved composer facade, or the Session to restore.
     * @param ctx - the browser context the plugin runs on.
     */
    function applyFocus(plan, ctx) {
      if (plan.layout !== undefined) {
        try {
          plan.layout.selectPanel(null)
        } catch (error) {
          console.error('[keynav] returning to the Conversation failed:', error)
        }
      }
      if (plan.input !== undefined) {
        ensureFocus(plan.input, 10)
        return
      }
      try {
        plan.workspace.openSession(plan.id)
      } catch (error) {
        console.error('[keynav] restoring the Session failed:', error)
        return
      }
      // The composer exists only after the Session is retained and mounted.
      let frames = 0
      const wait = () => {
        const input = composerInput(ctx, plan.id)
        if (input !== undefined) {
          ensureFocus(input, 10)
          return
        }
        frames += 1
        if (frames < 60 && typeof requestAnimationFrame === 'function') requestAnimationFrame(wait)
      }
      if (typeof requestAnimationFrame === 'function') requestAnimationFrame(wait)
    }

    /** Component-local stylesheet; the tokens are the host's, the classes are ours. */
    const STYLES = [
      '.kn-page{display:flex;flex-direction:column;flex:1;height:100%;min-height:0;min-width:0;box-sizing:border-box;',
      'color:var(--dsw-alias-label-primary);font-family:var(--dsw-font-family);background:var(--dsw-alias-bg-base);}',
      '.kn-scroll{flex:1;min-height:0;overflow-y:auto;overflow-x:hidden;scrollbar-color:var(--dsw-alias-border-l3) transparent;}',
      '.kn-column{display:flex;flex-direction:column;gap:20px;width:100%;max-width:880px;margin:0 auto;box-sizing:border-box;',
      'padding:calc(28px + var(--dsh-frame-top-clearance, 0px)) clamp(24px,4vw,48px) 48px;}',
      '.kn-title{margin:0;font-size:20px;line-height:1.4;font-weight:600;color:var(--dsw-alias-label-primary);}',
      '.kn-subtitle{margin:8px 0 0;font-size:13px;line-height:1.6;color:var(--dsw-alias-label-tertiary);}',
      '.kn-card{display:flex;flex-direction:column;gap:4px;box-sizing:border-box;padding:8px 16px 12px;',
      'border:1px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-bg-layer-1);}',
      '.kn-card-title{margin:8px 0 4px;font-size:13px;line-height:1.5;font-weight:600;color:var(--dsw-alias-label-secondary);}',
      '.kn-row{display:flex;align-items:center;gap:12px;min-height:32px;padding:2px 0;}',
      '.kn-label{flex:1;min-width:0;font-size:13px;line-height:1.5;color:var(--dsw-alias-label-primary);}',
      '.kn-keys{display:inline-flex;align-items:center;gap:4px;flex:none;}',
      '.kn-kbd{display:inline-flex;align-items:center;justify-content:center;min-width:20px;height:20px;box-sizing:border-box;',
      'padding:0 5px;border:1px solid var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-xs);',
      'background:var(--dsw-alias-bg-layer-2);font-family:var(--dsw-font-family);font-size:11px;line-height:1;',
      'color:var(--dsw-alias-label-secondary);}',
      '.kn-unbound{font-size:12px;color:var(--dsw-alias-label-caption);}',
      '.kn-note{margin:0;font-size:12px;line-height:1.6;color:var(--dsw-alias-label-caption);}',
    ].join('')

    /**
     * Sidebar row icon: an arrow-key cap.
     * @param props - requested square edge and whether this panel is selected.
     */
    function PanelIcon(props) {
      const size = typeof props.size === 'number' && props.size > 0 ? props.size : 20
      const edge = props.active === true ? 'var(--dsw-alias-label-primary)' : 'var(--dsw-alias-label-secondary)'
      return h('svg', {
        width: size,
        height: size,
        viewBox: '0 0 36 36',
        'aria-hidden': 'true',
        focusable: 'false',
        style: { display: 'block' },
      },
      h('rect', {
        x: 6, y: 6, width: 24, height: 24, rx: 7,
        style: { fill: 'none', stroke: edge, strokeWidth: 2.4 },
      }),
      h('path', {
        d: 'M14 15l4-4 4 4',
        style: {
          fill: 'none',
          stroke: 'var(--dsw-alias-state-business-primary)',
          strokeWidth: 2.2,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        },
      }),
      h('path', {
        d: 'M14 21l4 4 4-4',
        style: {
          fill: 'none',
          stroke: 'var(--dsw-alias-state-business-primary)',
          strokeWidth: 2.2,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        },
      }))
    }

    /**
     * The panel page: the three behaviours with their effective keycaps.
     * @param props - slot runtime props, the `locale: NS` seat, and the catalog.
     */
    function KeyNavPage(props) {
      const t = props.t
      const catalog = props.catalog
      const entries = useSyncExternalStore(catalog.subscribe, catalog.getSnapshot)

      const keycaps = (id) => {
        const entry = entries.find(candidate => candidate.id === id)
        const keys = entry === undefined ? undefined : entry.keys
        if (keys === undefined || keys.length === 0) return h('span', { className: 'kn-unbound' }, t('unbound'))
        return h('span', { className: 'kn-keys' },
          keys.map((key, index) => h('kbd', { key: `${key}-${index}`, className: 'kn-kbd' }, key)))
      }
      const row = (id, labelKey) => h('div', { className: 'kn-row' },
        h('span', { className: 'kn-label' }, t(labelKey)),
        keycaps(id))

      return h('div', { className: 'kn-page' },
        h('style', null, STYLES),
        h('div', { className: 'kn-scroll' },
          h('div', { className: 'kn-column' },
            h('header', null,
              h('h1', { className: 'kn-title' }, t('title')),
              h('p', { className: 'kn-subtitle' }, t('subtitle'))),
            h('section', { className: 'kn-card' },
              h('h2', { className: 'kn-card-title' }, t('sectionPanels')),
              row(PANEL_PREVIOUS, 'panelPrevious'),
              row(PANEL_NEXT, 'panelNext')),
            h('section', { className: 'kn-card' },
              h('h2', { className: 'kn-card-title' }, t('sectionSessions')),
              row(SESSION_PREVIOUS, 'sessionPrevious'),
              row(SESSION_NEXT, 'sessionNext')),
            h('section', { className: 'kn-card' },
              h('h2', { className: 'kn-card-title' }, t('sectionInput')),
              row(FOCUS_INPUT, 'focusInput')),
            h('p', { className: 'kn-note' }, t('desktopOnly')))))
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, { zh, en, ja, es, fr, de, ru, pt }), 'keynav: dictionaries')
        const t = ctx.locale.bind(NS)

        // Effective keycaps, read back from the shared catalog so a rebind shows
        // here without this plugin tracking the preference store.
        const catalog = {
          getSnapshot: () => {
            const shortcuts = ctx.get('shortcuts')
            return shortcuts === undefined ? EMPTY_CATALOG : shortcuts.catalog.getSnapshot()
          },
          subscribe: (listener) => {
            const shortcuts = ctx.get('shortcuts')
            if (shortcuts === undefined) return () => {}
            return shortcuts.catalog.subscribe(listener)
          },
        }

        ctx.effect(() => ctx.slots.inject('main', () => ctx.slots.register({
          name: 'main',
          key: PANEL_ID,
          locale: NS,
          inject: () => ({ catalog }),
        }, KeyNavPage)), 'keynav: panel page')

        ctx.effect(() => ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
          name: 'sidebar.panellist',
          id: PANEL_ID,
          order: 40,
          label: () => t('panel'),
          locale: NS,
        }, PanelIcon)), 'keynav: sidebar entry')

        ctx.inject(['shortcuts', 'layout', 'sessions', 'workspaces', 'uiWorkspace'], (scope) => {
          // Desktop Windows/macOS deliver accepted chords before local handlers,
          // so `regions` and `modals` never constrain that path: an open dialog or
          // a terminal has to stand aside here.
          const standsAside = (context) => context !== undefined && context !== null
            && ((context.modal !== null && context.modal !== undefined) || context.region === 'terminal')

          /** Desktop-only arrow default: Web/Linux reject bare arrow keys. */
          const arrows = (code, modifiers) => ({
            'desktop:macos': { code, modifiers },
            'desktop:windows': { code, modifiers },
          })

          const register = (id, labelKey, aliases, defaults, plan) => scope.effect(() => {
            try {
              return scope.shortcuts.register({
                id,
                label: () => t(labelKey),
                aliases,
                defaults,
                regions: ['page', 'editable'],
                modals: [],
                resolve: (context) => {
                  if (standsAside(context)) return { status: 'pass' }
                  const resolved = plan()
                  if (resolved === undefined) return { status: 'blocked', reason: t('noSession') }
                  return { status: 'handled', run: () => { resolved.run() } }
                },
              })
            } catch (error) {
              // One rejected declaration must not take the panel and the other
              // commands down with it.
              console.error(`[keynav] cannot register ${id}:`, error)
              return () => {}
            }
          }, `keynav: ${id}`)

          register(PANEL_PREVIOUS, 'panelPrevious', ['previous panel', 'plugin area up'],
            arrows('ArrowUp', ['primary']), () => {
              const target = planPanel(scope, -1)
              return target === undefined ? undefined : { run: () => { applyPanel(target) } }
            })
          register(PANEL_NEXT, 'panelNext', ['next panel', 'plugin area down'],
            arrows('ArrowDown', ['primary']), () => {
              const target = planPanel(scope, 1)
              return target === undefined ? undefined : { run: () => { applyPanel(target) } }
            })
          register(SESSION_PREVIOUS, 'sessionPrevious', ['previous session', 'session area up'],
            arrows('ArrowUp', ['alt']), () => {
              const target = planSession(scope, -1)
              return target === undefined ? undefined : { run: () => { applySession(target) } }
            })
          register(SESSION_NEXT, 'sessionNext', ['next session', 'session area down'],
            arrows('ArrowDown', ['alt']), () => {
              const target = planSession(scope, 1)
              return target === undefined ? undefined : { run: () => { applySession(target) } }
            })
          register(FOCUS_INPUT, 'focusInput', ['focus input', 'focus composer'], {
            'desktop:macos': { code: 'KeyJ', modifiers: ['primary'] },
            'desktop:windows': { code: 'KeyJ', modifiers: ['primary'] },
            'desktop:linux': { code: 'KeyJ', modifiers: ['primary'] },
            'web:macos': { code: 'KeyJ', modifiers: ['primary', 'alt'] },
            'web:windows': { code: 'KeyJ', modifiers: ['primary', 'alt'] },
          }, () => {
            const target = planFocus(scope)
            return target === undefined ? undefined : { run: () => { applyFocus(target, scope) } }
          })
        })
      },
    }
  },
})
