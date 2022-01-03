import { readFile } from 'fs/promises'
import { resolve } from 'path'
import { Shortcut, ShortcutsFile } from './schema'
import Ajv from 'ajv'
import schema from './shortcuts.schema.json'

const SHORTCUTS_FILE = resolve(process.env.SHORTCUTS_FILE || './shortcuts.json')
export let SHORTCUTS: Shortcut[] = []

const validate = new Ajv().compile(schema)

export const loadShortcuts = async () => {
  const raw = await readFile(SHORTCUTS_FILE)
  const json = JSON.parse(raw.toString())

  if (!validate(json)) {
    throw validate.errors
  }

  SHORTCUTS = (json as ShortcutsFile).shortcuts
}

export const findShortcut = (q: string) => SHORTCUTS.find(({ icon }) => icon === q)

export { Shortcut } from './schema'
