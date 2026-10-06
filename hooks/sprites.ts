// Пиксельный Clawd в роли специалиста. Холст 21×8 пикселей = Raster 21×4 клетки:
// каждая клетка — полублок ▀ (верхний пиксель цветом символа, нижний — фоном).
// Ряды: 0–1 шляпа, 2–5 тело, 6–7 ноги; инструмент справа на всю высоту.
import type { Pastime, RoleKey, Status } from '../types'
import { ROLES } from './roles'
import type { Hat, Prop, Role } from './roles'

export const SPRITE_COLS = 20 // столбец 0 холста всегда пуст — в Raster его не берём
export const SPRITE_ROWS = 4
const W = SPRITE_COLS + 1
const H = SPRITE_ROWS * 2
const DEFAULT = 0x01000000 // цвет терминала по умолчанию

const PAL = {
  X: 0xd97757, // тело Clawd
  E: 0x1b1b1b, // глаза
  W: 0xefefef,
  G: 0xb8c0cc,
  D: 0x6b7280,
  L: 0x9fd3f5,
  H: 0x8b5a2b,
  Y: 0xf2c230,
  P: 0xef74a2,
  K: 0x222222,
  R: 0xe5484d,
  B: 0x3b4a8c,
  b: 0xe8c9a0,
  g: 0x5fb37a,
  v: 0x8e5bd9,
} as const
type PalKey = keyof typeof PAL
const pal = (ch: string): number | undefined => (ch in PAL ? PAL[ch as PalKey] : undefined)

const BODY = ['.XXXXXXXX.', '.XEXXXXEX.', 'XXXXXXXXXX', '.XXXXXXXX.']
const LOOK_LEFT = '.EXXXXEXX.'
const LOOK_RIGHT = '.XXEXXXXE.'
const EYES_SHUT = '.XXXXXXXX.'
const LEGS = ['.X.X..X.X.', '.X.X..X.X.']
const LEGS_STEP = ['.X.X..X.X.', 'X..X..X..X'] // ноги враскорячку — топчется за работой

const HATS: Record<Exclude<Hat, 'none'>, string[]> = {
  hardhat: ['..HHHHHH..', '.HHHHHHHHH'],
  detective: ['..HHHHHH..', 'HHHHHHHHHH'],
  beret: ['...HHHH...', '..HHHHHHH.'],
  cap: ['..HHHHHH..', '..HHHHHHHH'],
}

// Инструменты в руке: рукоять у руки (клетка 11,4), высота 3–5 клеток, а не в рост персонажа.
// Строки — абсолютные ряды кадра 0–7, пустые сверху не рисуются.
const PROPS: Record<Exclude<Prop, 'bubble' | 'zzz'>, string[]> = {
  wrench: ['', '', '..G.G', '..GGG', '.GG..', 'GG...'],
  magnifier: ['', '..GGG', '..GLG', '..GGG', '.H...', 'H....'],
  pencil: ['', '....P', '...YY', '..YY.', '.YY..', 'K....'],
  binoculars: ['', '', 'GG.GG', 'GGGGG', 'LL.LL'],
  brush: ['', '...PP', '...PP', '..H..', '.H...', 'H....'],
  palette: ['', '', '.bbbb', 'bRbgb', 'bbBbb', '.bYb.'],
  megaphone: ['', '', '....R', '..RRR', 'WRRRR', '..RRR', '....R'],
  book: ['', '', 'BBBB', 'BWWB', 'BKKB', 'BBBB'],
  laptop: ['', '', '.KKKK', '.KLLK', '.KLLK', 'GGGGGG'],
  check: ['', '', '....g', '...gg', 'g.gg.', '.gg..'],
}

type Px = (number | null)[][]

function blank(): Px {
  return Array.from({ length: H }, () => Array<number | null>(W).fill(null))
}

function dot(px: Px, x: number, y: number, color: number | undefined): void {
  const line = px[y]
  if (line && x >= 0 && x < W && color !== undefined) line[x] = color
}

