import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Worker } from '../types'
import { plan } from './life'
import { NEWS_URL, fresher } from './news'
import { GUESTS, PREP, ROLES, TEAMS, face, roleOf, roleOfAgent, say, setTeam, summarize, team, teamOf } from './roles'
import type { Team } from './roles'
import { SPRITE_COLS, SPRITE_ROWS, bodyColor, frameCells, frameSvg } from './sprites'
import type { Move } from './sprites'

const PANE = 'masterskaya'
const MAIN = 'main'
const WORKERS = atom({ plugin: 'masterskaya', key: 'workers' } as const, [] as Worker[])

let t = 0
// ponytail: копия списка для таймера анимации; после перезагрузки мода берётся из $.state
let mirror: Worker[] = []
// ponytail: мысли живут в переменной модуля, перезагрузка мода их сбрасывает — это не беда
let thought = ''
let thoughtDirty = false
let bandId = '' // requestId полосы над вводом, нужен для blit
const THOUGHT_TAIL = 400
const CREW = 'crew-' // исполнители, которых менеджер зовёт под свои инструменты
// ponytail: счётчики живут в модуле; после перезагрузки исполнители отфильтрованы в session.start
const calls = new Map<string, number>()
const active = new Map<string, number>()
const lastCall = new Map<string, number>() // когда помощника звали последний раз: уходит домой самый давний
const RESTING = 2 // работы нет — в полосе менеджер и до двух отдыхающих; за работой — все, кто работает
const DONE_MS = 1500 // сколько сдавший работу стоит с галочкой, прежде чем пойти отдыхать

const shortTool = (tool: string): string => (tool.startsWith('mcp__') ? tool.split('__').slice(1, 2).join('') : tool)

/** Сменить команду: запоминается между сессиями, полоса и панель перерисовываются сразу. */
async function pickTeam($: EngineInterface, t: Team): Promise<void> {
  setTeam(t)
  await $.store.set('team', t)
  $.ui.invalidate('ui.render')
}

const fresh = (id: string, now: number): Worker => ({
  id,
  name: id === MAIN ? 'Claude' : 'Помощник',
  role: id === MAIN ? 'foreman' : 'thinker',
  action: id === MAIN ? 'отдыхает' : 'получил задание',
  status: id === MAIN ? 'idle' : 'think',
  startedAt: now,
  isSub: id !== MAIN,
  cast: id === MAIN || id.startsWith(CREW) ? undefined : freeCast(), // вернувшийся сабагент снова получает гостя
})

// Мастерская только смотрит: сбой анимации не должен ломать работу инструментов.
async function patch($: EngineInterface, id: string, fields: Partial<Worker>): Promise<void> {
  try {
    await write($, id, fields)
  } catch {
    // ponytail: молча пропускаем кадр, следующий вызов инструмента обновит картинку
  }
}

async function write($: EngineInterface, id: string, fields: Partial<Worker>): Promise<void> {
  const now = Date.now()
  await update($, WORKERS, list => {
    const cur = list ?? []
    const i = cur.findIndex(w => w.id === id)
    const old = cur[i]
    const next = cur.slice()
    // за работой досуг бросают: пара распадается, сосед найдёт себе другое занятие
    if (fields.status && fields.status !== 'idle') fields = { ...fields, pastime: undefined, partner: undefined, leads: undefined }
    if (!old) next.push({ ...fresh(id, now), ...fields })
    else next[i] = { ...old, ...fields }
    mirror = next
    return next
  })
}

async function drop($: EngineInterface, id: string): Promise<void> {
  await update($, WORKERS, list => {
    mirror = (list ?? []).filter(w => w.id !== id)
    return mirror
  })
}

const ENTER_MS = 1100
const LEAVE_MS = 1000
const CATCH_MS = 450 // пара шагов на освободившееся место
// ponytail: кто когда выбежал в полосу и убегает из неё — в переменных модуля; после перезагрузки все просто выбегут заново
const enterAt = new Map<string, number>()
const exitAt = new Map<string, number>()
const catchAt = new Map<string, number>()
let shownPrev: string[] = [] // кто стоял в полосе в прошлый раз, по порядку
let turnAt = 0 // когда началась текущая задача; 0 — задачи нет

