import type { RoleKey } from '../types'

export type Hat = 'hardhat' | 'detective' | 'beret' | 'cap' | 'wizard' | 'hair' | 'horns' | 'none'
export type Prop =
  | 'wrench' | 'magnifier' | 'pencil' | 'binoculars' | 'brush' | 'palette' | 'megaphone' | 'book' | 'laptop' | 'bubble' | 'zzz' | 'check'
  | 'wand' | 'snitch' | 'sock' | 'shield' | 'spark' | 'web' | 'quill' | 'cube' | 'snake' | 'umbrella' | 'hammer' | 'gauntlet' | 'sprout'
  | 'phoenix' | 'repulsor'

export type Role = {
  label: string
  inst: string // «с кем»: творительный падеж для подписей вроде «болтает с механиком»
  color: string // цвет подписи в интерфейсе
  hat: Hat
  hatColor: number // 0xRRGGBB
  glasses: boolean
  prop: Prop
  body?: number // цвет костюма (туловище); без него — цвет Clawd
  look?: Look
}

/**
 * Костюм персонажа поверх тела Clawd. Строки — ряды кадра 0–7, столбцы с 0; буквы из `pal`, иначе общей палитры.
 * paint перекрашивает только само тело (лицо, эмблема, полосы), over рисуется поверх всего (волосы, борода, уши, маска).
 */
export type Look = { pal: Record<string, number>; paint?: string[]; over?: string[]; legs?: number; eyes?: number }

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

const SKIN = 0xf0c8a0
const FACE = ['', '', '..ssssssss..', '..ssssssss..'] // голова — ряды 2–3, туловище — 4–5, ноги — 6–7
const ROBE = 0x4a4a5c // школьная мантия: темнее нельзя, пропадёт на тёмном терминале

/** Персонаж целиком: без шляпы и очков Clawd, всё лицо и костюм — в look. */
const who = (label: string, inst: string, color: string, body: number, prop: Prop, look: Look, more: Partial<Role> = {}): Partial<Role> => ({
  label,
  inst,
  color,
  body,
  prop,
  look: { ...look, pal: { s: SKIN, ...look.pal } },
  hat: 'none',
  hatColor: 0,
  glasses: false,
  ...more,
})

