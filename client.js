/**
 * Browser half of the KeyNav bundle.
 *
 * Five behaviours, eight commands (six editable, two fixed local inputs):
 *
 *   Ctrl+↑ / Ctrl+↓  move the selection inside the plugin area — the sidebar's
 *                    panel rows, with the Conversation as the first stop.
 *   Alt+↑  / Alt+↓   move through the session area, one Session per press.
 *   Ctrl+J           put the caret back in the current Session's input box.
 *   ↑ / ↓            recall older/newer sent messages while the composer is empty.
 *   Ctrl+M           open DSH's official model selector without changing the draft.
 *
 * The arrow commands declare Desktop defaults only: the shortcut service
 * reserves bare arrow keys for text editing on Web/Linux, so such a default
 * would be rejected at registration. Ctrl+J keeps a Web default; Ctrl+M uses
 * Ctrl+Alt+M on Web for the same browser-reservation reason.
 *
 * Every editable command resolves its target in `resolve` and acts in `run`,
 * which is the contract the shortcut service expects.
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
    const MESSAGE_PREVIOUS = 'keynav.message.previous'
    const MESSAGE_NEXT = 'keynav.message.next'
    const MODEL_SELECT = 'keynav.model.select'

    const zh = {
      panel: '键盘导航',
      title: '键盘导航',
      subtitle: '用方向键在插件区和当前工作区的会话之间移动，按 Ctrl+J 回到输入框；空输入框 ↑/↓ 召回已发送消息，Ctrl+M 选择模型。可改键位都能在「设置 → 通用 → 快捷键」里调整。',
      sectionPanels: '插件区',
      sectionSessions: '会话区 · 当前工作区',
      sectionInput: '输入框',
      sectionMessages: '消息历史',
      sectionModel: '模型',
      panelPrevious: '上一个（含会话）',
      panelNext: '下一个',
      sessionPrevious: '上一个会话',
      sessionNext: '下一个会话',
      focusInput: '聚焦会话输入框',
      messagePrevious: '上一条已发送消息',
      messageNext: '下一条已发送消息',
      modelSelect: '打开模型选择器',
      historyHint: '输入框为空时按 ↑ 调出最近发送的消息，继续按 ↑ 向前；↓ 向后，越过最新一条后恢复空白。只召回当前已加载历史中的文字，不恢复图片或附件。',
      modelUnavailable: '模型选择器当前不可用',
      unbound: '未绑定',
      noSession: '当前工作区没有其它会话',
      desktopOnly: '插件区与会话区的 Ctrl/Alt 方向键只有桌面端默认可用；消息历史的 ↑/↓ 是固定的本地输入，Web 也可用。Ctrl+M 在 Web 端默认是 Ctrl+Alt+M。',
    }

    const en = {
      panel: 'Keyboard navigation',
      title: 'Keyboard navigation',
      subtitle: 'Arrow chords move through the plugin area and the current workspace’s sessions; Ctrl+J returns to the input, ↑/↓ recall sent messages from an empty composer, and Ctrl+M opens model selection. Editable bindings live in Settings → General → Keyboard shortcuts.',
      sectionPanels: 'Plugin area',
      sectionSessions: 'Session area · current workspace',
      sectionInput: 'Input box',
      sectionMessages: 'Message history',
      sectionModel: 'Model',
      panelPrevious: 'Previous (Conversation included)',
      panelNext: 'Next',
      sessionPrevious: 'Previous session',
      sessionNext: 'Next session',
      focusInput: 'Focus session input',
      messagePrevious: 'Previous sent message',
      messageNext: 'Next sent message',
      modelSelect: 'Open model selector',
      historyHint: 'With an empty composer, ↑ recalls the most recent sent message and another ↑ goes older; ↓ goes newer and clears the draft past the newest item. Only text from currently loaded history is recalled; images and attachments are not restored.',
      modelUnavailable: 'The model selector is unavailable right now',
      unbound: 'No shortcut',
      noSession: 'This workspace has no other Session',
      desktopOnly: 'The plugin/session Ctrl/Alt arrow chords have Desktop defaults only. Message-history ↑/↓ is fixed local input and also works on Web. Ctrl+M defaults to Ctrl+Alt+M on Web.',
    }

    const ja = {
      panel: 'キーボード操作',
      title: 'キーボード操作',
      subtitle: '方向キーでプラグイン領域と現在のワークスペースのセッションを移動し、Ctrl+J で入力欄へ戻ります。空の入力欄では ↑/↓ で送信履歴を呼び出し、Ctrl+M でモデルを選択します。変更可能なキーは「設定 → 一般 → キーボード ショートカット」で調整できます。',
      sectionPanels: 'プラグイン領域',
      sectionSessions: 'セッション領域・現在のワークスペース',
      sectionInput: '入力欄',
      sectionMessages: 'メッセージ履歴',
      sectionModel: 'モデル',
      panelPrevious: '前へ（会話を含む）',
      panelNext: '次へ',
      sessionPrevious: '前のセッション',
      sessionNext: '次のセッション',
      focusInput: 'セッションの入力欄にフォーカス',
      messagePrevious: '前の送信メッセージ',
      messageNext: '次の送信メッセージ',
      modelSelect: 'モデル選択を開く',
      historyHint: '空の入力欄で ↑ を押すと最新の送信メッセージを呼び出し、もう一度押すと古い方へ進みます。↓ で新しい方へ進み、最新を過ぎると空に戻ります。読み込まれている履歴の文字だけを呼び出し、画像や添付は復元しません。',
      modelUnavailable: 'モデル選択は現在利用できません',
      unbound: '未割り当て',
      noSession: 'このワークスペースに他のセッションはありません',
      desktopOnly: 'プラグイン／セッションの Ctrl/Alt 方向キーはデスクトップ版のみ既定です。メッセージ履歴の ↑/↓ は固定のローカル入力で Web でも動作します。Ctrl+M は Web では既定で Ctrl+Alt+M です。',
    }

    const es = {
      panel: 'Navegación con teclado',
      title: 'Navegación con teclado',
      subtitle: 'Las flechas recorren el área de plugins y las sesiones del espacio actual; Ctrl+J vuelve a la entrada, ↑/↓ recuperan mensajes enviados desde un cuadro vacío y Ctrl+M abre la selección de modelo. Los atajos editables están en Ajustes → General → Atajos de teclado.',
      sectionPanels: 'Área de plugins',
      sectionSessions: 'Área de sesiones · espacio actual',
      sectionInput: 'Cuadro de entrada',
      sectionMessages: 'Historial de mensajes',
      sectionModel: 'Modelo',
      panelPrevious: 'Anterior (incluye la conversación)',
      panelNext: 'Siguiente',
      sessionPrevious: 'Sesión anterior',
      sessionNext: 'Sesión siguiente',
      focusInput: 'Enfocar la entrada de la sesión',
      messagePrevious: 'Mensaje enviado anterior',
      messageNext: 'Mensaje enviado siguiente',
      modelSelect: 'Abrir el selector de modelo',
      historyHint: 'Con el cuadro vacío, ↑ recupera el mensaje enviado más reciente y otra ↑ retrocede; ↓ avanza y borra el borrador después del más reciente. Solo se recupera texto del historial cargado; no se restauran imágenes ni adjuntos.',
      modelUnavailable: 'El selector de modelo no está disponible ahora',
      unbound: 'Sin atajo',
      noSession: 'Este espacio de trabajo no tiene otra sesión',
      desktopOnly: 'Las flechas Ctrl/Alt de plugins y sesiones solo tienen valor por defecto en Desktop. Las ↑/↓ del historial son entrada local fija y también funcionan en Web. Ctrl+M usa Ctrl+Alt+M por defecto en Web.',
    }

    const fr = {
      panel: 'Navigation clavier',
      title: 'Navigation clavier',
      subtitle: 'Les flèches parcourent la zone des extensions et les sessions de l’espace courant ; Ctrl+J revient à la saisie, ↑/↓ rappellent les messages envoyés depuis un champ vide et Ctrl+M ouvre le choix du modèle. Les raccourcis modifiables sont dans Réglages → Général → Raccourcis clavier.',
      sectionPanels: 'Zone des extensions',
      sectionSessions: 'Zone des sessions · espace courant',
      sectionInput: 'Champ de saisie',
      sectionMessages: 'Historique des messages',
      sectionModel: 'Modèle',
      panelPrevious: 'Précédent (conversation incluse)',
      panelNext: 'Suivant',
      sessionPrevious: 'Session précédente',
      sessionNext: 'Session suivante',
      focusInput: 'Cibler la saisie de la session',
      messagePrevious: 'Message envoyé précédent',
      messageNext: 'Message envoyé suivant',
      modelSelect: 'Ouvrir le sélecteur de modèle',
      historyHint: 'Avec un champ vide, ↑ rappelle le dernier message envoyé et un autre ↑ remonte ; ↓ avance et efface le brouillard après le plus récent. Seul le texte de l’historique chargé est rappelé ; les images et pièces jointes ne sont pas restaurées.',
      modelUnavailable: 'Le sélecteur de modèle est indisponible pour le moment',
      unbound: 'Aucun raccourci',
      noSession: 'Cet espace de travail n’a pas d’autre session',
      desktopOnly: 'Les flèches Ctrl/Alt des extensions et sessions n’ont de valeur par défaut que sur Desktop. Les ↑/↓ de l’historique sont une saisie locale fixe et fonctionnent aussi sur le Web. Ctrl+M devient Ctrl+Alt+M sur le Web.',
    }

    const de = {
      panel: 'Tastaturnavigation',
      title: 'Tastaturnavigation',
      subtitle: 'Pfeiltasten bewegen durch den Plugin-Bereich und die Sitzungen des aktuellen Arbeitsbereichs; Ctrl+J kehrt zur Eingabe zurück, ↑/↓ rufen gesendete Nachrichten aus einem leeren Feld auf und Ctrl+M öffnet die Modellauswahl. Änderbare Kürzel stehen unter Einstellungen → Allgemein → Tastenkürzel.',
      sectionPanels: 'Plugin-Bereich',
      sectionSessions: 'Sitzungsbereich · aktueller Arbeitsbereich',
      sectionInput: 'Eingabefeld',
      sectionMessages: 'Nachrichtenverlauf',
      sectionModel: 'Modell',
      panelPrevious: 'Vorheriges (inkl. Unterhaltung)',
      panelNext: 'Nächstes',
      sessionPrevious: 'Vorherige Sitzung',
      sessionNext: 'Nächste Sitzung',
      focusInput: 'Sitzungseingabe fokussieren',
      messagePrevious: 'Vorherige gesendete Nachricht',
      messageNext: 'Nächste gesendete Nachricht',
      modelSelect: 'Modellauswahl öffnen',
      historyHint: 'Bei leerem Eingabefeld ruft ↑ die letzte gesendete Nachricht auf und weiteres ↑ geht zurück; ↓ geht vorwärts und leert den Entwurf nach der neuesten Nachricht. Nur Text aus dem geladenen Verlauf wird zurückgerufen; Bilder und Anhänge werden nicht wiederhergestellt.',
      modelUnavailable: 'Die Modellauswahl ist derzeit nicht verfügbar',
      unbound: 'Kein Kürzel',
      noSession: 'Dieser Arbeitsbereich hat keine weitere Sitzung',
      desktopOnly: 'Die Ctrl/Alt-Pfeiltasten für Plugins und Sitzungen haben nur auf Desktop Standardwerte. Die ↑/↓ des Nachrichtenverlaufs sind feste lokale Eingaben und funktionieren auch im Web. Ctrl+M ist im Web standardmäßig Ctrl+Alt+M.',
    }

    const ru = {
      panel: 'Навигация с клавиатуры',
      title: 'Навигация с клавиатуры',
      subtitle: 'Сочетания со стрелками перемещают по области плагинов и сессиям текущего рабочего пространства; Ctrl+J возвращает курсор в поле ввода, ↑/↓ вызывают отправленные сообщения из пустого поля, а Ctrl+M открывает выбор модели. Изменяемые сочетания находятся в «Настройки → Общие → Сочетания клавиш».',
      sectionPanels: 'Область плагинов',
      sectionSessions: 'Область сессий · текущее пространство',
      sectionInput: 'Поле ввода',
      sectionMessages: 'История сообщений',
      sectionModel: 'Модель',
      panelPrevious: 'Предыдущий (включая диалог)',
      panelNext: 'Следующий',
      sessionPrevious: 'Предыдущая сессия',
      sessionNext: 'Следующая сессия',
      focusInput: 'Фокус на ввод сессии',
      messagePrevious: 'Предыдущее отправленное сообщение',
      messageNext: 'Следующее отправленное сообщение',
      modelSelect: 'Открыть выбор модели',
      historyHint: 'В пустом поле ↑ возвращает последнее отправленное сообщение, следующее ↑ идёт назад; ↓ идёт вперёд и очищает черновик после самого нового. Возвращается только текст из загруженной истории; изображения и вложения не восстанавливаются.',
      modelUnavailable: 'Выбор модели сейчас недоступен',
      unbound: 'Без сочетания',
      noSession: 'В этом рабочем пространстве нет другой сессии',
      desktopOnly: 'Ctrl/Alt-стрелки плагинов и сессий имеют значения по умолчанию только в Desktop. Стрелки ↑/↓ истории — фиксированный локальный ввод и работают в Web. Ctrl+M в Web по умолчанию становится Ctrl+Alt+M.',
    }

    const pt = {
      panel: 'Navegação por teclado',
      title: 'Navegação por teclado',
      subtitle: 'As setas percorrem a área de plugins e as sessões do espaço atual; Ctrl+J volta à entrada, ↑/↓ recuperam mensagens enviadas de uma caixa vazia e Ctrl+M abre a seleção de modelo. Os atalhos editáveis ficam em Configurações → Geral → Atalhos de teclado.',
      sectionPanels: 'Área de plugins',
      sectionSessions: 'Área de sessões · espaço atual',
      sectionInput: 'Caixa de entrada',
      sectionMessages: 'Histórico de mensagens',
      sectionModel: 'Modelo',
      panelPrevious: 'Anterior (inclui a conversa)',
      panelNext: 'Próximo',
      sessionPrevious: 'Sessão anterior',
      sessionNext: 'Sessão seguinte',
      focusInput: 'Focar a entrada da sessão',
      messagePrevious: 'Mensagem enviada anterior',
      messageNext: 'Mensagem enviada seguinte',
      modelSelect: 'Abrir o seletor de modelo',
      historyHint: 'Com a caixa vazia, ↑ recupera a mensagem enviada mais recente e outro ↑ recua; ↓ avança e limpa o rascunho depois da mais recente. Só é recuperado texto do histórico carregado; imagens e anexos não são restaurados.',
      modelUnavailable: 'O seletor de modelo está indisponível agora',
      unbound: 'Sem atalho',
      noSession: 'Este espaço de trabalho não tem outra sessão',
      desktopOnly: 'As setas Ctrl/Alt de plugins e sessões só têm valor predefinido no Desktop. As ↑/↓ do histórico são entrada local fixa e também funcionam na Web. Ctrl+M passa a Ctrl+Alt+M por predefinição na Web.',
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
     * Read the current Session's sent-message text from the official Chat
     * projection. `order` includes folded/hidden rows; `nodes.get` resolves
     * them without imposing render order, so history is not limited to whatever
     * the viewport currently shows.
     * @param ctx - the browser context the plugin runs on.
     * @param sessionId - Session whose loaded history is wanted.
     * @returns ordered `{ key, seq, text }` entries; non-text content is omitted.
     */
    function sentMessages(ctx, sessionId) {
      const conversation = ctx.get('uiConversation')
      if (conversation === undefined) return []
      let binding
      try {
        binding = conversation.binding(sessionId)
      } catch (error) {
        console.error('[keynav] conversation binding unavailable:', error)
        return []
      }
      let chat = binding.target('chat').getSnapshot()
      if (chat === undefined) {
        binding.activate('chat')
        chat = binding.target('chat').getSnapshot()
      }
      if (chat === undefined || chat.order === undefined || chat.nodes === undefined) return []
      const messages = []
      const durableRpcIds = new Set()
      for (const key of chat.order) {
        const node = chat.nodes.get(key)
        if (node === undefined || node === null || (node.kind !== 'user' && node.kind !== 'steering')) continue
        const data = node.data
        if (data === undefined || data === null) continue
        const source = data.source
        if (source === undefined || source === null || source.kind !== 'user') continue
        const content = data.content
        if (!Array.isArray(content)) continue
        const text = content
          .filter(part => part !== undefined && part !== null && part.type === 'text' && typeof part.text === 'string')
          .map(part => part.text)
          .join('\n\n')
        if (text.trim() === '') continue
        const rpcId = typeof source.rpcId === 'string' ? source.rpcId : undefined
        if (rpcId !== undefined) durableRpcIds.add(rpcId)
        messages.push({ key: rpcId === undefined ? `seq:${data.seq}` : `rpc:${rpcId}`, seq: data.seq, text })
      }
      messages.sort((left, right) => left.seq - right.seq)
      // Accepted local echoes can exist briefly before their durable user/message
      // node. Keep them in history without duplicating the row once it lands.
      const sessions = ctx.get('sessions')
      const session = sessions === undefined ? undefined : sessions.binding(sessionId)?.session
      const pending = session === undefined || session.getSnapshot === undefined
        ? []
        : session.getSnapshot().pendingSubmissions ?? []
      for (const echo of pending) {
        if (echo === undefined || echo === null || typeof echo.text !== 'string' || echo.text.trim() === '') continue
        if (durableRpcIds.has(echo.requestId)) continue
        messages.push({ key: `rpc:${echo.requestId}`, seq: Number.MAX_SAFE_INTEGER, text: echo.text })
      }
      return messages
    }

    /**
     * Resolve one history step without mutating the composer.
     * @param ctx - the browser context the plugin runs on.
     * @param delta - -1 for older, +1 for newer.
     * @param target - the event's original editable element.
     * @param memory - per-Session cursor owned by the plugin.
     * @returns the input and next draft text, or undefined when arrows belong to
     * the editor/menu rather than message history.
     */
    function planMessage(ctx, delta, target, memory) {
      if (target === undefined || target === null || typeof target.closest !== 'function') return undefined
      if (target.closest('[data-input-scroll]') === null) return undefined
      if (target.isContentEditable !== true) return undefined
      const current = currentSession(ctx)
      if (current === undefined) return undefined
      const owner = target.closest('[data-conversation-session]')
      if (owner === null || owner.getAttribute('data-conversation-session') !== current.id) return undefined
      const input = composerInput(ctx, current.id)
      if (input === undefined) return undefined
      const state = input.state.getSnapshot()
      if (state.phase !== 'plain') return undefined
      if (state.attachmentIds !== undefined && state.attachmentIds.length > 0) return undefined
      const cursor = memory.get(current.id)
      if (state.draft !== '' && (cursor === undefined || state.draft !== cursor.text || cursor.draftRev !== state.draftRev)) {
        memory.delete(current.id)
        return undefined
      }
      const messages = sentMessages(ctx, current.id)
      if (messages.length === 0) return undefined
      if (state.draft === '') {
        if (delta > 0) return undefined
        const newest = messages[messages.length - 1]
        memory.set(current.id, { key: newest.key, text: newest.text, draftRev: state.draftRev })
        return { input, sessionId: current.id, key: newest.key, text: newest.text }
      }
      if (cursor === undefined) return undefined
      const at = messages.findIndex(message => message.key === cursor.key)
      if (at < 0) {
        memory.delete(current.id)
        return undefined
      }
      const next = at + delta
      if (next < 0) return { input, sessionId: current.id, key: cursor.key, text: cursor.text }
      if (next >= messages.length) {
        memory.delete(current.id)
        return { input, sessionId: current.id, key: null, text: '' }
      }
      const message = messages[next]
      memory.set(current.id, { key: message.key, text: message.text, draftRev: state.draftRev })
      return { input, sessionId: current.id, key: message.key, text: message.text }
    }

    /**
     * Apply one history plan and refresh its draft revision. Keeping the rev in
     * the cursor means an edit/undo that leaves identical clipboard text still
     * hands the arrows back to the editor.
     * @param plan - resolved input and next draft.
     * @param memory - per-Session cursor owned by the plugin.
     */
    function applyMessage(plan, memory) {
      plan.input.setDraft(plan.text)
      if (plan.key === null) {
        memory.delete(plan.sessionId)
      } else {
        memory.set(plan.sessionId, {
          key: plan.key,
          text: plan.text,
          draftRev: plan.input.state.getSnapshot().draftRev,
        })
      }
      plan.input.focus()
    }

    /**
     * Resolve the current Session and composer for the model command.
     * @param ctx - the browser context the plugin runs on.
     * @returns a model-selector plan, or undefined without a usable Session.
     */
    function planModel(ctx) {
      const current = currentSession(ctx)
      if (current === undefined) return undefined
      const input = composerInput(ctx, current.id)
      if (input === undefined) return undefined
      const sessions = ctx.get('sessions')
      const scope = sessions === undefined ? undefined : sessions.scope(current.id)
      if (scope === undefined) return undefined
      if (sessions.subagentAddress(current.id) !== undefined) return undefined
      return { input, layout: ctx.get('layout'), scope, sessionId: current.id }
    }

    /**
     * Open DSH's official /model popup through the public trigger controller.
     *
     * The synthetic hit is a collapsed span at the draft end: opening and
     * settling the popup therefore cannot consume or rewrite the user's draft.
     * The command menu is only a short-lived launcher; the visible result is the
     * same model selector the slash command and composer seat use.
     * @param plan - resolved Session/composer/layout.
     * @param ctx - the browser context the plugin runs on.
     * @param t - localized plugin copy.
     * @param cleanups - plugin-owned disposer set for the pending subscription.
     */
    function applyModel(plan, ctx, t, cleanups) {
      let cancelled = false
      const cancel = () => { cancelled = true; cleanups.delete(cancel) }
      cleanups.add(cancel)
      if (plan.layout !== undefined) {
        try {
          plan.layout.selectPanel(null)
        } catch (error) {
          console.error('[keynav] returning to the Conversation failed:', error)
        }
      }
      const open = () => {
        cleanups.delete(cancel)
        if (cancelled) return
        // One focus only: a retry loop could steal focus back after the model
        // popup has already moved it into its own menu.
        try {
          plan.input.focus()
        } catch (error) {
          console.error('[keynav] model focus failed:', error)
        }
        const triggers = ctx.get('inputTriggers')
        if (triggers === undefined) {
          plan.input.notify('error', t('modelUnavailable'))
          return
        }
        let controller
        try {
          controller = triggers.sessionOf(plan.scope)
        } catch (error) {
          console.error('[keynav] model launcher unavailable:', error)
          plan.input.notify('error', t('modelUnavailable'))
          return
        }
        if (controller.menu.getSnapshot().open) controller.dismiss()
        const state = plan.input.state.getSnapshot()
        const end = state.draft.length
        controller.toggleSource('command', {
          trigger: '/',
          query: 'model',
          quoted: false,
          position: state.draft.trim() === '' ? 'leading' : 'inline',
          span: { start: end, end, draftRev: state.draftRev },
        })
        const generation = controller.menu.getSnapshot().generation
        if (!controller.menu.getSnapshot().open) {
          plan.input.notify('error', t('modelUnavailable'))
          return
        }
        let off = () => {}
        let timer = undefined
        const cleanup = () => {
          off()
          if (timer !== undefined) clearTimeout(timer)
          cleanups.delete(cleanup)
        }
        cleanups.add(cleanup)
        const check = () => {
          const menu = controller.menu.getSnapshot()
          if (!menu.open || menu.generation !== generation) {
            cleanup()
            return
          }
          const group = menu.groups.find(item => item.source === 'command')
          if (group === undefined || group.status !== 'ready') return
          const index = group.items.findIndex(item => item.name === 'model')
          cleanup()
          if (index < 0) {
            controller.dismiss()
            plan.input.focus()
            plan.input.notify('error', t('modelUnavailable'))
            return
          }
          controller.pick('command', index)
        }
        off = controller.menu.subscribe(check)
        timer = setTimeout(() => {
          cleanup()
          const menu = controller.menu.getSnapshot()
          if (menu.open && menu.generation === generation) {
            controller.dismiss()
            plan.input.focus()
            plan.input.notify('error', t('modelUnavailable'))
          }
        }, 5000)
        check()
      }
      if (typeof requestAnimationFrame === 'function') requestAnimationFrame(open)
      else setTimeout(open, 0)
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
      const fixedCatalog = props.fixedCatalog
      const entries = useSyncExternalStore(catalog.subscribe, catalog.getSnapshot)
      const fixedEntries = useSyncExternalStore(fixedCatalog.subscribe, fixedCatalog.getSnapshot)

      const keycaps = (id) => {
        const entry = entries.find(candidate => candidate.id === id)
          ?? fixedEntries.find(candidate => candidate.id === id)
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
            h('section', { className: 'kn-card' },
              h('h2', { className: 'kn-card-title' }, t('sectionMessages')),
              row(MESSAGE_PREVIOUS, 'messagePrevious'),
              row(MESSAGE_NEXT, 'messageNext'),
              h('p', { className: 'kn-note' }, t('historyHint'))),
            h('section', { className: 'kn-card' },
              h('h2', { className: 'kn-card-title' }, t('sectionModel')),
              row(MODEL_SELECT, 'modelSelect')),
            h('p', { className: 'kn-note' }, t('desktopOnly')))))
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, { zh, en, ja, es, fr, de, ru, pt }), 'keynav: dictionaries')
        const t = ctx.locale.bind(NS)

        // Effective keycaps, read back from the shared catalogs so a rebind shows
        // here without this plugin tracking the preference store.
        const shortcutSource = (name) => ({
          getSnapshot: () => {
            const shortcuts = ctx.get('shortcuts')
            return shortcuts === undefined || shortcuts[name] === undefined
              ? EMPTY_CATALOG
              : shortcuts[name].getSnapshot()
          },
          subscribe: (listener) => {
            const shortcuts = ctx.get('shortcuts')
            if (shortcuts === undefined || shortcuts[name] === undefined) return () => {}
            return shortcuts[name].subscribe(listener)
          },
        })
        const catalog = shortcutSource('catalog')
        const fixedCatalog = shortcutSource('fixedCatalog')

        ctx.effect(() => ctx.slots.inject('main', () => ctx.slots.register({
          name: 'main',
          key: PANEL_ID,
          locale: NS,
          inject: () => ({ catalog, fixedCatalog }),
        }, KeyNavPage)), 'keynav: panel page')

        ctx.effect(() => ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
          name: 'sidebar.panellist',
          id: PANEL_ID,
          order: 40,
          label: () => t('panel'),
          locale: NS,
        }, PanelIcon)), 'keynav: sidebar entry')

        ctx.inject(['shortcuts', 'layout', 'sessions', 'workspaces', 'uiWorkspace', 'uiConversation', 'inputTriggers'], (scope) => {
          const messageMemory = new Map()
          const modelCleanups = new Set()
          scope.effect(() => () => {
            messageMemory.clear()
            for (const cleanup of [...modelCleanups]) cleanup()
          }, 'keynav: message and model state')
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
          register(MODEL_SELECT, 'modelSelect', ['select model', 'model selector', 'switch model'], {
            'desktop:macos': { code: 'KeyM', modifiers: ['primary'] },
            'desktop:windows': { code: 'KeyM', modifiers: ['primary'] },
            'desktop:linux': { code: 'KeyM', modifiers: ['primary'] },
            'web:macos': { code: 'KeyM', modifiers: ['primary', 'alt'] },
            'web:windows': { code: 'KeyM', modifiers: ['primary', 'alt'] },
          }, () => {
            const target = planModel(scope)
            return target === undefined ? undefined : { run: () => { applyModel(target, scope, t, modelCleanups) } }
          })

          // Bare arrows are fixed local input, not editable application bindings:
          // the shortcut service reserves them for text editing on Web/Linux.
          // The observer runs after local controls, so an open trigger menu or
          // IME composition has already consumed/composed the key.
          for (const [id, labelKey, code, delta] of [
            [MESSAGE_PREVIOUS, 'messagePrevious', 'ArrowUp', -1],
            [MESSAGE_NEXT, 'messageNext', 'ArrowDown', 1],
          ]) {
            scope.effect(() => scope.shortcuts.registerFixed({
              id,
              label: () => t(labelKey),
              keys: [delta < 0 ? '↑' : '↓'],
              bindings: [{ code, modifiers: [] }],
              group: 'input',
            }), `keynav: ${id} reference`)
          }
          scope.effect(() => scope.shortcuts.observeFixedInput((input) => {
            if (input.type !== 'keydown') return
            const { gesture, context } = input
            if (gesture.composing || gesture.defaultPrevented || gesture.repeat) return
            if (gesture.control || gesture.alt || gesture.shift || gesture.meta) return
            if (context.modal !== null || context.region !== 'editable') return
            const delta = gesture.code === 'ArrowUp' ? -1 : gesture.code === 'ArrowDown' ? 1 : 0
            if (delta === 0) return
            const plan = planMessage(scope, delta, context.target, messageMemory)
            if (plan === undefined) return
            input.consume()
            try {
              applyMessage(plan, messageMemory)
            } catch (error) {
              console.error('[keynav] recalling a message failed:', error)
            }
          }), 'keynav: message history input')
        })
      },
    }
  },
})