/** Движение в большой панели: пришёл в мастерскую, ушёл домой. */
function paneMove(w: Worker, now: number): Move | undefined {
  if (!w.isSub) return undefined
  if (w.leftAt) return { out: true, q: (now - w.leftAt) / LEAVE_MS }
  const q = (now - w.startedAt) / ENTER_MS
  return q < 1 ? { out: false, q } : undefined
}

/** Движение в полосе: ещё и выход на сцену, уход с неё и шаги на место ушедшего соседа. */
function bandMove(w: Worker, now: number): Move | undefined {
  if (!w.isSub) return undefined
  const out = exitAt.get(w.id) ?? w.leftAt
  if (out !== undefined) return { out: true, q: (now - out) / LEAVE_MS }
  const inn = Math.max(enterAt.get(w.id) ?? 0, w.startedAt)
  if (now - inn < ENTER_MS) return { out: false, q: (now - inn) / ENTER_MS }
  const c = catchAt.get(w.id)
  if (c !== undefined && now - c < CATCH_MS) return { out: false, q: (now - c) / CATCH_MS, span: 8, walk: true }
  return undefined
}

/** Кто в полосе сейчас: попавшие на сцену выбегают, выпавшие убегают (стоят в ряду, пока не скроются), соседи подходят шагами. */
function stageFor($: EngineInterface, subs: Worker[], now: number): Worker[] {
  const stage = onStage(subs, turnAt)
  const on = new Set(stage.map(w => w.id))
  for (const w of stage) {
    if (!shownPrev.includes(w.id) || exitAt.has(w.id)) enterAt.set(w.id, now)
    exitAt.delete(w.id)
  }
  for (const id of shownPrev) {
    const w = subs.find(x => x.id === id)
    if (!w || on.has(id) || exitAt.has(id) || w.leftAt) continue
    exitAt.set(id, now)
    $.clock.after(LEAVE_MS + 60, () => $.ui.invalidate('ui.render'))
  }
  const leaving = (w: Worker): boolean => {
    const at = exitAt.get(w.id) ?? w.leftAt
    return at !== undefined && now - at < LEAVE_MS
  }
  const show = subs.filter(w => on.has(w.id) || (shownPrev.includes(w.id) && leaving(w)))
  show.forEach((w, i) => {
    if (on.has(w.id) && shownPrev.indexOf(w.id) > i) catchAt.set(w.id, now)
  })
  shownPrev = show.map(w => w.id)
  return show
}

/** Сабагент — только тот, кого завели через agent.spawn; служебные проходы движка (память, сжатие) тоже несут agentId, их не рисуем.
 *  Набор не чистится: ушедшего домой сабагента могут продолжить через SendMessage, тогда он прибегает снова. */
const agents = new Set<string>()
const known = (id: string): boolean => agents.has(id)

/** Свободный гость команды для нового сабагента: двое одновременно одним персонажем не ходят, пока гостей хватает. */
const freeCast = (): number => {
  const taken = new Set(mirror.filter(w => w.isSub && !w.id.startsWith(CREW) && !w.leftAt).map(w => w.cast))
  const n = GUESTS.findIndex((_, i) => !taken.has(i))
  return n >= 0 ? n : taken.size % GUESTS.length
}

const busy = (list: Worker[]): boolean => list.some(w => w.isSub && !w.leftAt && (w.status === 'work' || w.status === 'think'))

/** Пока команда работает, а сам Claude не занят инструментом, он спокойно смотрит за ней: в центре внимания исполнители. */
// Одна просьба о звёздочке после установки: менеджер машет и болтает, после «Поставил» — пляшет. Больше не просит.
const REPO = 'https://github.com/vvklive/masterskaya'
let starAsk = false
let thanksUntil = 0