function stamp(px: Px, rows: string[], x0: number, y0: number, swap?: Record<string, number>): void {
  rows.forEach((row, dy) => {
    for (let dx = 0; dx < row.length; dx++) {
      const ch = row[dx] ?? '.'
      if (ch !== '.') dot(px, x0 + dx, y0 + dy, swap?.[ch] ?? pal(ch))
    }
  })
}

type Body = { eyes?: string; sink?: number; step?: boolean; hat?: boolean; legs?: string[]; arms?: 'up' | 'left' | 'right' }

/** Тело Clawd. sink > 0 оседает, sink < 0 взлетает (ноги отрываются от земли); arms — какие руки подняты. */
function drawBody(px: Px, r: Role, body: number, o: Body = {}): void {
  const sink = o.sink ?? 0
  const bodySwap = { X: body }
  stamp(px, o.legs ?? (o.step ? LEGS_STEP : LEGS), 1, 6 + Math.min(0, sink), bodySwap)
  const upL = o.arms === 'up' || o.arms === 'left'
  const upR = o.arms === 'up' || o.arms === 'right'
  const mid = (upL ? '.' : 'X') + 'XXXXXXXX' + (upR ? '.' : 'X')
  stamp(px, [BODY[0]!, o.eyes ?? BODY[1]!, mid, BODY[3]!], 1, 2 + sink, bodySwap)
  if (r.glasses) for (const x of [2, 4, 7, 9]) dot(px, x, 3 + sink, PAL.W)
  if (r.hat !== 'none' && o.hat !== false) stamp(px, HATS[r.hat], 1, sink, { H: r.hatColor })
  if (upL) stamp(px, ['X', 'X'], 1, 1 + sink, bodySwap)
  if (upR) stamp(px, ['X', 'X'], 10, 1 + sink, bodySwap)
}

// Рабочие движения по фазам [dx, dy] инструмента, цикл 4 фазы по ~300 мс.
const MOTION: Partial<Record<Prop, [number, number][]>> = {
  wrench: [
    [0, -1],
    [1, 0],
    [2, 1],
    [0, 0],
  ], // замах и удар
  magnifier: [
    [0, 0],
    [-2, 0],
    [-4, 1],
    [-2, 0],
  ], // лупа к глазу
  pencil: [
    [0, 0],
    [1, 1],
    [0, 1],
    [1, 0],
  ], // строчит
  brush: [
    [0, -1],
    [1, 0],
    [2, 1],
    [1, 0],
  ], // широкий мазок
  binoculars: [
    [0, 0],
    [-3, -1],
    [-3, -1],
    [0, 0],
  ], // к глазам
  palette: [
    [0, 0],
    [0, 1],
    [0, 0],
    [0, -1],
  ],
  megaphone: [
    [0, 0],
    [1, 0],
    [0, 0],
    [1, 0],
  ],
}

/** Сцена свободного времени. `tt` — общий для всех номер кадра, чтобы пара двигалась синхронно. */
export type Scene = { pastime?: Pastime; leads?: boolean; tt?: number }

