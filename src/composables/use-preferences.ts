/**
 * composables/use-preferences.ts
 *
 * The single `preferences` object in localStorage. The theme sits at the top level
 * (`preferences.theme`); a mini-demo keeps its state under
 * `preferences.projects.<slug>.<key>`, e.g. Scribble's notes at
 * `preferences.projects.scribble.notes`. Writes always merge into what is stored, so
 * one feature never wipes another's data. Storage can be blocked or full, so every
 * access is guarded and a failed write just means the data won't outlive the tab.
 */

export type Preferences = Record<string, unknown>

const STORAGE_KEY = 'preferences'

const isRecord = (value: unknown): value is Record<string, unknown> =>
    !!value && typeof value === 'object' && !Array.isArray(value)

export function readPreferences(): Preferences {
    try {
        const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
        return isRecord(parsed) ? parsed : {}
    } catch {
        return {}
    }
}

/** Merges `patch` into the stored object (top-level keys). */
export function writePreferences(patch: Preferences) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...readPreferences(), ...patch }))
    } catch {
        // Nothing to do: the value stays in memory for this tab.
    }
}

/** Reads `preferences.projects.<slug>.<key>`; the caller validates the shape. */
export function readProjectState(slug: string, key: string): unknown {
    const projects = readPreferences().projects
    const project = isRecord(projects) ? projects[slug] : undefined
    return isRecord(project) ? project[key] : undefined
}

/** Writes `preferences.projects.<slug>.<key>`, leaving every other project and key as is. */
export function writeProjectState(slug: string, key: string, value: unknown) {
    const projects = readPreferences().projects
    const all = isRecord(projects) ? projects : {}
    const project = isRecord(all[slug]) ? all[slug] : {}
    writePreferences({ projects: { ...all, [slug]: { ...project, [key]: value } } })
}