const shown = (w: Worker, list: Worker[]): Worker => {
  if (w.isSub) return face(w) === w.role ? w : { ...w, role: face(w) }
  if (w.id === MAIN && Date.now() < thanksUntil)
    return { ...w, role: 'foreman', status: 'idle', pastime: 'dance', action: 'спасибо! команда пляшет' }
  if (w.id === MAIN && starAsk) return { ...w, role: 'foreman', status: 'idle', pastime: 'chat', leads: true, action: 'привет, это мы!' }
  return w.id === MAIN && w.status !== 'work' && busy(list) ? { ...w, role: 'foreman', status: 'think', action: 'смотрит за командой' } : w
}

// Обновление: при старте сессии сверяем news.ts с GitHub. Тост — один раз на версию, строка в панели — пока не обновились.
const UPDATE_HOW = '/plugin update masterskaya, затем новая сессия'
let newer: [string, string][] = []

async function checkUpdate($: EngineInterface): Promise<void> {
  try {
    const r = await $.http.fetch(NEWS_URL)
    if (!r.ok) return
    newer = fresher(r.text)
  } catch {
    return // ponytail: нет сети или политика запрещает — молчим, проверим в следующей сессии
  }
  const top = newer[0]
  if (!top || (await $.store.get('updateToasted')) === top[0]) return
  await $.store.set('updateToasted', top[0])
  $.ui.toast(`Вышла Мастерская ${top[0]}: ${top[1]}. Обновить: ${UPDATE_HOW}`, { timeoutMs: 15000 })
  $.ui.invalidate('ui.render')
}

const updateLine = (): string | undefined =>
  newer[0] && `Вышла ${newer[0][0]}: ${newer.map(x => x[1]).join('; ')}. Обновить: ${UPDATE_HOW}`

function endStar($: EngineInterface): void {
  if (!starAsk) return
  starAsk = false
  $.ui.invalidate('ui.render')
}

function thanks($: EngineInterface): void {
  starAsk = false
  thanksUntil = Date.now() + 5000
  $.ui.invalidate('ui.render')
  $.clock.after(5100, () => $.ui.invalidate('ui.render'))
}

const cellsOf = (w: Worker, i: number, m: Move | undefined, list: Worker[] = mirror): string => {
  const v = shown(w, list)
  const scene = { pastime: v.pastime, leads: v.leads, tt: t }
  return frameCells(v.role, v.status, t + i, w.isSub ? bodyColor(i) : undefined, m, scene)
}

/** Тот же кадр для приложения Claude: картинка SVG вместо клеток терминала. */
const svgOf = (w: Worker, i: number, list: Worker[], m?: Move): string => {
  const v = shown(w, list)
  const scene = { pastime: v.pastime, leads: v.leads, tt: t }
  return frameSvg(v.role, v.status, t + i, w.isSub ? bodyColor(i) : undefined, m, scene)
}
// ponytail: приложение анимируем перерисовкой полосы на каждом тике, только если оно подключено
let desktopSeen = false

/** Позвать исполнителя под инструмент: встаёт рядом (или выбегает), менеджер поручает. Номер вызова — для finish. */
async function summon($: EngineInterface, tool: string, action: string): Promise<{ id: string; n: number }> {
  const role = roleOf(tool)
  const id = CREW + role
  const n = (calls.get(id) ?? 0) + 1
  calls.set(id, n)
  const was = mirror.find(x => x.id === id)
  lastCall.set(id, Date.now())
  await patch($, id, {
    name: shortTool(tool),
    role,
    status: 'work',
    action,
    isSub: true,
    leftAt: undefined,
    // уже стоит рядом — не выбегает заново
    startedAt: was && !was.leftAt ? was.startedAt : Date.now(),
  })
  if (!was || was.leftAt) makeRoom($)
  await patch($, MAIN, { role: 'foreman', status: 'think', action: 'поручил: ' + ROLES[role].label })
  return { id, n }
}

const since = (w: Worker): number => lastCall.get(w.id) ?? w.startedAt
const isActive = (w: Worker): boolean => w.isSub && !w.leftAt && w.status !== 'idle'