/** Один кадр работника: кто он (роль), что делает (статус), номер кадра. */
export function frame(role: RoleKey, status: Status, t: number, body: number = PAL.X, run = false, scene: Scene = {}): Px {
  const r = ROLES[role]
  const px = blank()
  if (run) {
    // на бегу без инструмента и облачков
    drawBody(px, r, body, { step: t % 2 === 1 })
    return px
  }
  if (status === 'idle') return rest(px, r, t, body, scene)

  const phase = Math.floor(t / 2) % 4
  const strike = status === 'work' && MOTION[r.prop] !== undefined && phase === 2
  const step = status === 'work' ? t % 2 === 1 || strike : status === 'done' ? t % 4 === 0 : false
  // менеджер стоит левее всех и поглядывает на команду, помощники — на менеджера
  const eyes = status === 'think' && t % 8 >= 4 ? (role === 'foreman' ? LOOK_RIGHT : LOOK_LEFT) : undefined
  drawBody(px, r, body, { step, eyes })

  if (r.prop === 'bubble') {
    const n = t % 4
    if (n >= 1) dot(px, 11, 3, PAL.G)
    if (n >= 2) stamp(px, ['GG', 'GG'], 12, 1)
    if (n >= 3) stamp(px, ['.GGGG.', 'GGGGGG', '.GGGG.'], 15, 0)
    return px
  }
  if (r.prop === 'zzz') return zzz(px, t)

  // рука тянется к инструменту; сдавший работу показывает галочку
  dot(px, 11, 4, body)
  const prop: Exclude<Prop, 'bubble' | 'zzz'> = status === 'done' ? 'check' : r.prop
  let swap: Record<string, number> | undefined
  let [mx, my] = [0, 0]
  if (status === 'work') {
    if (prop === 'laptop') swap = { L: t % 2 ? PAL.W : PAL.L }
    if (prop === 'book') swap = { K: t % 2 ? PAL.D : PAL.K }
    const m = MOTION[prop]
    ;[mx, my] = m ? (m[phase] ?? [0, 0]) : [t % 2, 0]
  }
  stamp(px, PROPS[prop], 12 + mx, my, swap)
  return px
}

function zzz(px: Px, t: number): Px {
  const z = ['GGGG', '..G.', '.G..', 'GGGG']
  if (t % 6 < 3) stamp(px, z, 13, 3)
  else stamp(px, z, 16, 0)
  return px
}

const DRUM = ['..HHH', '.HHHH', '.HHH.', 'WW...']
const MUG = ['BBB.', 'BBBB', 'BBB.']
const NEWS = ['bbbbbbb', 'bKKbKKb', 'bbbbbbb', 'bKbKKbb', 'bbbbbbb', 'bKKbbKb']
const NEWS_NEXT = ['bbbbbbb', 'bKbKKbb', 'bbbbbbb', 'bKKbbKb', 'bbbbbbb', 'bKKbKKb']
const PHONE = ['KK', 'LL', 'LL', 'KK']
const DUMBBELL = ['D...D', 'DDDDD', 'D...D']
const NOTE = ['.P', '.P', 'PP']
const BALL = ['RR', 'RR']
const BALLOON = ['RRR', 'RRR', '.R.']
const CONSOLE = ['KKKKK', 'KgKRK']
const GUITAR = ['......D', '.....D.', '....D..', 'HHHD...', 'HHHH...', '.HH....']
const CAN = ['BBB..', 'BBBBB', 'BBB..']
const POT = ['HHH', '.H.']
const EASEL = ['HHHHHHH', 'HWWWWWH', 'HWWWWWH', 'HWWWWWH', 'HHHHHHH', '.H...H.', 'H.....H']
// мазки на холсте появляются по одному, потом картина начинается заново
const STROKES: [number, number, PalKey][] = [
  [1, 1, 'R'],
  [2, 1, 'R'],
  [3, 2, 'Y'],
  [4, 2, 'Y'],
  [1, 3, 'g'],
  [2, 3, 'g'],
  [3, 3, 'B'],
  [5, 1, 'P'],
  [5, 3, 'v'],
]
const JUGGLE: [number, number][] = [
  [12, 4],
  [13, 2],
  [15, 0],
  [17, 1],
  [18, 3],
  [16, 5],
]
const SITTING = ['..........', '.XXXXXXXX.'] // ноги скрещены
const WALK = [0, 1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1]
// мяч в паре: где он в кадре у подающего (левого) и у принимающего на каждой из 16 фаз
const BALL_LEAD: ([number, number] | null)[] = [
  [12, 4],
  [14, 3],
  [16, 1],
  [19, 0],
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  [19, 0],
  [16, 1],
  [14, 3],
  [12, 4],
]
const BALL_FOLLOW: ([number, number] | null)[] = [
  null,
  null,
  null,
  null,
  [1, 0],
  [3, 0],
  [4, 0],
  [3, 0],
  [2, 0],
  [1, 0],
  null,
  null,
  null,
  null,
  null,
  null,
]

