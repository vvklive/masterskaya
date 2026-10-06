import type { RoleKey } from '../types'

export type Hat = 'hardhat' | 'detective' | 'beret' | 'cap' | 'wizard' | 'hair' | 'horns' | 'none'
export type Prop =
  | 'wrench' | 'magnifier' | 'pencil' | 'binoculars' | 'brush' | 'palette' | 'megaphone' | 'book' | 'laptop' | 'bubble' | 'zzz' | 'check'
  | 'wand' | 'snitch' | 'orb' | 'sock' | 'shield' | 'hex' | 'spark' | 'web'

export type Role = {
  label: string
  inst: string // «с кем»: творительный падеж для подписей вроде «болтает с механиком»
  color: string // цвет подписи в интерфейсе
  hat: Hat
  hatColor: number // 0xRRGGBB
  glasses: boolean | 'patch'
  prop: Prop
  body?: number // свой цвет тела (костюм персонажа); без него — цвет Clawd
}

const STANDARD: Record<RoleKey, Role> = {
  mechanic: { label: 'Механик', inst: 'механиком', color: '#F2C230', hat: 'hardhat', hatColor: 0xf2c230, glasses: false, prop: 'wrench' },
  researcher: {
    label: 'Исследователь',
    inst: 'исследователем',
    color: '#C08A57',
    hat: 'detective',
    hatColor: 0x8b5a2b,
    glasses: true,
    prop: 'magnifier',
  },
  editor: { label: 'Редактор', inst: 'редактором', color: '#7B8EAE', hat: 'beret', hatColor: 0x3b4a8c, glasses: false, prop: 'pencil' },
  writer: { label: 'Писатель', inst: 'писателем', color: '#7B8EAE', hat: 'beret', hatColor: 0x2f6f9f, glasses: true, prop: 'pencil' },
  scout: { label: 'Разведчик', inst: 'разведчиком', color: '#5FB37A', hat: 'cap', hatColor: 0x3e8e5a, glasses: false, prop: 'binoculars' },
  designer: { label: 'Дизайнер', inst: 'дизайнером', color: '#EF74A2', hat: 'beret', hatColor: 0xef74a2, glasses: false, prop: 'brush' },
  artist: { label: 'Художник', inst: 'художником', color: '#A98BEF', hat: 'beret', hatColor: 0x8e5bd9, glasses: false, prop: 'palette' },
  foreman: {
    label: 'Менеджер',
    inst: 'менеджером',
    color: '#E5484D',
    hat: 'hardhat',
    hatColor: 0xefefef,
    glasses: false,
    prop: 'megaphone',
  },
  librarian: { label: 'Библиотекарь', inst: 'библиотекарем', color: '#9FB4D8', hat: 'none', hatColor: 0, glasses: true, prop: 'book' },
  planner: { label: 'Планировщик', inst: 'планировщиком', color: '#9FB4D8', hat: 'cap', hatColor: 0x3b4a8c, glasses: false, prop: 'book' },
  apprentice: { label: 'Подмастерье', inst: 'подмастерьем', color: '#D97757', hat: 'none', hatColor: 0, glasses: false, prop: 'laptop' },
  thinker: { label: 'Думает', inst: 'помощником', color: '#D97757', hat: 'none', hatColor: 0, glasses: false, prop: 'bubble' },
  idle: { label: 'Отдыхает', inst: 'менеджером', color: '#8A8A8A', hat: 'hardhat', hatColor: 0xefefef, glasses: false, prop: 'zzz' },
  done: { label: 'Сдал работу', inst: 'помощником', color: '#5FB37A', hat: 'none', hatColor: 0, glasses: false, prop: 'check' },
}

export type Team = 'standard' | 'potter' | 'marvel'
export const TEAMS: Record<Team, string> = { standard: 'Стандартная', potter: 'Гарри Поттер', marvel: 'Мстители и Marvel' }