/** Кто стоит рядом с менеджером: идёт задача — все, кого звали в ней (и кто ещё работает); нет — до двух отдыхающих, кого звали последними. Порядок прежний. */
export function onStage(subs: Worker[], turn = 0): Worker[] {
  const active = subs.filter(w => isActive(w) || (turn > 0 && !w.leftAt && since(w) >= turn))
  if (active.length) return active
  const chosen = new Set(
    subs
      .filter(w => !w.leftAt && w.status === 'idle')
      .sort((a, b) => since(b) - since(a))
      .slice(0, RESTING)
      .map(w => w.id),
  )
  return subs.filter(w => chosen.has(w.id))
}

/** Отдыхающим на виду, у кого занятие кончилось, — новое; соседи для пары — как стоят в полосе. */
function live($: EngineInterface): void {
  const main = mirror.find(w => w.id === MAIN)
  const stage = onStage(mirror.filter(w => w.isSub))
  for (const [id, fields] of plan(main ? [main, ...stage] : stage, Date.now())) void patch($, id, fields)
}

/** Отдыхающих больше, чем мест: домой уходят те, кого дольше всех не звали. */
function makeRoom($: EngineInterface): void {
  // кого звали в текущей задаче, домой не отправляем до её конца
  const idle = mirror
    .filter(w => w.isSub && !w.leftAt && w.status === 'idle' && !(turnAt > 0 && since(w) >= turnAt))
    .sort((a, b) => since(a) - since(b))
  for (const w of idle.slice(0, Math.max(0, idle.length - RESTING))) sendHome($, w.id)
}

/** Уходит домой: убегает (трансгрессирует, улетает) и пропадает из списка. */
function sendHome($: EngineInterface, id: string): void {
  void patch($, id, { leftAt: Date.now(), action: 'уходит домой' })
  $.clock.after(LEAVE_MS + 300, () => void drop($, id))
}

/** Сдал работу: постоял с галочкой и пошёл отдыхать, если за это время не позвали снова. */
function finish($: EngineInterface, id: string, n: number): void {
  $.clock.after(DONE_MS, () => {
    if ((calls.get(id) ?? 0) !== n) return
    void patch($, id, { status: 'idle', action: 'отдыхает', pastimeUntil: 0 }).then(() => makeRoom($))
  })
}

function tick($: EngineInterface): void {
  t += 1
  const now = Date.now()
  mirror.forEach((w, i) => {
    const bm = bandMove(w, now)
    const pm = paneMove(w, now)
    if (bm || pm) return // бегущих рисует animate, чаще
    if (w.status === 'idle' && (w.pastime ?? 'sleep') === 'sleep' && t % 3 !== 0) return // спящий дышит медленнее
    const cells = cellsOf(w, i, undefined)
    void $.ui.blit({ requestId: PANE, key: 'w-' + w.id, cells })
    if (bandId) void $.ui.blit({ requestId: bandId, key: 'b-' + w.id, cells })
  })
  if (t % 7 === 0) live($)
  if (thoughtDirty || desktopSeen) {
    thoughtDirty = false
    $.ui.invalidate('ui.render')
  }
}

/** Быстрый кадр для тех, кто в движении: бег по пикселю, без рывков. */
function animate($: EngineInterface): void {
  const now = Date.now()
  let moving = false
  mirror.forEach((w, i) => {
    const bm = bandMove(w, now)
    const pm = paneMove(w, now)
    if (pm) void $.ui.blit({ requestId: PANE, key: 'w-' + w.id, cells: cellsOf(w, i, pm) })
    if (bm && bandId) void $.ui.blit({ requestId: bandId, key: 'b-' + w.id, cells: cellsOf(w, i, bm) })
    moving = moving || !!(bm || pm)
  })
  if (moving && desktopSeen) $.ui.invalidate('ui.render')
}

const think = (text: string): void => {
  thought = (thought + text).slice(-THOUGHT_TAIL)
  thoughtDirty = true
}

/** Хвост мыслей, который влезает в `lines` строк шириной `width`. */
const tailFit = (s: string, width: number, lines: number): string => {
  const flat = s.replace(/\s+/g, ' ').trim()
  const n = Math.max(8, width * lines - 2)
  return flat.length > n ? '…' + flat.slice(-n) : flat
}