/** Свободное время: спит, ест, пьёт кофе, гуляет, моется, читает, играет с соседом. */
function rest(px: Px, r: Role, t: number, body: number, scene: Scene): Px {
  const tt = scene.tt ?? t
  switch (scene.pastime ?? 'sleep') {
    case 'sleep': {
      // дышит: каждые ~450 мс тело оседает на пиксель и поднимается обратно
      drawBody(px, r, body, { eyes: EYES_SHUT, sink: Math.floor(t / 3) % 2 })
      return zzz(px, t)
    }
    case 'eat': {
      const p = Math.floor(t / 2) % 8
      const atMouth = p >= 3 && p <= 6
      drawBody(px, r, body, { eyes: atMouth ? EYES_SHUT : undefined })
      if (atMouth && p % 2 === 0) stamp(px, ['EE'], 5, 4) // жуёт
      dot(px, 11, 4, body)
      stamp(px, DRUM, atMouth ? 9 : 11, 1)
      return px
    }
    case 'coffee': {
      const p = Math.floor(t / 2) % 10
      const sip = p >= 7
      drawBody(px, r, body, { eyes: sip ? EYES_SHUT : undefined })
      dot(px, 11, 4, body)
      if (sip) {
        stamp(px, MUG, 9, 3)
        return px
      }
      stamp(px, MUG, 12, 4)
      const s = t % 3
      dot(px, 12 + (s % 2), 3 - s, PAL.G)
      dot(px, 14 - (s % 2), 3 - ((s + 1) % 3), PAL.G)
      return px
    }
    case 'walk': {
      const i = t % WALK.length
      drawBody(px, r, body, { step: t % 2 === 1, eyes: i > 6 ? LOOK_LEFT : undefined })
      return shift(px, WALK[i] ?? 0)
    }
    case 'shower': {
      drawBody(px, r, body, { eyes: EYES_SHUT, hat: false })
      stamp(px, ['GGGGGGDDDD'], 3, 0) // лейка и труба
      for (let y = 0; y < 8; y++) dot(px, 12, y, PAL.D)
      for (const x of [3, 5, 7, 4, 6, 8]) dot(px, x, 1 + ((t + x * 2) % 5), PAL.L) // капли
      stamp(px, ['W.W'], t % 4 < 2 ? 2 : 6, 2) // пена на макушке
      return px
    }
    case 'read': {
      drawBody(px, r, body)
      stamp(px, Math.floor(t / 16) % 2 ? NEWS_NEXT : NEWS, 11, 1)
      return px
    }
    case 'phone': {
      drawBody(px, r, body, { eyes: t % 20 < 2 ? EYES_SHUT : undefined })
      dot(px, 11, 4, body)
      stamp(px, PHONE, 12, 2, { L: t % 3 === 0 ? PAL.W : PAL.L })
      return px
    }
    case 'gym': {
      const up = Math.floor(t / 3) % 2 === 1
      drawBody(px, r, body, { step: up })
      dot(px, 11, 4, body)
      stamp(px, DUMBBELL, 11, up ? 0 : 4)
      return px
    }
    case 'music': {
      const sink = Math.floor(t / 2) % 2
      drawBody(px, r, body, { sink, eyes: EYES_SHUT })
      for (const x of [1, 10]) stamp(px, ['K', 'K'], x, 2 + sink) // наушники
      if (r.hat === 'none') stamp(px, ['KKKKKKKK'], 2, 1 + sink)
      for (const k of [0, 3]) {
        const y = 4 - ((t + k) % 5)
        stamp(px, NOTE, 13 + ((t + k) % 3) * 2, y)
      }
      return px
    }
    case 'dance': {
      const p = t % 8
      const arms = (['up', undefined, 'left', undefined, 'up', undefined, 'right', undefined] as const)[p]
      drawBody(px, r, body, { arms, step: p % 2 === 1, sink: p % 2 === 1 ? 1 : 0 })
      return shift(px, [0, 1, 2, 1, 0, 1, 2, 1][p] ?? 0)
    }
    case 'balloon': {
      // висит над землёй, болтает ногами, шарик покачивается
      const by = Math.floor(t / 4) % 2
      drawBody(px, r, body, { sink: -1, step: t % 4 < 2 })
      stamp(px, BALLOON, 14, by)
      dot(px, 15, 3 + by, PAL.D)
      dot(px, 13, 3, PAL.D)
      dot(px, 12, 3, PAL.D)
      dot(px, 11, 3, body)
      return px
    }
    case 'game': {
      const p = t % 24
      const win = p >= 20 // прошёл уровень: руки вверх
      drawBody(px, r, body, { arms: win ? 'up' : undefined, step: win && p % 2 === 0 })
      if (!win) dot(px, 11, 4, body)
      stamp(px, CONSOLE, 11, win ? 6 : 4, { g: t % 2 ? PAL.g : PAL.W })
      return px
    }
    case 'guitar': {
      drawBody(px, r, body, { eyes: Math.floor(t / 6) % 2 ? EYES_SHUT : undefined, sink: Math.floor(t / 2) % 2 })
      stamp(px, GUITAR, 8, 1)
      dot(px, 10, t % 2 ? 5 : 6, body) // бьёт по струнам
      const y = 4 - (t % 5)
      stamp(px, NOTE, 16 + (t % 2) * 2, y)
      return px
    }
    case 'yoga': {
      drawBody(px, r, body, { eyes: EYES_SHUT, sink: 1, legs: SITTING })
      const k = Math.floor(t / 3) % 3
      const glow: [number, number][] = [
        [12, 2],
        [14, 0],
        [13, 5],
      ]
      glow.forEach(([x, y], i) => i === k && dot(px, x, y, PAL.Y))
      return px
    }
    case 'plant': {
      drawBody(px, r, body)
      dot(px, 11, 4, body)
      stamp(px, CAN, 11, 2)
      if (t % 3 !== 2) dot(px, 16, 4 + (t % 3), PAL.L)
      stamp(px, POT, 16, 6)
      const grow = Math.floor(t / 10) % 4 // цветок подрастает, потом всё заново
      for (let i = 0; i <= grow; i++) dot(px, 17, 5 - i, PAL.g)
      if (grow >= 2) dot(px, 18, 4, PAL.g)
      if (grow >= 3) dot(px, 17, 1, PAL.P)
      return px
    }
    case 'juggle': {
      drawBody(px, r, body, { eyes: t % 6 < 3 ? undefined : LOOK_LEFT })
      dot(px, 11, 4, body)
      const colors = [PAL.R, PAL.Y, PAL.g]
      colors.forEach((c, k) => {
        const at = JUGGLE[(t + k * 2) % JUGGLE.length]
        if (at) dot(px, at[0], at[1], c)
      })
      return px
    }
    case 'paint': {
      drawBody(px, r, body, { eyes: Math.floor(t / 8) % 2 ? LOOK_LEFT : undefined })
      stamp(px, EASEL, 14, 1)
      const n = Math.floor(t / 3) % (STROKES.length + 3)
      STROKES.slice(0, n).forEach(([x, y, c]) => dot(px, 14 + x, 1 + y, PAL[c]))
      dot(px, 11, 4, body)
      stamp(px, ['H', 'H', 'P'], 12, t % 2 ? 1 : 2) // кисть тянется к холсту
      return px
    }
    case 'chat': {
      const mine = (Math.floor(tt / 12) % 2 === 0) === (scene.leads ?? true)
      drawBody(px, r, body, { sink: !mine && Math.floor(tt / 4) % 2 ? 1 : 0 }) // слушающий кивает
      if (mine) {
        if (tt % 2) stamp(px, ['EE'], 5, 4)
        const n = (tt % 3) + 1
        const dots = ['G', 'G', 'G'].map((g, k) => (k < n ? 'K' : g))
        stamp(px, ['GGGGGGG', 'G' + dots[0] + 'G' + dots[1] + 'G' + dots[2] + 'G', 'GGGGGGG', 'G......'], 12, 0)
      }
      return px
    }
    case 'ball': {
      const p = tt % 16
      const lead = scene.leads ?? true
      const at = (lead ? BALL_LEAD : BALL_FOLLOW)[p] ?? null
      const step = lead ? p === 0 || p === 15 : p === 6
      drawBody(px, r, body, { step: lead && step, sink: !lead && step ? 1 : 0 })
      if (lead) dot(px, 11, 4, body)
      if (at) stamp(px, BALL, at[0], at[1])
      return px
    }
  }
}