type Cast = Partial<Record<RoleKey, Partial<Role>>>
// Состояния (думает, отдыхает, сдал работу) общие для всех команд — переодеваются только профессии.
const CASTS: Record<Team, Cast> = {
  standard: {},
  potter: {
    foreman: { label: 'Дамблдор', inst: 'Дамблдором', color: '#A98BEF', hat: 'wizard', hatColor: 0x8e5bd9, glasses: true, prop: 'wand' },
    mechanic: { label: 'Артур Уизли', inst: 'Артуром Уизли', color: '#E0823D', hat: 'hair', hatColor: 0xd2691e, glasses: true },
    researcher: { label: 'Гермиона', inst: 'Гермионой', color: '#C08A57', hat: 'detective', hatColor: 0x8b5a2b, glasses: false, prop: 'book' },
    editor: { label: 'Макгонагалл', inst: 'Макгонагалл', color: '#5FB37A', hat: 'wizard', hatColor: 0x2e6b3f, glasses: true, prop: 'wand' },
    writer: { label: 'Рита Скитер', inst: 'Ритой Скитер', color: '#F2C230', hat: 'hair', hatColor: 0xf2c230, glasses: true },
    scout: { label: 'Гарри Поттер', inst: 'Гарри Поттером', color: '#E5484D', hat: 'hair', hatColor: 0x4b3a2e, glasses: true, prop: 'snitch' },
    designer: { label: 'Локхарт', inst: 'Локхартом', color: '#B79BEF', hat: 'beret', hatColor: 0xe8b84a },
    artist: { label: 'Луна Лавгуд', inst: 'Луной Лавгуд', color: '#9FD3F5', hat: 'hair', hatColor: 0xe8d9a0, glasses: true },
    librarian: { label: 'Мадам Пинс', inst: 'мадам Пинс', glasses: false },
    planner: { label: 'Трелони', inst: 'Трелони', color: '#A98BEF', hat: 'beret', hatColor: 0x8e5bd9, glasses: true, prop: 'orb' },
    apprentice: { label: 'Добби', inst: 'Добби', color: '#B8C0CC', body: 0xb5b08a, prop: 'sock' },
  },
  marvel: {
    foreman: { label: 'Ник Фьюри', inst: 'Ником Фьюри', color: '#9FB4D8', hat: 'none', glasses: 'patch' },
    mechanic: { label: 'Тони Старк', inst: 'Тони Старком', color: '#E5484D', body: 0xc0392b, hatColor: 0xf2c230 },
    researcher: { label: 'Брюс Бэннер', inst: 'Брюсом Бэннером', color: '#5FB37A', body: 0x5fb37a, hat: 'none' },
    editor: { label: 'Ванда', inst: 'Вандой', color: '#D6455E', body: 0xa3243b, hat: 'none', prop: 'hex' },
    writer: { label: 'Стив Роджерс', inst: 'Стивом Роджерсом', body: 0x3b4a8c, hat: 'none', glasses: false, prop: 'shield' },
    scout: { label: 'Чёрная Вдова', inst: 'Чёрной Вдовой', color: '#B8C0CC', body: 0x4b4f5c, hat: 'hair', hatColor: 0xc0392b },
    designer: { label: 'Шури', inst: 'Шури', color: '#A98BEF', body: 0x6b4fa0, hat: 'none', prop: 'laptop' },
    artist: { label: 'Локи', inst: 'Локи', color: '#5FB37A', body: 0x2e6b3f, hat: 'horns', hatColor: 0xf2c230, prop: 'orb' },
    librarian: { label: 'Вонг', inst: 'Вонгом', color: '#E8916A', glasses: false },
    planner: { label: 'Доктор Стрэндж', inst: 'Доктором Стрэнджем', color: '#E8916A', body: 0x2f4f8f, hat: 'none', prop: 'spark' },
    apprentice: { label: 'Человек-паук', inst: 'Человеком-пауком', color: '#E5484D', body: 0xd0312d, glasses: true, prop: 'web' },
  },
}

// ponytail: одна изменяемая таблица — setTeam переписывает её на месте, и все ROLES[x] сразу видят новую команду
export const ROLES: Record<RoleKey, Role> = { ...STANDARD }
let current: Team = 'standard'
export const team = (): Team => current

export function setTeam(t: Team): void {
  current = t
  for (const k of Object.keys(STANDARD) as RoleKey[]) ROLES[k] = { ...STANDARD[k], ...CASTS[t][k] }
}

/** Команда по тому, что набрали после /masterskaya: номер, имя или вселенная. */
export function teamOf(arg: string): Team | undefined {
  const a = arg.trim().toLowerCase()
  if (/^(1|станд|обыч|standard|default|clawd)/.test(a)) return 'standard'
  if (/^(2|гарри|поттер|хогвартс|hp|harry|potter)/.test(a)) return 'potter'
  if (/^(3|мстител|марвел|marvel|avengers)/.test(a)) return 'marvel'
  return undefined
}

