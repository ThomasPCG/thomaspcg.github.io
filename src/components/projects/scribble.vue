<script setup lang="ts">
    /**
     * Live demo for /work/scribble: a rich-text notepad. Tiptap on the left (about three
     * quarters), the saved notes on the right. Notes are kept in
     * `preferences.projects.scribble.notes` (see use-preferences.ts), newest first.
     * Saving is explicit (Save button or Ctrl/Cmd+S); switching to another note or
     * leaving the page saves pending changes rather than dropping them.
     */
    import StarterKit from '@tiptap/starter-kit'
    import { Placeholder } from '@tiptap/extensions'
    import { EditorContent, useEditor } from '@tiptap/vue-3'
    import { computed, onBeforeUnmount, ref } from 'vue'
    import { readProjectState, writeProjectState } from '@/composables/use-preferences'

    interface Note {
        id: string
        html: string
        /** Plain text with a newline between blocks: feeds the list's title and preview. */
        text: string
        updatedAt: number
    }

    interface Tool {
        name: string
        title: string
        glyph: string
        cls?: string
        active: boolean
        disabled?: boolean
        run: () => void
    }

    const SLUG = 'scribble'
    const KEY = 'notes'

    // Whatever is in storage may be stale or hand-edited, so keep only well-formed notes.
    function loadNotes(): Note[] {
        const stored = readProjectState(SLUG, KEY)
        if (!Array.isArray(stored)) return []
        return stored
            .filter((n): n is Note =>
                !!n
                && typeof n.id === 'string'
                && typeof n.html === 'string'
                && typeof n.text === 'string'
                && typeof n.updatedAt === 'number')
            .sort((a, b) => b.updatedAt - a.updatedAt)
    }

    const notes = ref<Note[]>(loadNotes())
    const activeId = ref<string | null>(notes.value[0]?.id ?? null)
    const dirty = ref(false)
    const savedAt = ref<number | null>(notes.value[0]?.updatedAt ?? null)
    const armed = ref(false)
    // Bumped on every editor transaction so the toolbar and status re-evaluate.
    const tick = ref(0)
    let armTimer: number | undefined

    const editor = useEditor({
        content: notes.value[0]?.html ?? '',
        extensions: [
            StarterKit.configure({ link: false }),
            Placeholder.configure({ placeholder: 'Start writing' }),
        ],
        editorProps: { attributes: { 'aria-label': 'Note', 'aria-multiline': 'true' } },
        onUpdate: () => { dirty.value = true },
        onTransaction: () => { tick.value++ },
    })

    const empty = computed(() => {
        void tick.value
        return editor.value?.isEmpty ?? true
    })

    const toolbar = computed<Tool[][]>(() => {
        void tick.value
        const ed = editor.value
        const is = (name: string, attrs?: Record<string, unknown>) => ed?.isActive(name, attrs) ?? false
        return [
            [
                { name: 'bold', title: 'Bold', glyph: 'B', cls: 'tool__b', active: is('bold'), run: () => ed?.chain().focus().toggleBold().run() },
                { name: 'italic', title: 'Italic', glyph: 'I', cls: 'tool__i', active: is('italic'), run: () => ed?.chain().focus().toggleItalic().run() },
                { name: 'underline', title: 'Underline', glyph: 'U', cls: 'tool__u', active: is('underline'), run: () => ed?.chain().focus().toggleUnderline().run() },
                { name: 'strike', title: 'Strikethrough', glyph: 'S', cls: 'tool__s', active: is('strike'), run: () => ed?.chain().focus().toggleStrike().run() },
            ],
            [
                { name: 'h1', title: 'Heading', glyph: 'H1', active: is('heading', { level: 1 }), run: () => ed?.chain().focus().toggleHeading({ level: 1 }).run() },
                { name: 'h2', title: 'Subheading', glyph: 'H2', active: is('heading', { level: 2 }), run: () => ed?.chain().focus().toggleHeading({ level: 2 }).run() },
            ],
            [
                { name: 'bullets', title: 'Bulleted list', glyph: '•', active: is('bulletList'), run: () => ed?.chain().focus().toggleBulletList().run() },
                { name: 'numbers', title: 'Numbered list', glyph: '1.', active: is('orderedList'), run: () => ed?.chain().focus().toggleOrderedList().run() },
                { name: 'quote', title: 'Quote', glyph: '“', active: is('blockquote'), run: () => ed?.chain().focus().toggleBlockquote().run() },
                { name: 'code', title: 'Code block', glyph: '</>', cls: 'tool__code', active: is('codeBlock'), run: () => ed?.chain().focus().toggleCodeBlock().run() },
            ],
            [
                { name: 'undo', title: 'Undo', glyph: '↶', active: false, disabled: !ed?.can().undo(), run: () => ed?.chain().focus().undo().run() },
                { name: 'redo', title: 'Redo', glyph: '↷', active: false, disabled: !ed?.can().redo(), run: () => ed?.chain().focus().redo().run() },
            ],
        ]
    })

    const timeFmt = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' })
    const dayFmt = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short' })

    /** Time of day for today, day and month otherwise. */
    function stamp(t: number) {
        const d = new Date(t)
        return d.toDateString() === new Date().toDateString() ? timeFmt.format(d) : dayFmt.format(d)
    }

    const entries = computed(() =>
        notes.value.map(note => {
            const lines = note.text.split('\n').map(l => l.trim()).filter(Boolean)
            return {
                id: note.id,
                title: lines[0] ?? 'Untitled',
                preview: lines.slice(1).join(' '),
                when: stamp(note.updatedAt),
                note,
            }
        }),
    )

    const status = computed(() => {
        if (dirty.value) return 'Unsaved changes'
        if (savedAt.value) return `Saved ${stamp(savedAt.value)}`
        return 'New note'
    })

    const canSave = computed(() => dirty.value && !empty.value)
    const canDelete = computed(() => activeId.value !== null || !empty.value)

    const persist = () => writeProjectState(SLUG, KEY, notes.value)
    const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`

    function disarm() {
        window.clearTimeout(armTimer)
        armed.value = false
    }

    function save() {
        const ed = editor.value
        if (!ed || ed.isEmpty) return
        const id = activeId.value ?? newId()
        const now = Date.now()
        const note: Note = {
            id,
            html: ed.getHTML(),
            text: ed.getText({ blockSeparator: '\n' }),
            updatedAt: now,
        }
        notes.value = [note, ...notes.value.filter(n => n.id !== id)]
        activeId.value = id
        savedAt.value = now
        dirty.value = false
        persist()
    }

    /** Opens a note, or a blank draft for null, keeping any pending changes. */
    function show(note: Note | null) {
        if (dirty.value && !empty.value) save()
        disarm()
        activeId.value = note?.id ?? null
        savedAt.value = note?.updatedAt ?? null
        dirty.value = false
        editor.value?.commands.setContent(note?.html ?? '', { emitUpdate: false })
        if (!note) editor.value?.commands.focus()
    }

    // The first press arms the button; a second within three seconds deletes.
    function remove() {
        if (!armed.value) {
            armed.value = true
            armTimer = window.setTimeout(() => { armed.value = false }, 3000)
            return
        }
        if (activeId.value) {
            notes.value = notes.value.filter(n => n.id !== activeId.value)
            persist()
        }
        activeId.value = null
        dirty.value = false
        show(null)
    }

    function onKeydown(e: KeyboardEvent) {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
            e.preventDefault()
            save()
        }
    }

    onBeforeUnmount(() => {
        disarm()
        if (dirty.value && !empty.value) save()
    })
</script>

<template>
    <div class="scribble" @keydown="onKeydown">
        <section class="pad" aria-label="Editor">
            <div class="toolbar" role="toolbar" aria-label="Formatting">
                <template v-for="(group, g) in toolbar" :key="g">
                    <span v-if="g" class="toolbar__sep" aria-hidden="true"></span>
                    <button
                        v-for="tool in group"
                        :key="tool.name"
                        type="button"
                        class="tool"
                        :class="{ 'is-on': tool.active }"
                        :title="tool.title"
                        :aria-label="tool.title"
                        :aria-pressed="tool.active"
                        :disabled="!editor || tool.disabled"
                        @mousedown.prevent
                        @click="tool.run()"
                    >
                        <span :class="tool.cls" v-text="tool.glyph"></span>
                    </button>
                </template>
            </div>

            <div class="pad__body" @click.self="editor?.commands.focus('end')">
                <EditorContent :editor="editor" />
            </div>

            <footer class="pad__foot">
                <span class="t-label" :class="{ 'is-dirty': dirty }" role="status" v-text="status"></span>
                <div class="pad__actions">
                    <button
                        type="button"
                        class="btn btn--ghost"
                        :class="{ 'is-armed': armed }"
                        :disabled="!canDelete"
                        @click="remove"
                        @blur="disarm"
                    >
                        <span v-text="armed ? 'Confirm delete' : 'Delete'"></span>
                    </button>
                    <button type="button" class="btn btn--solid" :disabled="!canSave" @click="save">
                        <span>Save</span>
                    </button>
                </div>
            </footer>
        </section>

        <aside class="notes" aria-label="Saved notes">
            <header class="notes__head">
                <h3 class="t-label">Notes</h3>
                <button type="button" class="notes__new t-label" @click="show(null)">
                    <span>New</span>
                </button>
            </header>

            <ul v-if="entries.length" class="notes__list">
                <li v-for="entry in entries" :key="entry.id">
                    <button
                        type="button"
                        class="note"
                        :class="{ 'is-active': entry.id === activeId }"
                        :aria-current="entry.id === activeId"
                        @click="show(entry.note)"
                    >
                        <span class="note__title" v-text="entry.title"></span>
                        <span v-if="entry.preview" class="note__preview" v-text="entry.preview"></span>
                        <span class="note__when t-label" v-text="entry.when"></span>
                    </button>
                </li>
            </ul>
            <p v-else class="notes__empty">Nothing saved yet. Write something and press Save.</p>
        </aside>
    </div>
</template>

<style scoped>

    /* Two columns, 3:1. The plate (project-view) supplies the frame and background. */
    .scribble {
        display: grid;
        grid-template-columns: minmax(0, 3fr) minmax(0, 1fr);
        height: clamp(520px, 56vw, 660px);
        text-align: left;
    }

    .pad {
        display: flex;
        flex-direction: column;
        min-width: 0;
        min-height: 0;
    }

    /* ---------------------------------------------------------------- toolbar */
    .toolbar {
        display: flex;
        align-items: center;
        gap: 2px;
        padding: 10px clamp(12px, 2vw, 24px);
        border-bottom: 1px solid var(--line);
        overflow-x: auto;
        scrollbar-width: none;
    }

    .toolbar__sep {
        flex: none;
        width: 1px;
        height: 18px;
        margin-inline: 8px;
        background: var(--line-strong);
    }

    .tool {
        flex: none;
        display: grid;
        place-items: center;
        min-width: 34px;
        height: 34px;
        padding: 0 6px;
        border: 1px solid transparent;
        background: none;
        color: var(--fg-muted);
        font: inherit;
        font-size: 0.85rem;
        cursor: pointer;
        transition: color 0.2s var(--ease), border-color 0.2s var(--ease), background-color 0.2s var(--ease);
    }

    .tool:hover:not(:disabled) {
        color: var(--fg);
        border-color: var(--line-strong);
    }

    .tool.is-on {
        background: var(--fg);
        border-color: var(--fg);
        color: var(--bg);
    }

    .tool:disabled {
        opacity: 0.35;
        cursor: default;
    }

    .tool__b {
        font-weight: 700;
    }

    .tool__i {
        font-family: var(--font-serif);
        font-size: 1.15rem;
        font-style: italic;
    }

    .tool__u {
        text-decoration: underline;
        text-underline-offset: 3px;
    }

    .tool__s {
        text-decoration: line-through;
    }

    .tool__code {
        font-family: var(--font-mono);
        font-size: 0.72rem;
    }

    /* ----------------------------------------------------------------- editor */
    .pad__body {
        flex: 1;
        min-height: 0;
        padding: clamp(20px, 3vw, 36px);
        overflow-y: auto;
        cursor: text;
        scrollbar-width: thin;
    }

    .pad__body :deep(.tiptap) {
        outline: none;
        font-size: 1rem;
        line-height: 1.7;
        overflow-wrap: anywhere;
    }

    .pad__body :deep(.tiptap > :first-child) {
        margin-top: 0;
    }

    .pad__body :deep(.tiptap p) {
        margin-block: 0.55em;
    }

    .pad__body :deep(.tiptap p.is-editor-empty:first-child::before) {
        content: attr(data-placeholder);
        float: left;
        height: 0;
        color: var(--fg-dim);
        pointer-events: none;
    }

    .pad__body :deep(.tiptap h1),
    .pad__body :deep(.tiptap h2) {
        margin-block: 0.7em 0.25em;
        font-family: var(--font-serif);
        font-weight: 600;
        line-height: 1.05;
    }

    .pad__body :deep(.tiptap h1) {
        font-size: clamp(2.2rem, 3.6vw, 3rem);
    }

    .pad__body :deep(.tiptap h2) {
        font-size: clamp(1.7rem, 2.6vw, 2.15rem);
    }

    .pad__body :deep(.tiptap ul),
    .pad__body :deep(.tiptap ol) {
        padding-left: 1.4em;
    }

    .pad__body :deep(.tiptap li p) {
        margin-block: 0.2em;
    }

    .pad__body :deep(.tiptap blockquote) {
        margin: 0.9em 0;
        padding-left: 1em;
        border-left: 2px solid var(--accent);
        color: var(--fg-muted);
        font-family: var(--font-serif);
        font-size: 1.15em;
    }

    .pad__body :deep(.tiptap code) {
        padding: 0.1em 0.35em;
        background: var(--line);
        font-family: var(--font-mono);
        font-size: 0.85em;
    }

    .pad__body :deep(.tiptap pre) {
        margin: 0.9em 0;
        padding: 14px 16px;
        border: 1px solid var(--line);
        background: var(--line);
        overflow-x: auto;
        font-family: var(--font-mono);
        font-size: 0.85rem;
        line-height: 1.6;
    }

    .pad__body :deep(.tiptap pre code) {
        padding: 0;
        background: none;
        font-size: inherit;
    }

    /* ----------------------------------------------------------------- footer */
    .pad__foot {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 12px clamp(12px, 2vw, 24px);
        border-top: 1px solid var(--line);
    }

    .pad__foot .is-dirty {
        color: var(--accent);
    }

    .pad__actions {
        display: flex;
        gap: 8px;
    }

    .btn {
        padding: 9px 18px;
        border: 1px solid var(--fg);
        background: none;
        color: var(--fg);
        font-family: var(--font-mono);
        font-size: 0.72rem;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        cursor: pointer;
        transition: background-color 0.2s var(--ease), color 0.2s var(--ease), border-color 0.2s var(--ease), opacity 0.2s var(--ease);
    }

    .btn--solid {
        background: var(--fg);
        color: var(--bg);
    }

    .btn--solid:hover:not(:disabled) {
        background: var(--accent);
        border-color: var(--accent);
        color: var(--on-accent);
    }

    .btn--ghost {
        border-color: var(--line-strong);
        color: var(--fg-muted);
    }

    .btn--ghost:hover:not(:disabled) {
        border-color: var(--fg);
        color: var(--fg);
    }

    .btn--ghost.is-armed {
        border-color: var(--accent);
        background: var(--accent);
        color: var(--on-accent);
    }

    .btn:disabled {
        opacity: 0.35;
        cursor: default;
    }

    /* ------------------------------------------------------------- notes list */
    .notes {
        display: flex;
        flex-direction: column;
        min-width: 0;
        min-height: 0;
        border-left: 1px solid var(--line);
        background: color-mix(in srgb, var(--fg) 3%, transparent);
    }

    .notes__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 clamp(12px, 1.6vw, 20px);
        height: 55px;
        border-bottom: 1px solid var(--line);
    }

    .notes__new {
        padding: 6px 0;
        border: 0;
        background: none;
        color: var(--fg);
        cursor: pointer;
        transition: color 0.2s var(--ease);
    }

    .notes__new:hover {
        color: var(--accent);
    }

    .notes__new::before {
        content: '+ ';
    }

    .notes__list {
        flex: 1;
        margin: 0;
        padding: 0;
        list-style: none;
        overflow-y: auto;
        scrollbar-width: thin;
    }

    .note {
        display: grid;
        gap: 4px;
        width: 100%;
        padding: 14px clamp(12px, 1.6vw, 20px);
        border: 0;
        border-bottom: 1px solid var(--line);
        background: none;
        color: var(--fg);
        font: inherit;
        text-align: left;
        cursor: pointer;
        transition: background-color 0.2s var(--ease), box-shadow 0.2s var(--ease);
    }

    .note:hover {
        background: color-mix(in srgb, var(--fg) 4%, transparent);
    }

    .note.is-active {
        background: color-mix(in srgb, var(--fg) 7%, transparent);
        box-shadow: inset 2px 0 0 var(--accent);
    }

    .note__title {
        overflow: hidden;
        font-size: 0.9rem;
        font-weight: 500;
        line-height: 1.35;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .note__preview {
        display: -webkit-box;
        overflow: hidden;
        color: var(--fg-muted);
        font-size: 0.8rem;
        line-height: 1.5;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        line-clamp: 2;
    }

    .note__when {
        color: var(--fg-dim);
        font-size: 0.65rem;
    }

    .notes__empty {
        padding: 20px;
        color: var(--fg-muted);
        font-size: 0.85rem;
    }

    /* Phones: the list moves under the editor. */
    @media (max-width: 759.98px) {
        .scribble {
            grid-template-columns: minmax(0, 1fr);
            grid-template-rows: 480px auto;
            height: auto;
        }

        .notes {
            border-left: 0;
            border-top: 1px solid var(--line);
        }

        .notes__list {
            max-height: 260px;
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .tool,
        .btn,
        .note,
        .notes__new {
            transition: none;
        }
    }
</style>
