import { readFile } from 'fs/promises'
import { resolve } from 'path'
import { Shortcut, ShortcutsFile } from './schema'

const SHORTCUTS_FILE = resolve(process.env.SHORTCUTS_FILE || './shortcuts.json')
export let SHORTCUTS: Shortcut[] = []

export const loadShortcuts = async () => {
  const raw = await readFile(SHORTCUTS_FILE)

  SHORTCUTS = (JSON.parse(raw.toString()) as ShortcutsFile).shortcuts
}

export const findShortcut = (q: string) => SHORTCUTS.find(({ icon }) => icon === q)
