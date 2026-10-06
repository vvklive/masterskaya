// Свободное время команды: кто из отдыхающих чем займётся и с кем.
import type { Pastime, Worker } from '../types'
import { ROLES, face } from './roles'

const SOLO: Pastime[] = [
  'sleep',
  'eat',
  'coffee',
  'walk',
  'shower',
  'read',
  'phone',
  'gym',
  'music',
  'dance',
  'balloon',
  'game',
  'guitar',
  'yoga',
  'plant',
  'juggle',
  'paint',
]
const PAIR: Pastime[] = ['chat', 'ball']
const PAIR_CHANCE = 0.35

const SOLO_LABEL: Record<Exclude<Pastime, 'chat' | 'ball'>, string> = {
  sleep: 'спит',
  eat: 'ест курочку',
  coffee: 'пьёт кофе',
  walk: 'гуляет',
  shower: 'моется в душе',
  read: 'читает газету',
  phone: 'листает ленту',
  gym: 'качает гантели',
  music: 'слушает музыку',
  dance: 'танцует',
  balloon: 'летает на шарике',
  game: 'играет в приставку',
  guitar: 'играет на гитаре',
  yoga: 'медитирует',
  plant: 'поливает цветок',
  juggle: 'жонглирует',
  paint: 'рисует картину',
}

export function label(p: Pastime, mate?: Worker): string {
  const inst = mate ? ROLES[face(mate)].inst : 'соседом'
  if (p === 'chat') return 'болтает с ' + inst
  if (p === 'ball') return 'играет в мяч с ' + inst
  return SOLO_LABEL[p]
}

const free = (w: Worker | undefined): w is Worker => !!w && w.status === 'idle' && !w.leftAt

/** Кому из отдыхающих пора сменить занятие и на что: id → поля для записи. */
export function plan(list: Worker[], now: number, rand: () => number = Math.random): Map<string, Partial<Worker>> {
  const out = new Map<string, Partial<Worker>>()
  const until = (): number => now + 8000 + Math.floor(rand() * 8000)
  const pick = <T>(xs: T[]): T => xs[Math.floor(rand() * xs.length)] ?? (xs[0] as T)
  list.forEach((w, i) => {
    if (!free(w) || out.has(w.id)) return
    const mate = w.partner ? list.find(x => x.id === w.partner) : undefined
    const paired = free(mate) && mate.partner === w.id
    if (w.pastime && (w.pastimeUntil ?? 0) > now && (!w.partner || paired)) return
    // в пару зовут соседа справа: в полосе он стоит рядом, мяч летит к нему
    const right = list[i + 1]
    if (free(right) && !out.has(right.id) && (!right.partner || right.partner === w.id) && rand() < PAIR_CHANCE) {
      const kind = pick(PAIR)
      const end = until()
      out.set(w.id, { pastime: kind, partner: right.id, leads: true, pastimeUntil: end, action: label(kind, right) })
      out.set(right.id, { pastime: kind, partner: w.id, leads: false, pastimeUntil: end, action: label(kind, w) })
      return
    }
    const kind = pick(SOLO.filter(p => p !== w.pastime))
    out.set(w.id, { pastime: kind, partner: undefined, leads: undefined, pastimeUntil: until(), action: label(kind) })
  })
  return out
}