/** Модель начала писать вызов инструмента: пока пишутся аргументы (текст правки, файл, команда), работает исполнитель. */
async function prepare($: EngineInterface, tool: string, agentId?: string): Promise<void> {
  const role = roleOf(tool)
  if (agentId) {
    if (!known(agentId)) return
    lastCall.set(agentId, Date.now())
    await patch($, agentId, { role, status: 'work', action: PREP[role] ?? 'готовится' })
  } else if (role === 'foreman') await patch($, MAIN, { role, status: 'work', action: 'пишет задание' })
  else await summon($, tool, PREP[role] ?? 'готовится')
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'masterskaya',
      description: 'Открыть мастерскую или сменить команду: ' + Object.values(TEAMS).join(', '),
      argumentHint: '[название или номер 1–' + Object.keys(TEAMS).length + ']',
    })
    const saved = (await $.store.get('team')) as Team | undefined
    if (saved && saved in TEAMS) setTeam(saved)
    const now = Date.now()
    // помощники, убегавшие во время перезагрузки, не должны застрять за краем
    // уходившие во время перезагрузки не застревают за краем; исполнители без своих таймеров — сразу отдыхать
    const kept = ((await read($, WORKERS)) ?? [])
      .filter(w => !w.leftAt)
      // призраки служебных проходов движка: сабагент без гостя заведён не через agent.spawn
      .filter(w => !w.isSub || w.id.startsWith(CREW) || w.cast !== undefined)
      .map(w => (w.id.startsWith(CREW) && w.status !== 'idle' ? { ...w, status: 'idle' as const, pastimeUntil: 0 } : w))
    mirror = kept.some(w => w.id === MAIN) ? kept : [fresh(MAIN, now), ...kept]
    for (const w of mirror) if (w.cast !== undefined) agents.add(w.id)
    await update($, WORKERS, () => mirror)
    makeRoom($)
    $.clock.every(150, () => tick($))
    $.clock.every(50, () => animate($))
    // большая панель — только по /masterskaya; по умолчанию живёт компактная полоса над вводом
    void $.ui.close({ id: PANE })
    $.ui.status(undefined) // строка состояния больше не дублирует полосу
    if (!(await $.store.get('starAsked'))) {
      starAsk = true
      await $.store.set('starAsked', true) // просим один раз, даже если окно закрыли
      $.clock.after(90000, () => endStar($))
    }
    void checkUpdate($)
    return next(e)
  })

  on('turn.step', async function* ($, e, next) {
    for await (const c of next(e)) {
      if (!e.agentId && (c.kind === 'thinking' || c.kind === 'text')) think(c.text)
      if (c.kind === 'tool') void prepare($, c.name, e.agentId)
      yield c
    }
  })

  on('command.run', { command: 'masterskaya' }, async ($, e) => {
    if (e.args.trim()) {
      const t = teamOf(e.args)
      if (!t) return { text: 'Такой команды нет. Есть: ' + Object.values(TEAMS).join(', ') + ' (/masterskaya 1–' + Object.keys(TEAMS).length + ').' }
      await pickTeam($, t)
      return { text: 'Команда: ' + TEAMS[t] + '.' }
    }
    await $.ui.open({ id: PANE, title: 'Мастерская' })
    return { text: 'Мастерская открыта.' }
  })

  on('prompt.submit', async ($, e, next) => {
    endStar($) // начали работать — просьба не мешает
    turnAt = Date.now()
    thought = ''
    thoughtDirty = true
    await patch($, MAIN, { role: 'foreman', status: 'think', action: 'читает задачу' })
    return next(e)
  })

  on('agent.spawn', async ($, e, next) => {
    const res = await next(e)
    if ('agentId' in res && typeof res.agentId === 'string') {
      agents.add(res.agentId)
      await patch($, res.agentId, {
        name: e.description || e.subagentType,
        role: roleOfAgent(e.subagentType),
        cast: freeCast(),
        status: 'think',
        action: 'получил задание',
        isSub: true,
        startedAt: Date.now(),
      })
      lastCall.set(res.agentId, Date.now())
      makeRoom($)
    }
    return res
  })

  on('tool.call', async ($, e, next) => {
    const input = e as unknown as { tool: string } & Record<string, unknown>
    const role = roleOf(e.tool)
    const action = summarize(input)
    // Сабагент сам меняет профессию под инструмент.
    if (e.agentId) {
      const id = e.agentId
      if (!known(id)) return next(e)
      lastCall.set(id, Date.now())
      calls.set(id, (calls.get(id) ?? 0) + 1)
      await patch($, id, { role, status: 'work', action })
      const ran = await next(e)
      const w = mirror.find(x => x.id === id)
      if (w && w.status === 'work') await patch($, id, { role: 'thinker', status: 'think', action: 'обдумывает результат' })
      return ran
    }
    // Менеджер инструменты в руки не берёт: раздача задач — его дело, остальное делает исполнитель рядом.
    if (role === 'foreman') {
      await patch($, MAIN, { role, status: 'work', action })
      const ran = await next(e)
      await patch($, MAIN, { role, status: 'think', action: 'обдумывает результат' })
      return ran
    }
    const { id, n } = await summon($, e.tool, action)
    active.set(id, (active.get(id) ?? 0) + 1)
    try {
      return await next(e)
    } finally {
      const left = (active.get(id) ?? 1) - 1
      active.set(id, left)
      if (left === 0) {
        await patch($, id, { status: 'done' })
        await patch($, MAIN, { role: 'foreman', status: 'think', action: 'обдумывает результат' })
        finish($, id, n)
      }
    }
  })

  on('turn.complete', async ($, e, next) => {
    const res = await next(e)
    if (e.agentId) {
      const id = e.agentId
      if (!known(id)) return res
      await patch($, id, { status: 'done', action: 'сдал работу' })
      // сабагента больше не позовут (новый запуск — новый id): постоял с галочкой и ушёл домой, а не отдыхает в полосе
      const n = calls.get(id) ?? 0
      $.clock.after(DONE_MS, () => {
        if ((calls.get(id) ?? 0) === n) sendHome($, id)
      })
    } else {
      thought = ''
      thoughtDirty = true
      await patch($, MAIN, { role: 'foreman', status: 'idle', action: 'отдыхает', pastimeUntil: 0 })
      for (const w of mirror) if (w.id.startsWith(CREW) && w.status === 'work' && !(active.get(w.id) ?? 0)) finish($, w.id, calls.get(w.id) ?? 0)
      turnAt = 0 // задача сдана: лишние отдыхающие расходятся по домам
      makeRoom($)
    }
    return res
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey) return next(e)
    const list = (await read($, WORKERS)) ?? []
    const main = list.find(w => w.id === MAIN) ?? fresh(MAIN, Date.now())
    const subs = list.filter(w => w.isSub)
    if (e.surface !== 'terminal') {
      // приложение Claude: тот же ряд, спрайты картинками SVG, подписи справа от каждого
      desktopSeen = true
      const { Box, Text, Svg, Link, Button } = $.ui.resolve(e)
      const lead = shown(main, list)
      const now = Date.now()
      const team = stageFor($, subs, now)
      return (
        <Box flexDirection="row" alignItems="center">
          <Svg source={svgOf(main, 0, list)} alt={`${ROLES[lead.role].label}: ${say(lead.action)}`} width={120} height={48} />
          <Box flexDirection="column" marginLeft={1}>
            <Text>
              <Text bold color={ROLES[lead.role].color}>
                {ROLES[lead.role].label}
              </Text>
              <Text>: {say(lead.action)}</Text>
            </Text>
            {starAsk ? (
              <Box flexDirection="column">
                <Text dimColor>Если нравимся — поставьте нам ★</Text>
                <Link href={REPO} label="github.com/vvklive/masterskaya" />
                <Box flexDirection="row">
                  <Button key="star-yes" label="★ Поставил" onPress={() => thanks($)} />
                  <Box marginLeft={1}>
                    <Button key="star-no" label="Не сейчас" onPress={() => endStar($)} />
                  </Box>
                </Box>
              </Box>
            ) : thought ? (
              <Text dimColor italic>
                {tailFit(thought, 60, 2)}
              </Text>
            ) : null}
          </Box>
          {team.map(w => {
            const v = shown(w, list)
            return (
              <Box key={w.id} flexDirection="row" alignItems="center" marginLeft={2}>
                <Svg source={svgOf(w, list.indexOf(w), list, bandMove(w, now))} alt={`${ROLES[v.role].label}: ${say(w.action)}`} width={120} height={48} />
                <Box flexDirection="column" marginLeft={1}>
                  <Text bold color={ROLES[v.role].color}>
                    {ROLES[v.role].label}
                  </Text>
                  <Text dimColor>{tailFit(say(w.action), 24, 1)}</Text>
                </Box>
              </Box>
            )
          })}
        </Box>
      )
    }
    const { Box, Text, Raster, Link, Button } = $.ui.resolve(e)
    bandId = e.requestId
    // Команда в ряд сразу за менеджером: спрайт 4 строки, текст справа, полоса всегда 5 строк.
    // Не влезают с подписями — стоят одними спрайтами; не влезают и так — «+N».
    const cols = e.props.bodyColumns
    const lead = shown(main, list)
    // Главному — узкая колонка (имя, действие, мысли), остальное — команде. Сколько влезает, решает ширина:
    // подписи ужимаются с 16 знаков до 10, потом стоят одни спрайты, потом «+N».
    const mainText = Math.min(30, Math.max(18, Math.floor(cols * 0.2)))
    const avail = cols - SPRITE_COLS - 1 - mainText
    const now = Date.now()
    const stage = stageFor($, subs, now)
    let subText = 0
    for (let tw = 16; tw >= 10 && !subText; tw--) if (stage.length * (SPRITE_COLS + 3 + tw) <= avail) subText = tw
    const slot = subText ? SPRITE_COLS + 3 + subText : SPRITE_COLS + 1
    const fit = stage.length * slot <= avail ? stage.length : Math.max(0, Math.floor((avail - 4) / slot))
    const team = stage.slice(0, fit)
    // «+N» — только работающие, кому не хватило места; отдыхающие за кадром не в счёт
    const extra = stage.length - team.length
    return (
      <Box flexDirection="column">
        <Text dimColor>{'─'.repeat(cols)}</Text>
        <Box flexDirection="row">
          <Raster key={'b-' + MAIN} columns={SPRITE_COLS} rows={SPRITE_ROWS} cells={cellsOf(main, 0, undefined, list)} />
          <Box flexDirection="column" marginLeft={1} width={mainText} height={SPRITE_ROWS} justifyContent="center" overflow="hidden">
            <Text bold color={ROLES[lead.role].color} wrap="truncate">
              {ROLES[lead.role].label}
            </Text>
            {starAsk ? null : <Text wrap="truncate">{say(lead.action)}</Text>}
            {starAsk ? (
              <Box flexDirection="column">
                <Text dimColor wrap="truncate">
                  Если нравимся — поставьте нам ★
                </Text>
                <Link href={REPO} label="github.com/vvklive/masterskaya" />
                <Box flexDirection="row">
                  <Button key="star-yes" label="★ Поставил" onPress={() => thanks($)} />
                  <Box marginLeft={1}>
                    <Button key="star-no" label="Не сейчас" dimColor onPress={() => endStar($)} />
                  </Box>
                </Box>
              </Box>
            ) : null}
            {!starAsk && thought ? (
              <Text dimColor italic wrap="wrap">
                {/* запас на перенос по словам, чтобы мысли не вылезли за 2 строки */}
                {tailFit(thought, mainText - 5, 2)}
              </Text>
            ) : null}
          </Box>
          {team.map(w => {
            const v = shown(w, list)
            return (
              <Box key={w.id} flexDirection="row" marginLeft={subText ? 2 : 1}>
                <Raster key={'b-' + w.id} columns={SPRITE_COLS} rows={SPRITE_ROWS} cells={cellsOf(w, list.indexOf(w), bandMove(w, now), list)} />
                {subText ? (
                  <Box
                    flexDirection="column"
                    marginLeft={1}
                    width={subText}
                    height={SPRITE_ROWS}
                    justifyContent="center"
                    overflow="hidden"
                  >
                    <Text bold color={ROLES[v.role].color} wrap="truncate">
                      {ROLES[v.role].label}
                    </Text>
                    <Text wrap="truncate">{w.name}</Text>
                    <Text dimColor wrap="wrap">
                      {tailFit(say(w.action), subText - 3, 2)}
                    </Text>
                  </Box>
                ) : null}
              </Box>
            )
          })}
          {extra ? (
            <Box marginLeft={2} height={SPRITE_ROWS} alignItems="center">
              <Text dimColor>+{extra}</Text>
            </Box>
          ) : null}
        </Box>
      </Box>
    )
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const list = (await read($, WORKERS)) ?? []
    if (e.surface !== 'terminal') {
      // приложение, панель VS Code, телефон: спрайты картинками SVG
      desktopSeen = true
      const { Box, Text, Svg, Button } = $.ui.resolve(e)
      return (
        <Box flexDirection="column">
          {updateLine() ? <Text color="#5FB37A">{updateLine()}</Text> : null}
          <Box flexDirection="row" flexWrap="wrap">
            {(Object.keys(TEAMS) as Team[]).map(k => (
              <Box key={k} marginRight={1}>
                <Button key={'team-' + k} label={(k === team() ? '● ' : '') + TEAMS[k]} onPress={() => pickTeam($, k)} />
              </Box>
            ))}
          </Box>
          {list.map((w, i) => (
            <Box key={w.id} flexDirection="row" alignItems="center" marginTop={1}>
              <Svg source={svgOf(w, i, list, paneMove(w, Date.now()))} alt={`${ROLES[face(w)].label}: ${say(w.action)}`} width={120} height={48} />
              <Box flexDirection="column" marginLeft={1}>
                <Text bold color={ROLES[face(w)].color}>
                  {ROLES[face(w)].label}
                </Text>
                <Text>{w.name}</Text>
                <Text dimColor>{say(w.action)}</Text>
              </Box>
            </Box>
          ))}
        </Box>
      )
    }
    const { Box, Text, Raster, Button } = $.ui.resolve(e)
    const textWidth = Math.max(12, e.props.bodyColumns - SPRITE_COLS - 2)
    const busy = list.filter(w => w.status === 'work' || w.status === 'think').length
    return (
      <Box flexDirection="column">
        {updateLine() ? (
          <Text color="#5FB37A" wrap="wrap">
            {updateLine()}
          </Text>
        ) : null}
        <Box flexDirection="row" flexWrap="wrap">
          <Text dimColor>Команда: </Text>
          {(Object.keys(TEAMS) as Team[]).map(k => (
            <Box key={k} marginRight={1}>
              <Button key={'team-' + k} label={(k === team() ? '● ' : '') + TEAMS[k]} dimColor={k !== team()} onPress={() => pickTeam($, k)} />
            </Box>
          ))}
        </Box>
        <Text dimColor>{busy === 0 ? 'все отдыхают' : `за работой: ${busy}`}</Text>
        {list.map((w, i) => (
          <Box key={w.id} flexDirection="row" marginTop={1}>
            <Raster key={'w-' + w.id} columns={SPRITE_COLS} rows={SPRITE_ROWS} cells={cellsOf(w, i, paneMove(w, Date.now()))} />
            <Box flexDirection="column" marginLeft={1} width={textWidth}>
              <Text bold color={ROLES[face(w)].color}>
                {ROLES[face(w)].label}
              </Text>
              <Text bold wrap="truncate">
                {w.name}
              </Text>
              <Text dimColor wrap="wrap">
                {say(w.action)}
              </Text>
            </Box>
          </Box>
        ))}
      </Box>
    )
  })
}