/** Что исполнитель делает, пока модель пишет аргументы вызова (до запуска инструмента). */
export const PREP: Partial<Record<RoleKey, string>> = {
  mechanic: 'набирает команду',
  researcher: 'ищет, что прочитать',
  editor: 'пишет правку',
  writer: 'пишет файл',
  scout: 'составляет запрос',
  designer: 'готовит макет',
  artist: 'готовит генерацию',
  librarian: 'ищет инструмент',
  planner: 'составляет план',
}

/** Какой специалист нужен под инструмент. */
export function roleOf(tool: string): RoleKey {
  if (tool === 'Bash' || tool === 'BashOutput' || tool === 'KillShell' || tool === 'Monitor') return 'mechanic'
  if (tool === 'Read' || tool === 'Grep' || tool === 'Glob' || tool === 'LS') return 'researcher'
  if (tool === 'Edit' || tool === 'MultiEdit' || tool === 'NotebookEdit') return 'editor'
  if (tool === 'Write') return 'writer'
  if (tool === 'WebSearch' || tool === 'WebFetch') return 'scout'
  if (tool.startsWith('mcp__claude_ai_Figma__') || tool.startsWith('mcp__figma__')) return 'designer'
  if (tool.startsWith('mcp__higgsfield__')) return 'artist'
  if (tool === 'Agent' || tool === 'Task' || tool === 'Workflow' || tool === 'SendMessage') return 'foreman'
  if (tool === 'Skill' || tool === 'ToolSearch') return 'librarian'
  if (tool === 'TodoWrite' || tool === 'AskUserQuestion' || tool === 'EnterPlanMode' || tool === 'ExitPlanMode') return 'planner'
  return 'apprentice'
}

const str = (v: unknown): string => (typeof v === 'string' ? v : '')
const base = (p: string): string => p.split('/').filter(Boolean).pop() ?? p
const oneLine = (s: string, n = 60): string => {
  const t = s.replace(/\s+/g, ' ').trim()
  return t.length > n ? t.slice(0, n - 1) + '…' : t
}
const host = (u: string): string => {
  try {
    return new URL(u).host
  } catch {
    return u
  }
}

/** Что именно делает работник, по-человечески. */
export function summarize(e: { tool: string } & Record<string, unknown>): string {
  const t = e.tool
  if (t === 'Bash') return 'запускает: ' + oneLine(str(e.command))
  if (t === 'Read') return 'читает: ' + base(str(e.file_path))
  if (t === 'Edit' || t === 'MultiEdit') return 'правит: ' + base(str(e.file_path))
  if (t === 'Write') return 'пишет: ' + base(str(e.file_path))
  if (t === 'NotebookEdit') return 'правит блокнот: ' + base(str(e.notebook_path))
  if (t === 'Grep') return 'ищет «' + oneLine(str(e.pattern), 40) + '»'
  if (t === 'Glob') return 'ищет файлы: ' + oneLine(str(e.pattern), 40)
  if (t === 'WebSearch') return 'гуглит: ' + oneLine(str(e.query), 50)
  if (t === 'WebFetch') return 'открывает: ' + host(str(e.url))
  if (t === 'Agent' || t === 'Task') return 'раздаёт задачу: ' + oneLine(str(e.description), 50)
  if (t === 'Skill') return 'достаёт инструкцию: ' + str(e.skill)
  if (t === 'ToolSearch') return 'ищет инструмент'
  if (t === 'TodoWrite') return 'обновляет план'
  if (t === 'AskUserQuestion') return 'ждёт ответа от вас'
  const d = str(e.description)
  const short = t.startsWith('mcp__') ? t.split('__').slice(2).join(' ').replace(/_/g, ' ') : t
  return d ? short + ': ' + oneLine(d, 50) : short
}

/** Профессия сабагента по его типу. */
export function roleOfAgent(type: string): RoleKey {
  if (/explore|research|map/i.test(type)) return 'researcher'
  if (/plan|architect|roadmap/i.test(type)) return 'planner'
  if (/review|audit|verif|check/i.test(type)) return 'researcher'
  if (/design|ui/i.test(type)) return 'designer'
  return 'thinker'
}
