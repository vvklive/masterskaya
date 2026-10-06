import type { RoleKey } from '../types'

export type Hat = 'hardhat' | 'detective' | 'beret' | 'cap' | 'none'
export type Prop =
  'wrench' | 'magnifier' | 'pencil' | 'binoculars' | 'brush' | 'palette' | 'megaphone' | 'book' | 'laptop' | 'bubble' | 'zzz' | 'check'

export type Role = {
  label: string
  inst: string // «с кем»: творительный падеж для подписей вроде «болтает с механиком»
  color: string // цвет подписи в интерфейсе
  hat: Hat
  hatColor: number // 0xRRGGBB
  glasses: boolean
  prop: Prop
}

export const ROLES: Record<RoleKey, Role> = {
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
