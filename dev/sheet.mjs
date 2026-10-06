// Лист кадров: все роли за работой, по 4 фазы, в PNG. node dev/sheet.mjs out.png [standard|potter|marvel] [rest]
// rest — досуг: занятия по строкам, ведущий персонаж команды
// Бандлит hooks/sprites.ts через esbuild и рисует пиксели кадра (без Chrome).
import { execFileSync } from 'node:child_process'
import { writeFileSync, mkdtempSync } from 'node:fs'
import { deflateSync } from 'node:zlib'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const dir = mkdtempSync(join(tmpdir(), 'ms-'))
const js = join(dir, 'sprites.mjs')
const entry = join(dir, 'entry.ts')
writeFileSync(entry, `export * from '${process.cwd()}/hooks/sprites.ts'\nexport { setTeam } from '${process.cwd()}/hooks/roles.ts'\n`)
execFileSync('npx', ['-y', 'esbuild', entry, '--bundle', '--format=esm', '--outfile=' + js], { stdio: 'ignore' })
const MS = await import(js)
MS.setTeam(process.argv[3] || 'standard')
const ROLES = ['foreman', 'mechanic', 'researcher', 'scout', 'writer', 'designer', 'apprentice', 'artist', 'librarian', 'editor', 'planner', 'done']
const PH = [0, 2, 4, 6], S = 8, CW = 22, CH = 10
const W = PH.length * CW * S, H = ROLES.length * CH * S
const img = Buffer.alloc(W * H * 3, 0xff)
const REST = ['eat', 'coffee', 'read', 'phone', 'game', 'balloon', 'plant', 'juggle', 'ball', 'gym', 'music', 'paint']
const rest = process.argv[4] === 'rest'
ROLES.forEach((r, ry) => PH.forEach((t, cx) => {
  const px = rest
    ? MS.frame('mechanic', 'idle', t * 2 + 4, undefined, false, { pastime: REST[ry], leads: true, tt: t * 2 })
    : MS.frame(r === 'done' ? 'mechanic' : r, r === 'done' ? 'done' : 'work', t, r === 'foreman' ? undefined : MS.bodyColor(3))
  px.forEach((row, y) => row.forEach((c, x) => {
    if (c == null) return
    for (let i = 0; i < S; i++) for (let j = 0; j < S; j++) {
      const o = (((ry * CH + y + 1) * S + i) * W + (cx * CW + x) * S + j) * 3
      img[o] = (c >> 16) & 255; img[o + 1] = (c >> 8) & 255; img[o + 2] = c & 255
    }
  }))
}))
const raw = Buffer.alloc((W * 3 + 1) * H)
for (let y = 0; y < H; y++) img.copy(raw, y * (W * 3 + 1) + 1, y * W * 3, (y + 1) * W * 3)
const crc = (b) => { let c = ~0; for (const x of b) { c ^= x; for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1)) } return ~c >>> 0 }
const chunk = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]) }
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(W); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 2
writeFileSync(process.argv[2] || 'sheet.png', Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]))
