import { readdirSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const replacements = [
  ['CSZ Tűzvédelmi Kft.', 'Dunamenti CSZ Kft.'],
  ['CSZ Tűzvédelmi Webáruház', 'Dunamenti CSZ Webáruház'],
  ['CSZ Tűzvédelmi Webshop', 'Dunamenti CSZ Webshop'],
  ['CSZ Tűzvédelem Kft.', 'Dunamenti CSZ Kft.'],
  ['CSZ Tűzvédelem', 'Dunamenti CSZ Kft.'],
]

function walk(dir) {
  const entries = readdirSync(dir, { withFileTypes: true })
  for (const e of entries) {
    const full = join(dir, e.name)
    if (e.isDirectory() && !e.name.startsWith('.') && e.name !== 'node_modules') {
      walk(full)
    } else if (e.isFile() && (e.name.endsWith('.ts') || e.name.endsWith('.tsx'))) {
      let content = readFileSync(full, 'utf8')
      let changed = false
      for (const [from, to] of replacements) {
        if (content.includes(from)) {
          content = content.split(from).join(to)
          changed = true
        }
      }
      if (changed) {
        writeFileSync(full, content)
        console.log('Updated:', full)
      }
    }
  }
}

walk('apps/web/src')
