import { expect, test } from 'claude-code/testing'

import { setTeam } from '../hooks/roles'
import { pose } from '../hooks/sprites'

const drawn = (px: (number | null)[][]): number => px.flat().filter(c => c !== null).length
const leftmost = (px: (number | null)[][]): number => Math.min(...px.map(r => r.findIndex(c => c !== null)).filter(x => x >= 0))

test('стандартные выбегают из-за края и тормозят на месте, а не возникают', () => {
  setTeam('standard')
  expect(drawn(pose('mechanic', 'work', 0, undefined, { out: false, q: 0 }))).toBe(0) // ещё за краем
  const mid = pose('mechanic', 'work', 0, undefined, { out: false, q: 0.4 })
  expect(drawn(mid)).toBeGreaterThan(10)
  expect(leftmost(mid)).toBeGreaterThan(2) // ещё бежит, не на месте
  expect(leftmost(pose('mechanic', 'work', 0, undefined, { out: true, q: 0.6 }))).toBeGreaterThan(2) // убегает вправо
  expect(drawn(pose('mechanic', 'work', 0, undefined, { out: true, q: 1 }))).toBe(0)
})

test('волшебники трансгрессируют: сначала хлопок и дым, без самого волшебника', () => {
  setTeam('potter')
  const crack = pose('mechanic', 'work', 0, undefined, { out: false, q: 0.25 })
  expect(crack.flat()).toContain(0xefefef) // вспышка
  expect(crack.flat()).not.toContain(0xf0c8a0) // лица ещё нет
  setTeam('standard')
})

test('Мстители улетают вверх и скрываются', () => {
  setTeam('marvel')
  const up = pose('mechanic', 'work', 0, undefined, { out: true, q: 0.6 })
  expect(up[7]?.every(c => c === null)).toBe(true) // ноги оторвались от земли
  expect(drawn(pose('mechanic', 'work', 0, undefined, { out: true, q: 1 }))).toBe(0)
  setTeam('standard')
})