function toBase64(bytes: Uint8Array): string {
  const anyBytes = bytes as unknown as { toBase64?: () => string }
  if (typeof anyBytes.toBase64 === 'function') return anyBytes.toBase64()
  let s = ''
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  return btoa(s)
}

/** Пиксели в клетки Raster: [codePoint, цвет символа, цвет фона] на клетку. */
export function encode(px: Px): string {
  const words = new Uint32Array(SPRITE_COLS * SPRITE_ROWS * 3)
  for (let row = 0; row < SPRITE_ROWS; row++) {
    for (let col = 0; col < SPRITE_COLS; col++) {
      const top = px[row * 2]?.[col + 1] ?? null
      const bottom = px[row * 2 + 1]?.[col + 1] ?? null
      let cp = 0x20
      let fg = DEFAULT
      let bg = DEFAULT
      if (top !== null) {
        cp = 0x2580
        fg = top
        if (bottom !== null) bg = bottom
      } else if (bottom !== null) {
        cp = 0x2584
        fg = bottom
      }
      const i = (row * SPRITE_COLS + col) * 3
      words[i] = cp
      words[i + 1] = fg
      words[i + 2] = bg
    }
  }
  return toBase64(new Uint8Array(words.buffer))
}

/** Сдвиг картинки вправо на dx пикселей: так помощник выбегает из-за края и убегает за него. */
function shift(px: Px, dx: number): Px {
  if (dx <= 0) return px
  return px.map(line => line.map((_, x) => (x - dx >= 0 ? (line[x - dx] ?? null) : null)))
}