// Состояния (думает, отдыхает, сдал работу) общие для всех команд — переодеваются только профессии.
// Самые известные — на самых частых ролях: менеджер виден всегда, дальше Bash, чтение, сеть, Write, Figma, прочее, картинки, Skill, Edit, план
// (порядок по счёту вызовов в сессиях Виктора, 06.10: Bash 9,5 тыс., Read 2 тыс., остальное — сотни).
const CASTS: Record<Team, Cast> = {
  standard: {},
  potter: {
    foreman: who(
      'Дамблдор', 'Дамблдором', '#A98BEF', 0x6b3fa0, 'phoenix',
      { paint: FACE, over: ['', '', '', '..w.g..g.w..', '...wwwwww...', '....wwww....', '.....ww.....'], pal: { w: 0xf2f2f2, g: 0xf2c230 } },
      { hat: 'wizard', hatColor: 0x8e5bd9 },
    ),
    mechanic: who('Гарри Поттер', 'Гарри Поттером', '#E5484D', ROBE, 'snitch', {
      paint: [...FACE, '..agagagag..', '...a........'], // шарф Гриффиндора
      over: ['...h.h.h....', '..hhhhhhhh..', '.h..z....h..', '..k.k..k.k..'], // вихры, шрам на лбу, круглые очки
      pal: { h: 0x3a2e28, z: 0xe5484d, k: 0x1b1b1b, a: 0xb0302a, g: 0xe0b040 },
    }),
    researcher: who('Гермиона', 'Гермионой', '#C08A57', ROBE, 'book', {
      paint: [...FACE, '....wraw....'],
      over: ['', '..hhhhhhhh..', '.hhhhhhhhhh.', '.hh......hh.', '.hh......hh.', '.hh......hh.', '.h........h.'],
      pal: { h: 0x7b4a2a, w: 0xf2f2f2, r: 0xb0302a, a: 0xe0b040 },
    }),
    scout: who('Волдеморт', 'Волдемортом', '#5FB37A', 0x34343e, 'snake', {
      paint: FACE,
      eyes: 0xe5484d,
      over: ['', '', '', '.....nn.....'], // лысый, без носа, красные глаза
      pal: { s: 0xdfe3dc, n: 0x8a8f88 },
    }),
    writer: who('Снейп', 'Снейпом', '#9FB4D8', 0x34343e, 'quill', {
      paint: FACE,
      over: ['', '..hhhhhhhh..', '.hhhh..hhhh.', '.hh......hh.', '.hh......hh.', '.h........h.'],
      pal: { s: 0xe6d3b0, h: 0x3a3a42 },
    }),
    designer: who('Драко Малфой', 'Драко Малфоем', '#5FB37A', ROBE, 'brush', {
      paint: [...FACE, '....wgGw....'], // галстук Слизерина
      over: ['', '..hhhhhhhh..', '..hhhhhhhh..'],
      pal: { h: 0xf1ecd6, w: 0xf2f2f2, g: 0x2e7d4a },
    }),
    apprentice: who('Рон Уизли', 'Роном Уизли', '#E0823D', 0x8b2e3c, 'wand', {
      paint: [...FACE, '.....yy.....', '.....y.y....'], // свитер Уизли с буквой
      legs: 0x5a4636,
      over: ['', '..hhhhhhhh..', '.hhhhhhhhhh.', '.h........h.'],
      pal: { y: 0xf2c230, h: 0xd2691e },
    }),
    artist: who('Луна Лавгуд', 'Луной Лавгуд', '#9FD3F5', 0x2f4f8f, 'palette', {
      paint: FACE,
      over: ['', '..hhhhhhhh..', '.hhhhhhhhhh.', '.hppp..ccch.', '.h........h.', '.h........h.', '.h........h.'], // очки-спектрики
      pal: { h: 0xeee3b0, p: 0xef74a2, c: 0x5fd3f5 },
    }),
    librarian: who('Хагрид', 'Хагридом', '#C08A57', 0x6b4a2e, 'umbrella', {
      paint: FACE,
      over: ['', '.hhhhhhhhhh.', '.hh......hh.', '.hh......hh.', '.hhhhhhhhhh.', '..hhhhhhhh..', '...hhhhhh...'], // косматая грива и борода
      pal: { h: 0x3b2a20 },
    }),
    editor: who(
      'Макгонагалл', 'Макгонагалл', '#5FB37A', 0x1f6b45, 'wand',
      { paint: FACE, over: ['', '', '', '..k.k..k.k..'], pal: { k: 0x222222 } },
      { hat: 'wizard', hatColor: 0x174a30 },
    ),
    planner: who('Добби', 'Добби', '#B8C0CC', 0xd8cfb8, 'sock', {
      paint: FACE,
      legs: 0x9ea67e,
      eyes: 0x3fae5a,
      over: ['', '.s........s.', '.s.w....w.s.', '.s........s.'], // уши и глаза-мячики
      pal: { s: 0x9ea67e, w: 0xf2f2f2 },
    }),
  },
  marvel: {
    foreman: who('Железный человек', 'Железным человеком', '#E5484D', 0xb3261e, 'repulsor', {
      paint: ['', '', '...gggggg...', '...gggggg...', '.....LL.....'], // золотая маска, реактор
      eyes: 0xd6f3ff,
      pal: { g: 0xe0a82e, L: 0x9fe6ff },
    }),
    mechanic: who('Человек-паук', 'Человеком-пауком', '#E5484D', 0xd0312d, 'web', {
      paint: ['', '', '.....kk.....', '', '..b..kk..b..', '..bb....bb..'],
      legs: 0x2a4d9c,
      eyes: 0xf2f2f2,
      over: ['', '', '', '..w......w..'], // большие белые глаза маски
      pal: { k: 0x1b1b1b, b: 0x2a4d9c, w: 0xf2f2f2 },
    }),
    researcher: who('Халк', 'Халком', '#5FB37A', 0x5fa84a, 'magnifier', {
      paint: ['', '', '', '', '', '..pppppppp..'],
      legs: 0x6b3fa0,
      over: ['', '..hhhhhhhh..', '..h......h..'],
      pal: { p: 0x6b3fa0, h: 0x3a3a3a },
    }),
    scout: who('Тор', 'Тором', '#F2C230', 0x4a5568, 'hammer', {
      paint: [...FACE, '...G....G...'], // серебряные диски доспеха
      over: ['', '..hhhhhhhh..', '.hhhhhhhhhh.', '.h........h.', '.c........c.', '.c........c.', '.c........c.'], // светлые волосы, красный плащ
      pal: { h: 0xf2d04a, c: 0xc0392b },
    }),
    writer: who('Капитан Америка', 'Капитаном Америкой', '#7B8EAE', 0x2f4f9f, 'shield', {
      paint: ['', '', '.....ww.....', '...ssssss...', '.....ww.....', '..rwrwrwrw..'], // шлем с «A», звезда, полосы
      over: ['', '', '.w........w.'],
      pal: { w: 0xf2f2f2, r: 0xc0392b },
    }),
    designer: who('Танос', 'Таносом', '#A98BEF', 0xc9a227, 'gauntlet', {
      paint: [...FACE, '', '..bbbbbbbb..'], // фиолетовое лицо, золотые доспехи
      legs: 0x2f3f6f,
      over: ['', '', '', '....n..n....'], // борозды на подбородке
      pal: { s: 0x8e6bb5, n: 0x6b4f8c, b: 0x2f3f6f },
    }),
    apprentice: who('Чёрная Вдова', 'Чёрной Вдовой', '#E5484D', 0x3a3a44, 'binoculars', {
      paint: [...FACE, '', '..yyyrryyy..'],
      over: ['', '..hhhhhhhh..', '.hhhhhhhhhh.', '.hh......hh.', '.h........h.', '.h........h.'],
      pal: { h: 0xc0392b, y: 0xb8c0cc, r: 0xe5484d },
    }),
    artist: who(
      'Локи', 'Локи', '#5FB37A', 0x2e7d4a, 'cube',
      { paint: [...FACE, '....gggg....'], over: ['', '', '.kg......gk.', '.k........k.', '.k........k.'], pal: { g: 0xd4a017, k: 0x2b2b2b } },
      { hat: 'horns', hatColor: 0xd4a017 },
    ),
    librarian: who('Доктор Стрэндж', 'Доктором Стрэнджем', '#E8916A', 0x2f4f8f, 'spark', {
      paint: [...FACE, '.....gg.....'], // Глаз Агамотто
      legs: 0x2b2b38,
      over: ['', '..kkkkkkkk..', '.cG......Gc.', '.c........c.', '.c........c.', '.c........c.', '.c........c.'], // седые виски, плащ
      pal: { k: 0x2b2b2b, G: 0xb8c0cc, c: 0xb3261e, g: 0xd4a017 },
    }),
    editor: who('Грут', 'Грутом', '#C08A57', 0x7a5230, 'sprout', {
      paint: [...FACE, '..k..k..k...'], // кора
      over: ['...g...g....', '..gg.g.gg...'], // листья на макушке
      pal: { s: 0x9a6b3e, k: 0x5a3a20, g: 0x5fb37a },
    }),
    planner: who('Ник Фьюри', 'Ником Фьюри', '#9FB4D8', 0x3a3a44, 'book', {
      paint: FACE,
      eyes: 0xe6e6e6,
      over: ['', '', '....k.......', '..kkk.......'], // повязка на левом глазу
      pal: { s: 0x5a3825, k: 0x111111 },
    }),
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

// Слова команды: стандартная фраза → своя. Сравнение по началу строки, хвост (файл, команда, имя) остаётся.
// ponytail: подмена при показе, а не при записи — смена команды сразу переозвучивает всех, кто уже стоит в полосе
const PHRASES: Record<Team, [string, string][]> = {
  standard: [],
  potter: [
    ['запускает: ', 'колдует: '],
    ['набирает команду', 'выбирает заклинание'],
    ['читает: ', 'штудирует: '],
    ['ищет, что прочитать', 'ищет нужный свиток'],
    ['ищет «', 'Акцио «'],
    ['ищет файлы: ', 'Акцио, файлы: '],
    ['правит: ', 'трансфигурирует: '],
    ['правит блокнот: ', 'трансфигурирует блокнот: '],
    ['пишет правку', 'готовит трансфигурацию'],
    ['пишет: ', 'пишет на полях: '],
    ['пишет файл', 'обмакивает перо'],
    ['гуглит: ', 'выслеживает: '],
    ['открывает: ', 'проникает в: '],
    ['составляет запрос', 'выходит на охоту'],
    ['раздаёт задачу: ', 'шлёт сову: '],
    ['пишет задание', 'пишет письмо'],
    ['достаёт инструкцию: ', 'берёт книгу заклинаний: '],
    ['ищет инструмент', 'ищет нужный ключ'],
    ['обновляет план', 'сверяет расписание'],
    ['составляет план', 'ждёт распоряжений'],
    ['ждёт ответа от вас', 'ждёт приказа хозяина'],
    ['готовит макет', 'наводит лоск'],
    ['готовит генерацию', 'видит мозгошмыгов'],
    ['готовится', 'достаёт палочку'],
    ['читает задачу', 'читает письмо'],
    ['обдумывает результат', 'смотрит в Омут памяти'],
    ['смотрит за командой', 'присматривает за учениками'],
    ['получил задание', 'получил сову'],
    ['сдал работу', 'сдал эссе'],
    ['уходит домой', 'трансгрессирует домой'],
    ['ест курочку', 'ест шоколадную лягушку'],
    ['пьёт кофе', 'пьёт сливочное пиво'],
    ['читает газету', 'читает «Пророк»'],
    ['листает ленту', 'читает письмо из дома'],
    ['играет в приставку', 'играет в волшебные шахматы'],
    ['летает на шарике', 'летает на метле'],
    ['поливает цветок', 'пересаживает мандрагору'],
    ['медитирует', 'практикует окклюменцию'],
    ['качает гантели', 'тренируется к квиддичу'],
    ['жонглирует', 'жонглирует драже'],
    ['рисует картину', 'рисует живой портрет'],
    ['танцует', 'танцует на Святочном балу'],
    ['моется в душе', 'плещется в ванной старост'],
    ['гуляет', 'гуляет у Запретного леса'],
    ['слушает музыку', 'слушает «Ведуний»'],
    ['болтает с ', 'шепчется с '],
    ['играет в мяч с ', 'дуэлирует с '],
  ],
  marvel: [
    ['запускает: ', 'выстреливает: '],
    ['набирает команду', 'заряжает веб-шутеры'],
    ['читает: ', 'ХАЛК ЧИТАЕТ: '],
    ['ищет, что прочитать', 'ХАЛК ДУМАЕТ'],
    ['ищет «', 'ХАЛК ИЩЕТ «'],
    ['ищет файлы: ', 'ХАЛК ИЩЕТ ФАЙЛЫ: '],
    ['правит: ', 'Я есть Грут: '],
    ['правит блокнот: ', 'Я есть Грут: '],
    ['пишет правку', 'Я есть Грут'],
    ['пишет: ', 'пишет в блокнот: '],
    ['пишет файл', 'достаёт блокнот'],
    ['гуглит: ', 'зовёт Биврёст: '],
    ['открывает: ', 'летит в: '],
    ['составляет запрос', 'раскручивает молот'],
    ['раздаёт задачу: ', 'Мстители, общий сбор: '],
    ['пишет задание', 'собирает Мстителей'],
    ['достаёт инструкцию: ', 'открывает портал: '],
    ['ищет инструмент', 'листает Книгу Вишанти'],
    ['обновляет план', 'обновляет Инициативу'],
    ['составляет план', 'строит Инициативу'],
    ['ждёт ответа от вас', 'ждёт доклада от вас'],
    ['готовит макет', 'уравновешивает макет'],
    ['готовит генерацию', 'наводит иллюзию'],
    ['готовится', 'надевает костюм'],
    ['читает задачу', 'читает брифинг'],
    ['обдумывает результат', 'сверяется с ДЖАРВИСом'],
    ['получил задание', 'получил вызов'],
    ['сдал работу', 'миссия выполнена'],
    ['уходит домой', 'улетает на базу'],
    ['ест курочку', 'ест шаурму'],
    ['пьёт кофе', 'пьёт кофе в штабе'],
    ['читает газету', 'читает «Дейли Бьюгл»'],
    ['листает ленту', 'читает новости о себе'],
    ['играет в приставку', 'режется в Galaga'],
    ['летает на шарике', 'летает на репульсорах'],
    ['поливает цветок', 'поливает малыша Грута'],
    ['медитирует', 'медитирует в Камар-Тадже'],
    ['качает гантели', 'тренируется на базе'],
    ['жонглирует', 'жонглирует Камнями'],
    ['рисует картину', 'рисует эскиз брони'],
    ['танцует', 'танцует как Грут'],
    ['моется в душе', 'отмывается после битвы'],
    ['гуляет', 'патрулирует район'],
    ['слушает музыку', 'слушает «Потрясный микс»'],
    ['играет на гитаре', 'играет AC/DC'],
    ['болтает с ', 'обсуждает план с '],
    ['играет в мяч с ', 'кидает щит с '],
  ],
}

/** Фраза голосом текущей команды. */
export function say(action: string): string {
  for (const [from, to] of PHRASES[current]) if (action.startsWith(from)) return to + action.slice(from.length)
  return action
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
