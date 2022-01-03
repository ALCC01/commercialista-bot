import { readFile } from 'fs/promises'
import { resolve } from 'path'
import { Shortcut, ShortcutsFile } from './schema'
import Ajv from 'ajv'
import schema from './shortcuts.schema.json'
import { buildShortcut, CompiledShortcut } from './compiler'

const SHORTCUTS_FILE = resolve(process.env.SHORTCUTS_FILE || './shortcuts.json')
export let SHORTCUTS: Shortcut[] = []
let COMPILED_SHORTCUTS: { [key: string]: CompiledShortcut } = {}

const validate = new Ajv().compile(schema)

export const loadShortcuts = async () => {
  const raw = await readFile(SHORTCUTS_FILE)
  const json = JSON.parse(raw.toString())

  if (!validate(json)) {
    throw validate.errors
  }

  SHORTCUTS = (json as ShortcutsFile).shortcuts
  COMPILED_SHORTCUTS = Object.fromEntries(SHORTCUTS.map(s => [s.icon, buildShortcut(s)]))
}

export const findShortcut = (q: string) => SHORTCUTS.find(({ icon }) => icon === q)

export const getShortcutMachine = (q: string) => COMPILED_SHORTCUTS[q]

export { Shortcut } from './schema'