/** Тот же кадр картинкой SVG — для приложения Claude и панели, где нет Raster терминала. Соседние пиксели одного цвета — одним прямоугольником. */
export function frameSvg(role: RoleKey, status: Status, t: number, body?: number, dx = 0, scene?: Scene, scale = 6): string {
  const px = shift(frame(role, status, t, body, dx > 0, scene), dx)
  const rects: string[] = []
  for (let y = 0; y < H; y++) {
    let x = 1
    while (x < W) {
      const c = px[y]?.[x] ?? null
      if (c === null) {
        x++
        continue
      }
      let end = x + 1
      while (end < W && (px[y]?.[end] ?? null) === c) end++
      rects.push(`<rect x="${x - 1}" y="${y}" width="${end - x}" height="1" fill="#${c.toString(16).padStart(6, '0')}"/>`)
      x = end
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SPRITE_COLS} ${H}" width="${SPRITE_COLS * scale}" height="${H * scale}" shape-rendering="crispEdges">${rects.join('')}</svg>`
}

export function frameCells(role: RoleKey, status: Status, t: number, body?: number, dx = 0, scene?: Scene): string {
  return encode(shift(frame(role, status, t, body, dx > 0, scene), dx))
}

/** Свой оттенок тела для каждого сабагента, чтобы их различать. */
export function bodyColor(index: number): number {
  const tones = [0xd97757, 0xe8916a, 0xc4613f, 0xf0a77f, 0xb85a3c]
  return tones[index % tones.length] ?? PAL.X
}
