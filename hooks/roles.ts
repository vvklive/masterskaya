import type { RoleKey, Worker } from '../types'

export type Hat = 'hardhat' | 'detective' | 'beret' | 'cap' | 'wizard' | 'hair' | 'horns' | 'none'
export type Prop =
  | 'wrench' | 'magnifier' | 'pencil' | 'binoculars' | 'brush' | 'palette' | 'megaphone' | 'book' | 'laptop' | 'bubble' | 'zzz' | 'check'
  | 'wand' | 'snitch' | 'sock' | 'shield' | 'spark' | 'web' | 'quill' | 'cube' | 'snake' | 'umbrella' | 'hammer' | 'gauntlet' | 'sprout'
  | 'phoenix' | 'repulsor' | 'katana' | 'walkman' | 'blaster' | 'bow' | 'firework'
  | 'batarang' | 'heat' | 'lasso' | 'bolt' | 'card' | 'bat' | 'staff' | 'lantern' | 'trident' | 'tray' | 'kryptonite' | 'cane'
  | 'dragon' | 'sword' | 'needle' | 'greatsword' | 'hoop' | 'door' | 'flame' | 'raven' | 'scroll' | 'goblet' | 'icespear' | 'ladder'
  | 'apple' | 'mirror' | 'rod'
  | 'lute' | 'mic' | 'parasol' | 'cup' | 'sandwich' | 'banana'
  | 'crysknife' | 'thumper' | 'donut' | 'slingshot' | 'sax' | 'beer' | 'martini' | 'scythe' | 'mrhat' | 'pacifier'

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

const THINKER: Role = { label: 'Думает', inst: 'помощником', color: '#D97757', hat: 'none', hatColor: 0, glasses: false, prop: 'bubble' }

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
  thinker: THINKER,
  // гости — сабагенты тематических команд; в стандартной сабагент меняет профессию под инструмент и гостем не бывает
  guest0: THINKER,
  guest1: THINKER,
  guest2: THINKER,
  guest3: THINKER,
  guest4: THINKER,
  guest5: THINKER,
  idle: { label: 'Отдыхает', inst: 'менеджером', color: '#8A8A8A', hat: 'hardhat', hatColor: 0xefefef, glasses: false, prop: 'zzz' },
  done: { label: 'Сдал работу', inst: 'помощником', color: '#5FB37A', hat: 'none', hatColor: 0, glasses: false, prop: 'check' },
}

export type Team =
  | 'standard' | 'potter' | 'marvel' | 'dc' | 'got' | 'twilight' | 'witcher' | 'himym' | 'friends' | 'nrk'
  | 'dune' | 'southpark' | 'simpsons' | 'familyguy'
export const TEAMS: Record<Team, string> = {
  standard: 'Стандартная',
  potter: 'Гарри Поттер',
  marvel: 'Мстители и Marvel',
  dc: 'Лига Справедливости',
  got: 'Игра престолов',
  twilight: 'Сумерки',
  witcher: 'Ведьмак',
  himym: 'Как я встретил вашу маму',
  friends: 'Друзья',
  nrk: 'Не родись красивой',
  dune: 'Дюна',
  southpark: 'Южный парк',
  simpsons: 'Симпсоны',
  familyguy: 'Гриффины',
}

type Cast = Partial<Record<RoleKey, Partial<Role>>>

const SKIN = 0xf0c8a0
const FACE = ['', '', '..ssssssss..', '..ssssssss..'] // голова — ряды 2–3, туловище — 4–5, ноги — 6–7
const ROBE = 0x4a4a5c // школьная мантия: темнее нельзя, пропадёт на тёмном терминале
const PALE = 0xf2ece6 // кожа вампира
const GOLD = 0xd4a017 // глаза Калленов: «вегетарианцы»
const CAT = 0xf2c230 // кошачьи глаза ведьмаков
const IBAD = 0x2f6fdf // «синева в синеве»: глаза фрименов от пряности
const SUIT = 0x7a6e60 // стилсьют
const YELLOW = 0xf5d327 // кожа Симпсонов
// причёски, которые повторяются от вселенной к вселенной
const SHORT = ['', '..hhhhhhhh..', '.h........h.']
const LONG = ['', '..hhhhhhhh..', '.hhhhhhhhhh.', '.h........h.', '.h........h.', '.h........h.']
const BOB = ['', '..hhhhhhhh..', '.hhhhhhhhhh.', '.h........h.', '.h........h.']
const CURLS = ['.h.h.h.h.h..', 'hhhhhhhhhhh.', 'hh........hh', 'h..........h']
const TIE = [...FACE, '.....w......', '.....r......'] // рубашка и галстук: одна вертикальная полоса, не читается ртом

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
    }),    // сабагенты
    guest0: who('Сириус Блэк', 'Сириусом Блэком', '#9FB4D8', 0x4a3b30, 'wand', {
      paint: [...FACE, '.....kk.....'], // бородка
      legs: 0x3a3a42,
      over: ['', '..hhhhhhhh..', '.hhhhhhhhhh.', '.hh......hh.', '.h........h.'],
      pal: { h: 0x463a32, k: 0x463a32 },
    }),
    guest1: who('Джинни Уизли', 'Джинни Уизли', '#E0823D', ROBE, 'wand', {
      paint: [...FACE, '....wraw....'],
      over: ['', '..hhhhhhhh..', '.hhhhhhhhhh.', '.h........h.', '.h........h.', '.h........h.', '.h........h.'],
      pal: { h: 0xd2691e, w: 0xf2f2f2, r: 0xb0302a, a: 0xe0b040 },
    }),
    guest2: who('Невилл', 'Невиллом', '#C08A57', ROBE, 'sprout', {
      paint: [...FACE, '....wraw....'],
      over: ['', '..hhhhhhhh..', '.h........h.'],
      pal: { h: 0x6b4a2e, w: 0xf2f2f2, r: 0xb0302a, a: 0xe0b040 },
    }),
    guest3: who('Беллатриса', 'Беллатрисой', '#B8C0CC', 0x3a3a44, 'wand', {
      paint: FACE,
      over: ['..h.hh.hh...', '.hhhhhhhhhh.', '.hhhhhhhhhh.', '.hh......hh.', '.hh......hh.', '.h.h....h.h.'], // безумная копна
      pal: { s: 0xe8e4dc, h: 0x453c45 },
    }),
    guest4: who('Фред Уизли', 'Фредом Уизли', '#E0823D', 0x2f4f8f, 'firework', {
      paint: [...FACE, '....yyy.....', '....y.......'], // свитер с буквой F
      over: ['', '..hhhhhhhh..', '.hhhhhhhhhh.', '.h........h.'],
      pal: { h: 0xd2691e, y: 0xf2c230 },
    }),
    guest5: who('Джордж Уизли', 'Джорджем Уизли', '#E0823D', 0x2f4f8f, 'firework', {
      paint: [...FACE, '....yyy.....', '....y.yy....'], // свитер с буквой G
      over: ['', '..hhhhhhhh..', '.hhhhhhhhhh.', '.h........h.'],
      pal: { h: 0xd2691e, y: 0xf2c230 },
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
    }),    // сабагенты
    guest0: who('Дэдпул', 'Дэдпулом', '#E5484D', 0xb3261e, 'katana', {
      legs: 0x2b2b2b,
      eyes: 0xf2f2f2,
      over: ['..k......k..', '..k......k..', '', '..k.k..k.k..'], // рукояти катан за спиной, чёрные пятна маски
      pal: { k: 0x1b1b1b },
    }),
    guest1: who('Звёздный Лорд', 'Звёздным Лордом', '#E0823D', 0x8b2e2e, 'walkman', {
      paint: FACE,
      legs: 0x5a4636,
      over: ['', '.khhhhhhhhk.', '.kh......hk.'], // наушники поверх волос
      pal: { h: 0x8b5a2b, k: 0x1b1b1b },
    }),
    guest2: who('Ракета', 'Ракетой', '#C08A57', 0x4a5a7a, 'blaster', {
      paint: ['', '', '..ffffffff..', '..kkkkkkkk..'], // мех и тёмная маска енота
      eyes: 0xf2f2f2,
      over: ['', '..f......f..'],
      pal: { f: 0x9a8268, k: 0x3a2e24 },
    }),
    guest3: who('Соколиный глаз', 'Соколиным глазом', '#A98BEF', 0x4a3a6b, 'bow', {
      paint: FACE,
      over: ['', '..hhhhhhhh..', '..h......h..'],
      pal: { h: 0xb08a5a },
    }),
    guest4: who('Вижн', 'Вижном', '#5FB37A', 0x2e7d4a, 'bubble', {
      paint: FACE,
      over: ['', '', '.....yy.....', '.c........c.', '.c........c.', '.c........c.'], // Камень разума, жёлтый плащ
      pal: { s: 0xc0392b, y: 0xf2c230, c: 0xd4a017 },
    }),
    guest5: who('Капитан Марвел', 'Капитаном Марвел', '#E5484D', 0x2f4f9f, 'repulsor', {
      paint: [...FACE, '.....yy.....', '..rrrrrrrr..'],
      over: ['', '..hhhhhhhh..', '.hh......hh.', '.h........h.', '.h........h.'],
      pal: { h: 0xf2d04a, y: 0xf2c230, r: 0xc0392b },
    }),
  },
  dc: {
    foreman: who('Бэтмен', 'Бэтменом', '#9FB4D8', 0x5a5f6b, 'batarang', {
      paint: ['', '', '..kkkkkkkk..', '..kkkkkkkk..', '....ykky....', '..yyyyyyyy..'], // маска, эмблема, пояс
      legs: 0x3a3a46,
      eyes: 0xf2f2f2,
      over: ['', '..k......k..', '', '.c........c.', '.c........c.', '.c........c.', '.c........c.'], // уши маски, плащ
      pal: { k: 0x3a3a46, y: 0xf2c230, c: 0x3a3a46 },
    }),
    mechanic: who('Супермен', 'Суперменом', '#5F8FEF', 0x2f5fbf, 'heat', {
      paint: [...FACE, '....ryyr....', '.....rr.....'], // знак S
      over: ['', '..hhhhhhhh..', '....h.......', '.c........c.', '.c........c.', '.c........c.', '.c........c.'], // завиток, красный плащ
      pal: { h: 0x34343c, r: 0xc0392b, y: 0xf2c230, c: 0xc0392b },
    }),
    researcher: who('Чудо-женщина', 'Чудо-женщиной', '#E5484D', 0xb3261e, 'lasso', {
      paint: [...FACE, '...yyyyyy...'], // золотой орёл
      legs: 0x2f4f9f,
      over: ['', '..hhhhhhhh..', '.hyyyRyyyyh.', '.h........h.', '.h........h.', '.h........h.'], // диадема со звездой
      pal: { h: 0x34343c, y: 0xf2c230 },
    }),
    scout: who('Флэш', 'Флэшем', '#F2C230', 0xc0392b, 'bolt', {
      paint: ['', '', '', '', '....wyyw....'], // молния на груди
      over: ['', '', '.y........y.'], // молнии-уши маски
      pal: { w: 0xf2f2f2, y: 0xf2c230 },
    }),
    writer: who('Джокер', 'Джокером', '#5FB37A', 0x6b3fa0, 'card', {
      paint: [...FACE, '...goooog...'],
      over: ['', '..hhhhhhhh..', '.hhhhhhhhhh.', '.h...rr...h.'], // зелёные волосы, красная ухмылка
      pal: { s: 0xf2f2f2, h: 0x3fae5a, g: 0x2e7d4a, o: 0xe0823d, r: 0xe5484d },
    }),
    designer: who('Харли Квинн', 'Харли Квинн', '#EF74A2', 0xb3261e, 'bat', {
      paint: [...FACE, '......jjjjj.', '......jjjj..'], // куртка красно-синяя
      legs: 0x3a3a46,
      over: ['', '..hhhhhhhh..', '.phhhhhhhhb.', '.p........b.', '.p........b.'], // хвостики с розовыми и голубыми концами
      pal: { s: 0xf2f2f2, h: 0xf2d04a, p: 0xef74a2, b: 0x5f8fef, j: 0x2f4f9f },
    }),
    apprentice: who('Робин', 'Робином', '#E5484D', 0xc0392b, 'staff', {
      paint: [...FACE, '...y........'],
      legs: 0x2e7d4a,
      over: ['', '..hhhhhhhh..', '.yh......hy.', '.yk.k..k.ky.', '.y........y.', '.y........y.'], // маска, жёлтый плащ
      pal: { h: 0x34343c, k: 0x1b1b1b, y: 0xf2c230 },
    }),
    artist: who('Зелёный Фонарь', 'Зелёным Фонарём', '#5FB37A', 0x2e9e4a, 'lantern', {
      paint: ['', '', '..ssssssss..', '..gggggggg..', '....wggw....', '..kk....kk..'], // маска, знак фонаря
      legs: 0x2b2b33,
      eyes: 0xf2f2f2,
      over: ['', '..hhhhhhhh..'],
      pal: { h: 0x6b4a2e, g: 0x1f7a3a, w: 0xf2f2f2, k: 0x2b2b33 },
    }),
    librarian: who('Киборг', 'Киборгом', '#B8C0CC', 0xb8c0cc, 'laptop', {
      paint: ['', '', '..qqqqGGGG..', '..qqqqGGGG..', '.....rr.....', '..DD....DD..'], // пол-лица металл
      over: ['', '', '', '........r...'], // красный глаз
      pal: { q: 0x6b4a3a, G: 0x8a95a5, r: 0xe5484d, D: 0x6b7280 },
    }),
    editor: who('Аквамен', 'Акваменом', '#F2C230', 0xd4a017, 'trident', {
      paint: FACE,
      legs: 0x2e7d4a,
      over: ['', '..hhhhhhhh..', '.hhhhhhhhhh.', '.hh......hh.', '.h.hhhhhh.h.', '.h........h.'], // грива и борода
      pal: { h: 0x7b4a2a },
    }),
    planner: who('Альфред', 'Альфредом', '#B8C0CC', 0x3a3a46, 'tray', {
      paint: [...FACE, '....wkkw....', '.....ww.....'], // сорочка и бабочка
      over: ['', '', '..G......G..'], // седина
      pal: { w: 0xf2f2f2, k: 0x1b1b1b },
    }),
    // сабагенты
    guest0: who('Шазам', 'Шазамом', '#F2C230', 0xc0392b, 'bolt', {
      paint: [...FACE, '....yy......', '.....yy.....'],
      over: ['', '..hhhhhhhh..', '..h.........', '.w........w.', '.w........w.', '.w........w.'],
      pal: { h: 0x34343c, y: 0xf2c230, w: 0xf2f2f2 },
    }),
    guest1: who('Зелёная Стрела', 'Зелёной Стрелой', '#5FB37A', 0x2e7d4a, 'bow', {
      paint: FACE,
      over: ['', '..gggggggg..', '.gg......gg.', '.gk.k..k.kg.'], // капюшон и маска
      pal: { g: 0x1f5a2e, k: 0x1b1b1b },
    }),
    guest2: who('Супергёрл', 'Супергёрл', '#5F8FEF', 0x2f5fbf, 'heat', {
      paint: [...FACE, '....ryyr....', '..rrrrrrrr..'],
      over: ['', '..hhhhhhhh..', '.hhhhhhhhhh.', '.h........h.', '.h........h.', '.h........h.'],
      pal: { h: 0xf2d04a, r: 0xc0392b, y: 0xf2c230 },
    }),
    guest3: who('Лекс Лютор', 'Лексом Лютором', '#A98BEF', 0x3a3a46, 'kryptonite', {
      paint: [...FACE, '....wvvw....'], // лысый, костюм, фиолетовый галстук
      pal: { w: 0xf2f2f2, v: 0x6b3fa0 },
    }),
    guest4: who('Марсианин', 'Марсианином', '#5FB37A', 0x3fae5a, 'bubble', {
      paint: ['', '', '..mmmmmmmm..', '', '...rr..rr...', '.....rr.....'], // тяжёлые брови, красный крест
      eyes: 0xe5484d,
      over: ['', '', '', '.c........c.', '.c........c.', '.c........c.'],
      pal: { m: 0x2e8b45, r: 0xc0392b, c: 0x2f4f9f },
    }),
    guest5: who(
      'Загадочник', 'Загадочником', '#5FB37A', 0x2e7d4a, 'cane',
      { paint: [...FACE, '....kkk.....', '......k.....'], over: ['', '', '', '..v.v..v.v..'], pal: { k: 0x1b1b1b, v: 0x6b3fa0 } }, // знак вопроса, маска
      { hat: 'detective', hatColor: 0x1f5a2e },
    ),
  },
  got: {
    foreman: who('Дейенерис', 'Дейенерис', '#E8E0C8', 0x7a8ea8, 'dragon', {
      paint: FACE,
      over: ['', '..hhhhhhhh..', '.hhhhhhhhhh.', '.h........h.', '.h........h.', '.h........h.', '.h........h.'], // серебряные косы
      pal: { h: 0xf1ecd6 },
    }),
    mechanic: who('Джон Сноу', 'Джоном Сноу', '#9FB4D8', 0x3a3a46, 'sword', {
      paint: [...FACE, '..ffffffff..'], // меховой воротник Дозора
      legs: 0x2b2b33,
      over: ['', '..hhhhhhhh..', '.hh......hh.', '.h........h.'],
      pal: { h: 0x3a3036, f: 0x7a6a5a },
    }),
    researcher: who('Тирион', 'Тирионом', '#F2C230', 0x8b1a1a, 'book', {
      paint: [...FACE, '', '.....yy.....'], // лев Ланнистеров
      over: ['', '..hhhhhhhh..', '.hh......hh.', '.h........h.', '...hhhhhh...'],
      pal: { h: 0xb08a5a, y: 0xf2c230 },
    }),
    scout: who('Арья', 'Арьей', '#B8C0CC', 0x7a6a5a, 'needle', {
      paint: FACE,
      legs: 0x4a3f36,
      over: ['', '..hhhhhhhh..', '.h........h.'],
      pal: { h: 0x6b4a2e },
    }),
    writer: who('Серсея', 'Серсеей', '#F2C230', 0x9b1b30, 'goblet', {
      paint: [...FACE, '...y....y...'],
      over: ['..y.y.y.y...', '..hhhhhhhh..', '.hhhhhhhhhh.', '.h........h.', '.h........h.', '.h........h.'], // корона
      pal: { h: 0xf2d04a, y: 0xd4a017 },
    }),
    designer: who('Санса', 'Сансой', '#E0823D', 0x5a6a7a, 'hoop', {
      paint: FACE,
      over: ['', '..hhhhhhhh..', '.hhhhhhhhhh.', '.h........h.', '.h........h.', '.h........h.', '.h........h.'],
      pal: { h: 0xb0452a },
    }),
    apprentice: who('Ходор', 'Ходором', '#C08A57', 0x6b5a3e, 'door', {
      paint: FACE,
      over: ['', '.hhhhhhhhhh.', '.hh......hh.', '.h........h.', '.hhhhhhhhhh.', '..hhhhhhhh..'],
      pal: { h: 0x7b5a3a },
    }),
    artist: who('Мелисандра', 'Мелисандрой', '#E5484D', 0xa3243b, 'flame', {
      paint: [...FACE, '....yuuy....'], // рубин на шее
      over: ['', '..hhhhhhhh..', '.hhhhhhhhhh.', '.h........h.', '.h........h.', '.h........h.', '.h........h.'],
      pal: { h: 0xc0392b, y: 0xd4a017, u: 0xff4f5e },
    }),
    librarian: who('Бран', 'Браном', '#B8C0CC', 0x5a5040, 'raven', {
      paint: [...FACE, '..ffffffff..'],
      eyes: 0xf2f2f2, // белые глаза варга
      over: ['', '..hhhhhhhh..', '.h........h.'],
      pal: { h: 0x6b4a2e, f: 0x8a7a6a },
    }),
    editor: who('Нед Старк', 'Недом Старком', '#9FB4D8', 0x5a4a3a, 'greatsword', {
      paint: [...FACE, '..ffffffff..'],
      over: ['', '..hhhhhhhh..', '.hh......hh.', '.h........h.', '...hhhhhh...'],
      pal: { h: 0x5a4030, f: 0x8a7a6a },
    }),
    planner: who('Варис', 'Варисом', '#A98BEF', 0x6b3fa0, 'scroll', {
      paint: [...FACE, '..yyyyyyyy..'],
      pal: { s: 0xf0d8c0, y: 0xd4a017 },
    }),
    // сабагенты
    guest0: who('Джейме', 'Джейме', '#F2C230', 0xd4a017, 'sword', {
      paint: FACE,
      over: ['', '..hhhhhhhh..', '.h........h.', '.c........c.', '.c........c.', '.c........c.'],
      pal: { h: 0xf2d04a, c: 0x9b1b30 },
    }),
    guest1: who('Бриенна', 'Бриенной', '#5F8FEF', 0x3b5a8c, 'sword', {
      paint: FACE,
      over: ['', '..hhhhhhhh..', '.h........h.'],
      pal: { h: 0xf2d04a },
    }),
    guest2: who('Пёс', 'Псом', '#B8C0CC', 0x4a4a52, 'greatsword', {
      paint: ['', '', '..qqssssss..', '..qqssssss..'], // обожжённая половина лица
      over: ['', '..hhhhhhhh..', '.hh......hh.', '.h........h.', '.h........h.'],
      pal: { q: 0xb06a5a, h: 0x3a3036 },
    }),
    guest3: who('Ночной король', 'Ночным королём', '#9FD3F5', 0x4a5a6a, 'icespear', {
      paint: FACE,
      eyes: 0x1f5fbf,
      over: ['.L.L.L.L.L..', '..LLLLLLLL..'], // ледяная корона
      pal: { s: 0x9fc8e0, L: 0x9fd3f5 },
    }),
    guest4: who('Джоффри', 'Джоффри', '#F2C230', 0x9b1b30, 'goblet', {
      paint: [...FACE, '..yyyyyyyy..'],
      over: ['..y.y.y.y...', '..hhhhhhhh..', '.h........h.'],
      pal: { h: 0xf2d04a, y: 0xd4a017 },
    }),
    guest5: who('Мизинец', 'Мизинцем', '#5FB37A', 0x2e4a3a, 'ladder', {
      paint: [...FACE, '.....y......'], // брошь-пересмешник
      over: ['', '..hhhhhhhh..', '.h........h.'],
      pal: { h: 0x3a3036, y: 0xd4a017 },
    }),
  },
  twilight: {
    foreman: who('Белла', 'Беллой', '#5F8FEF', 0x3b6fb0, 'apple', {
      paint: FACE,
      over: ['', '..hhhhhhhh..', '.hhhhhhhhhh.', '.h........h.', '.h........h.', '.h........h.'], // яблоко с обложки, голубая кофта
      legs: 0x3b4a8c,
      pal: { s: 0xf4e4d4, h: 0x5a3a24 },
    }),
    mechanic: who('Джейкоб', 'Джейкобом', '#C08A57', 0xa8704a, 'wrench', {
      paint: [...FACE, '.k..........'], // без футболки, тату стаи на плече; чинит мотоциклы
      legs: 0x3b4a8c,
      over: ['', '..hhhhhhhh..', '.h........h.'],
      pal: { s: 0xa8704a, h: 0x1b1b1b, k: 0x3a2418 },
    }),
    researcher: who('Эдвард', 'Эдвардом', '#E0823D', 0x5a5f6a, 'book', {
      paint: FACE,
      eyes: GOLD,
      over: ['....hhh.....', '..hhhhhhhh..', '..h......h..'], // бронзовый вихор вверх
      pal: { s: PALE, h: 0x9a5a2e },
    }),
    scout: who('Джеймс', 'Джеймсом', '#E5484D', 0x6b4a2e, 'binoculars', {
      paint: FACE,
      eyes: 0xe5484d,
      over: ['', '..hhhhhhhh..', 'hh........h.', 'h...........'], // ищейка, хвост на затылке
      pal: { s: PALE, h: 0xd8c08a },
    }),
    writer: who('Карлайл', 'Карлайлом', '#F2C230', 0xd8dce2, 'quill', {
      paint: FACE, // белый халат доктора
      eyes: GOLD,
      over: ['', '..hhhhhhhh..', '..h.......h.'],
      pal: { s: PALE, h: 0xe8d08a },
    }),
    designer: who('Элис', 'Элис', '#A98BEF', 0x6b3fa0, 'pencil', {
      paint: FACE,
      eyes: GOLD,
      over: ['..h.h.h.h...', '..hhhhhhhh..', '.h........h.'], // короткие чёрные пёрышки
      pal: { s: PALE, h: 0x1b1b1b },
    }),
    apprentice: who('Эммет', 'Эмметом', '#9FB4D8', 0x4a4f5a, 'bat', {
      paint: FACE,
      eyes: GOLD,
      over: ['.h.h.h.h.h..', '..hhhhhhhh..'], // бита с бейсбола в грозу
      pal: { s: PALE, h: 0x3a2a20 },
    }),
    artist: who('Джаспер', 'Джаспером', '#C08A57', 0x7a6a5a, 'palette', {
      paint: FACE,
      eyes: GOLD,
      over: ['', '..hhhhhhhh..', '.hh......hh.', '.h........h.'],
      pal: { s: PALE, h: 0xc8a050 },
    }),
    librarian: who('Аро', 'Аро', '#E5484D', 0x34343e, 'scroll', {
      paint: FACE, // плащ Вольтури
      eyes: 0xb0302a,
      over: ['', '..hhhhhhhh..', '.hhhhhhhhhh.', '.h........h.', '.h........h.', '.h........h.'],
      pal: { s: 0xf2f0ec, h: 0x1b1b1b },
    }),
    editor: who('Розали', 'Розали', '#F2C230', 0x9b1b30, 'mirror', {
      paint: FACE,
      eyes: GOLD,
      over: ['', '..hhhhhhhh..', '.hhhhhhhhhh.', '.h........h.', '.h........h.', '.h........h.', '.h........h.'],
      pal: { s: PALE, h: 0xf2d04a },
    }),
    planner: who('Чарли', 'Чарли', '#C08A57', 0x8a7a5a, 'rod', {
      paint: [...FACE, '...y........'], // шериф Форкса: значок, усы, удочка
      over: ['', '..hhhhhhhh..', '.h........h.', '', '....mmmm....'],
      pal: { h: 0x5a3a24, m: 0x3a2418, y: 0xd4a017 },
    }),
    // сабагенты
    guest0: who('Эсме', 'Эсме', '#5FB37A', 0x5f8f7a, 'tray', {
      paint: FACE,
      eyes: GOLD,
      over: ['', '..hhhhhhhh..', '.hhhhhhhhhh.', '.h........h.', '.h........h.'],
      pal: { s: PALE, h: 0x9a6a3a },
    }),
    guest1: who('Ренесми', 'Ренесми', '#E0823D', 0xe0d8d0, 'sprout', {
      paint: FACE,
      over: ['', '..hhhhhhhh..', '.hhhhhhhhhh.', '.h.h....h.h.', '.h.h....h.h.'], // бронзовые кудри
      pal: { s: 0xf4e4d4, h: 0xa0582e },
    }),
    guest2: who('Джейн', 'Джейн', '#E5484D', 0x34343e, 'spark', {
      paint: FACE,
      eyes: 0xe5484d,
      over: ['....hh......', '..hhhhhhhh..', '.h........h.'], // пучок, плащ Вольтури
      pal: { s: 0xf2f0ec, h: 0xe8d08a },
    }),
    guest3: who('Виктория', 'Викторией', '#E0823D', 0x5a4a3a, 'flame', {
      paint: FACE,
      eyes: 0xe5484d,
      over: ['.h.h.h.h.h..', 'hhhhhhhhhhh.', 'hh........hh', 'h..........h', 'h..........h'], // огненные кудри
      pal: { s: PALE, h: 0xd2501e },
    }),
    guest4: who('Лоран', 'Лораном', '#C08A57', 0x8a7a6a, 'staff', {
      paint: FACE,
      eyes: 0xe5484d,
      over: ['', '..hhhhhhhh..', '.h.h....h.h.', '.h.h....h.h.', '.h........h.'], // дреды
      pal: { s: 0x7a4a30, h: 0x2a1a10 },
    }),
    guest5: who('Сет', 'Сетом', '#C08A57', 0xa8704a, 'wrench', {
      paint: [...FACE, '.k..........'], // стая квилетов, как Джейкоб
      legs: 0x5a4636,
      over: ['', '..hhhhhhhh..'],
      pal: { s: 0xa8704a, h: 0x1b1b1b, k: 0x3a2418 },
    }),
  },
  witcher: {
    foreman: who('Геральт', 'Геральтом', '#E8E0C8', 0x3a3a46, 'sword', {
      paint: FACE,
      eyes: CAT,
      over: LONG, // седые волосы до плеч
      pal: { s: 0xe8d0b8, h: 0xe8e8e8 },
    }),
    mechanic: who('Цири', 'Цири', '#9FD3F5', 0xd8d0c0, 'katana', {
      paint: ['', '', '..ssssssss..', '..qsssssss..'], // шрам на щеке
      eyes: 0x5fb37a,
      legs: 0x4a3f36,
      over: ['', '..hhhhhhhh..', '.hh......hh.', '.h........h.'],
      pal: { h: 0xd8d8d8, q: 0xb06a5a },
    }),
    researcher: who('Йеннифэр', 'Йеннифэр', '#A98BEF', 0x34343e, 'spark', {
      paint: FACE,
      eyes: 0x8e5bd9, // фиалковые глаза
      over: ['', '..hhhhhhhh..', '.hhhhhhhhhh.', 'hh........hh', '.h........h.', 'hh........hh'],
      pal: { s: 0xf2e6dc, h: 0x1b1b1b },
    }),
    scout: who(
      'Лютик', 'Лютиком', '#5F8FEF', 0x3b6fb0, 'lute',
      { paint: FACE, over: ['', '', '.h........h.'], pal: { h: 0x7b4a2a } },
      { hat: 'beret', hatColor: 0x9b1b30 },
    ),
    writer: who('Весемир', 'Весемиром', '#B8C0CC', 0x5a4a3a, 'quill', {
      paint: FACE,
      eyes: CAT,
      over: ['', '..hhhhhhhh..', '.h........h.', '', '...hhhhhh...'], // седая борода; пишет бестиарий
      pal: { h: 0xb8b8b8 },
    }),
    designer: who('Филиппа', 'Филиппой', '#A98BEF', 0x6b3fa0, 'raven', {
      paint: FACE,
      over: ['....hh......', '..hhhhhhhh..', '.hh......hh.'], // сова на руке
      pal: { h: 0x2a1a10 },
    }),
    apprentice: who('Плотва', 'Плотвой', '#C08A57', 0x8b5a2b, 'sprout', {
      paint: FACE, // лошадь Геральта: уши, грива и сено
      legs: 0x6b4a2e,
      over: ['..e....e....', '..hhhhhhh...', '.h..........', '.h..........'],
      pal: { s: 0x8b5a2b, h: 0x3a2418, e: 0x8b5a2b },
    }),
    artist: who('Трисс', 'Трисс', '#E0823D', 0x3e8e5a, 'flame', {
      paint: FACE,
      over: LONG,
      pal: { h: 0xc0502a },
    }),
    librarian: who('Регис', 'Регисом', '#B8C0CC', 0x6b6b5a, 'book', {
      paint: FACE,
      over: SHORT,
      pal: { s: 0xe6e0d8, h: 0x9a9a9a },
    }),
    editor: who('Золтан', 'Золтаном', '#E0823D', 0x6b5a3e, 'hammer', {
      paint: FACE, // краснолюд-кузнец, борода лопатой
      over: ['', '..hhhhhhhh..', '.h........h.', '', '..hhhhhhhh..', '...hhhhhh...'],
      pal: { h: 0x8b4a2a },
    }),
    planner: who('Дийкстра', 'Дийкстрой', '#E5484D', 0x9b6a3a, 'scroll', { paint: FACE, pal: {} }), // лысый глава разведки
    // сабагенты
    guest0: who('Эскель', 'Эскелем', '#B8C0CC', 0x4a4a52, 'sword', {
      paint: ['', '', '..sssqssss..', '..ssssqsss..'], // шрам через лицо
      eyes: CAT,
      over: SHORT,
      pal: { h: 0x3a2a20, q: 0xb06a5a },
    }),
    guest1: who('Ламберт', 'Ламбертом', '#C08A57', 0x5a4a3a, 'bow', { paint: FACE, eyes: CAT, over: SHORT, pal: { h: 0x2a1a10 } }),
    guest2: who('Калантэ', 'Калантэ', '#5F8FEF', 0x2f4f9f, 'sword', {
      paint: FACE,
      over: ['..y.y.y.y...', '..hhhhhhhh..', '.hhhhhhhhhh.', '.h........h.', '.h........h.'], // корона Цинтры
      pal: { h: 0xd8c08a, y: 0xd4a017 },
    }),
    guest3: who('Эредин', 'Эредином', '#9FD3F5', 0x4a5a6a, 'icespear', {
      paint: FACE,
      eyes: 0x9fd3f5,
      over: ['.L.L..L.L...', '..LLLLLLLL..', '.LL......LL.', '.L........L.'], // шлем Дикой Охоты
      pal: { L: 0x9fc8e0 },
    }),
    guest4: who('Господин Зеркало', 'Господином Зеркало', '#E5484D', 0x6b5a3e, 'mirror', { paint: FACE, over: SHORT, pal: { h: 0x3a2a20 } }),
    guest5: who('Кровавый Барон', 'Кровавым Бароном', '#E5484D', 0x8b1a1a, 'goblet', {
      paint: FACE,
      over: ['', '', '', '', '..hhhhhhhh..', '...hhhhhh...'],
      pal: { h: 0x5a3a24 },
    }),
  },
  himym: {
    foreman: who('Барни', 'Барни', '#E8E0C8', 0x3a3a46, 'book', {
      paint: TIE, // всегда в костюме; в руке Пособие
      over: SHORT,
      pal: { h: 0xe8c870, w: 0xf2f2f2, r: 0xb0302a },
    }),
    mechanic: who('Тед', 'Тедом', '#5F8FEF', 0x5a6f8f, 'pencil', {
      paint: FACE, // архитектор: чертит
      over: ['', '..hhhhhhhh..', '.hh......hh.', '.h........h.'],
      pal: { h: 0x5a3a24 },
    }),
    researcher: who('Маршалл', 'Маршаллом', '#C08A57', 0x7a5a3a, 'hammer', { paint: FACE, over: SHORT, pal: { h: 0x6b4a2e } }), // судейский молоток
    scout: who('Робин', 'Робин', '#5F8FEF', 0x2f4f9f, 'mic', { paint: FACE, over: LONG, pal: { h: 0x3a2418 } }), // репортёр
    writer: who('Трейси', 'Трейси', '#F2C230', 0xe0d8c8, 'parasol', { paint: FACE, over: BOB, pal: { h: 0x6b4a2e } }), // та самая мама с жёлтым зонтом
    designer: who('Лили', 'Лили', '#E5484D', 0x5fb37a, 'palette', {
      paint: FACE,
      over: ['', '..hhhhhhhh..', '.hhhhhhhhhh.', '.h........h.'],
      pal: { h: 0xb0302a },
    }),
    apprentice: who(
      'Ранджит', 'Ранджитом', '#C08A57', 0x3a3a46, 'hoop', // водитель: руль
      { paint: FACE, over: ['', '', '', '', '...hhhhhh...'], pal: { s: 0x8a5a3a, h: 0x1b1b1b } },
      { hat: 'cap', hatColor: 0x5a5f6a },
    ),
    artist: who('Карл', 'Карлом', '#F2C230', 0x34343e, 'goblet', { paint: FACE, over: SHORT, pal: { h: 0x2a1a10 } }), // бармен «Макларенс»
    librarian: who('Джеймс', 'Джеймсом', '#9FB4D8', 0x5a5f6a, 'book', { paint: TIE, over: SHORT, pal: { s: 0x6b4a30, h: 0x1b1b1b, w: 0xf2f2f2, r: 0x2f4f9f } }),
    editor: who('Стелла', 'Стеллой', '#9FB4D8', 0xd8dce2, 'magnifier', { paint: FACE, over: LONG, pal: { h: 0x2a1a10 } }), // дерматолог: сводит тату
    planner: who('Виктория', 'Викторией', '#EF74A2', 0xef74a2, 'tray', { paint: FACE, over: BOB, pal: { h: 0xe8c870 } }), // пекарь
    // сабагенты
    guest0: who('Зоуи', 'Зоуи', '#5FB37A', 0x3e8e5a, 'sprout', { paint: FACE, over: CURLS, pal: { h: 0x5a3a24 } }),
    guest1: who('Квинн', 'Квинн', '#E5484D', 0x9b1b30, 'card', { paint: FACE, over: LONG, pal: { h: 0x1b1b1b } }),
    guest2: who('Нора', 'Норой', '#9FB4D8', 0x5a6a7a, 'book', { paint: FACE, over: BOB, pal: { h: 0x2a1a10 } }),
    guest3: who('Кевин', 'Кевином', '#C08A57', 0x6b5a3e, 'pencil', {
      paint: FACE,
      over: [...SHORT, '..k.k..k.k..'], // психотерапевт в очках
      pal: { h: 0x2a1a10, k: 0x1b1b1b },
    }),
    guest4: who('Капитан', 'Капитаном', '#5F8FEF', 0x2f4f9f, 'scroll', { paint: FACE, over: SHORT, pal: { h: 0xb8b8b8 } }, { hat: 'cap', hatColor: 0xefefef }),
    guest5: who('Сэнди Риверс', 'Сэнди Риверсом', '#F2C230', 0x5a5f6a, 'mic', { paint: TIE, over: SHORT, pal: { h: 0xe8c870, w: 0xf2f2f2, r: 0x9b1b30 } }),
  },
  friends: {
    foreman: who('Моника', 'Моникой', '#A98BEF', 0x5a3a5a, 'tray', { paint: FACE, over: BOB, pal: { h: 0x2a1a10 } }), // шеф и чистюля
    mechanic: who('Чендлер', 'Чендлером', '#5F8FEF', 0x4a5a7a, 'laptop', { paint: FACE, over: SHORT, pal: { h: 0x5a3a24 } }), // «обработка данных»
    researcher: who('Росс', 'Россом', '#C08A57', 0x6b5a3e, 'book', {
      paint: FACE,
      over: ['', '..hhhhhhhh..', '.hh......hh.'],
      pal: { h: 0x2a1a10 },
    }),
    scout: who('Фиби', 'Фиби', '#A98BEF', 0xa98bef, 'lute', { paint: FACE, over: LONG, pal: { h: 0xf2d04a } }), // «Вонючий кот»
    writer: who('Джоуи', 'Джоуи', '#E0823D', 0x6b4a2e, 'sandwich', { paint: FACE, over: SHORT, pal: { h: 0x1b1b1b } }),
    designer: who('Рейчел', 'Рейчел', '#EF74A2', 0x8b2e3c, 'brush', {
      paint: FACE,
      over: ['', '..hhhhhhhh..', '.hhhhhhhhhh.', 'hh........hh', '.h........h.'], // стрижка «Рейчел»
      pal: { h: 0xb08a5a },
    }),
    apprentice: who('Гантер', 'Гантером', '#F2C230', 0xd8dce2, 'cup', {
      paint: FACE,
      over: ['..h.h.h.h...', '..hhhhhhhh..'], // платиновый ёжик, бариста «Central Perk»
      pal: { h: 0xf8f4e0 },
    }),
    artist: who('Дженис', 'Дженис', '#C08A57', 0x8b5a2b, 'palette', { paint: FACE, over: CURLS, pal: { h: 0x2a1a10 } }),
    librarian: who('Ричард', 'Ричардом', '#B8C0CC', 0x3a3a46, 'book', {
      paint: FACE,
      over: ['', '..hhhhhhhh..', '.h........h.', '', '....mmmm....'], // усы
      pal: { h: 0x9a9a9a, m: 0x7a7a7a },
    }),
    editor: who('Урсула', 'Урсулой', '#A98BEF', 0x34343e, 'pencil', { paint: FACE, over: LONG, pal: { h: 0xf2d04a } }),
    planner: who('Марсель', 'Марселем', '#C08A57', 0x7a5a3a, 'banana', {
      paint: FACE, // обезьянка Росса
      legs: 0x7a5a3a,
      over: ['', '', 'e..........e', 'e..........e'],
      pal: { s: 0xc8a080, e: 0x7a5a3a },
    }),
    // сабагенты
    guest0: who('Майк', 'Майком', '#5F8FEF', 0x3b6fb0, 'card', { paint: FACE, over: SHORT, pal: { h: 0xd8c08a } }),
    guest1: who('Эмили', 'Эмили', '#E0823D', 0x5a6a7a, 'book', { paint: FACE, over: LONG, pal: { h: 0x9a5a2e } }),
    guest2: who('Кэрол', 'Кэрол', '#F2C230', 0x5f8f7a, 'sprout', { paint: FACE, over: SHORT, pal: { h: 0xf2d04a } }),
    guest3: who('Сьюзен', 'Сьюзен', '#9FB4D8', 0x4a4a52, 'pencil', { paint: FACE, over: SHORT, pal: { h: 0x2a1a10 } }),
    guest4: who('Тэг', 'Тэгом', '#F2C230', 0x5a6f8f, 'scroll', { paint: FACE, over: SHORT, pal: { h: 0xe8c870 } }),
    guest5: who('Джек Геллер', 'Джеком Геллером', '#B8C0CC', 0x6b5a3e, 'cup', {
      paint: FACE,
      over: [...SHORT, '..k.k..k.k..'],
      pal: { h: 0xb8b8b8, k: 0x1b1b1b },
    }),
  },
  nrk: {
    foreman: who('Андрей Жданов', 'Андреем Ждановым', '#5F8FEF', 0x3a3a46, 'scroll', {
      paint: TIE, // президент «Зималетто»
      over: SHORT,
      pal: { h: 0x2a1a10, w: 0xf2f2f2, r: 0x9b1b30 },
    }),
    mechanic: who('Катя Пушкарёва', 'Катей Пушкарёвой', '#C08A57', 0x9a8a6a, 'laptop', {
      paint: FACE,
      legs: 0x6b5a4a,
      over: ['', '..hhhhhhhh..', '.h........h.', '.hk.k..k.kh.', 'h..........h', 'h..........h'], // очки и косички
      pal: { h: 0x5a3a24, k: 0x1b1b1b },
    }),
    researcher: who('Коля Зорькин', 'Колей Зорькиным', '#9FB4D8', 0x5f6f8f, 'book', {
      paint: FACE,
      over: [...SHORT, '..k.k..k.k..'],
      pal: { h: 0x3a2a20, k: 0x1b1b1b },
    }),
    scout: who('Малиновский', 'Малиновским', '#E0823D', 0x5a5f6a, 'binoculars', {
      paint: FACE,
      over: ['', '..hhhhhhhh..', '.hh......h..'],
      pal: { h: 0x8a6a4a },
    }),
    writer: who('Вика Клочкова', 'Викой Клочковой', '#EF74A2', 0xef74a2, 'pencil', { paint: FACE, over: LONG, pal: { h: 0xf2d04a } }),
    designer: who('Милко', 'Милко', '#A98BEF', 0x8e5bd9, 'brush', {
      paint: [...FACE, '..pppppppp..'], // модельер: шарф, белый ёжик
      over: ['..h.h.h.h...', '..hhhhhhhh..'],
      pal: { h: 0xf1ecd6, p: 0xef74a2 },
    }),
    apprentice: who('Фёдор', 'Фёдором', '#5FB37A', 0x6b8a5a, 'scroll', { paint: FACE, over: ['', '', '.h........h.'], pal: { h: 0x5a3a24 } }, { hat: 'cap', hatColor: 0x3e8e5a }),
    artist: who('Юлиана', 'Юлианой', '#B8C0CC', 0x34343e, 'palette', { paint: FACE, over: BOB, pal: { h: 0x2a1a10 } }),
    librarian: who('Мария Тропинкина', 'Марией Тропинкиной', '#E0823D', 0xe0823d, 'book', {
      paint: FACE,
      over: ['.h.h.h.h.h..', '.hhhhhhhhhh.', '.h........h.', '.h........h.'],
      pal: { h: 0xb0452a },
    }),
    editor: who('Кира', 'Кирой', '#F2C230', 0xd8dce2, 'pencil', { paint: FACE, over: LONG, pal: { h: 0xe8d08a } }),
    planner: who('Валерий Сергеевич', 'Валерием Сергеевичем', '#5FB37A', 0x4e6b3a, 'megaphone', {
      paint: FACE, // папа Кати, отставной военный
      over: ['', '..hhhhhhhh..', '.h........h.', '', '....mmmm....'],
      pal: { h: 0x8a8a8a, m: 0x5a5a5a },
    }),
    // сабагенты — женсовет и не только
    guest0: who('Шура', 'Шурой', '#5F8FEF', 0x5f8fef, 'tray', { paint: FACE, over: BOB, pal: { h: 0x1b1b1b } }),
    guest1: who('Таня', 'Таней', '#E0823D', 0xe0823d, 'sprout', { paint: FACE, over: CURLS, pal: { h: 0x3a2418 } }),
    guest2: who('Света', 'Светой', '#F2C230', 0x5fb37a, 'pencil', { paint: FACE, over: LONG, pal: { h: 0xf2d04a } }),
    guest3: who('Амура', 'Амурой', '#A98BEF', 0x6b3fa0, 'card', { paint: FACE, over: LONG, pal: { h: 0x1b1b1b } }), // гадает на картах
    guest4: who('Александр Воропаев', 'Александром Воропаевым', '#E5484D', 0x26262e, 'snake', {
      paint: TIE,
      over: SHORT,
      pal: { h: 0xe8d08a, w: 0xf2f2f2, r: 0x1b1b1b },
    }),
    guest5: who('Павел Олегович', 'Павлом Олеговичем', '#B8C0CC', 0x4a4a52, 'scroll', { paint: TIE, over: SHORT, pal: { h: 0xb8b8b8, w: 0xf2f2f2, r: 0x2f4f9f } }),
  },
  dune: {
    foreman: who('Пол Атрейдес', 'Полом Атрейдесом', '#5F8FEF', SUIT, 'crysknife', {
      paint: FACE, // стилсьют, синие глаза от пряности, нож-зуб червя
      eyes: IBAD,
      legs: 0x5a5248,
      over: ['', '..hhhhhhhh..', '.hh.h..h.hh.', '.h........h.'],
      pal: { h: 0x3a2a20 },
    }),
    mechanic: who('Чани', 'Чани', '#E0823D', SUIT, 'thumper', {
      paint: FACE, // тампер: стучит в песок и зовёт червя
      eyes: IBAD,
      legs: 0x5a5248,
      over: CURLS,
      pal: { s: 0xb07850, h: 0x6b2a1a },
    }),
    researcher: who('Леди Джессика', 'леди Джессикой', '#A98BEF', 0x4a4a5c, 'book', {
      paint: FACE, // капюшон Бене Гессерит, бронзовая чёлка
      over: ['', '..cccccccc..', '.cchhhhhhcc.', '.c........c.', '.c........c.', '.c........c.'],
      pal: { c: 0x4a4a5c, h: 0x9a5a2e },
    }),
    scout: who('Барон Харконнен', 'Бароном Харконненом', '#E5484D', 0x34343e, 'goblet', {
      paint: FACE, // лысый, белый, грузный — бока шире тела
      over: ['', '', '', '', 'k..........k', '.k........k.'],
      pal: { s: 0xe8e0d8, k: 0x34343e },
    }),
    writer: who('Ирулан', 'Ирулан', '#F2C230', 0xd8dce2, 'quill', { paint: FACE, over: LONG, pal: { h: 0xe8d08a } }), // пишет летописи
    designer: who('Фейд-Раута', 'Фейд-Раутой', '#B8C0CC', 0x34343e, 'katana', { paint: FACE, pal: { s: 0xf2f0ec } }), // бритый, белый как мел
    apprentice: who('Гурни Халлек', 'Гурни Халлеком', '#5FB37A', 0x3e6b4a, 'lute', { paint: FACE, over: SHORT, pal: { h: 0xb08a5a } }), // балисет
    artist: who('Преподобная мать', 'Преподобной матерью', '#B8C0CC', 0x3a3a44, 'needle', {
      paint: FACE, // гом джаббар
      over: ['', '..cccccccc..', '.cc......cc.', '.c........c.', '.c........c.', '.c........c.'],
      pal: { s: 0xe8dcd0, c: 0x3a3a44 },
    }),
    librarian: who('Лиет Кайнс', 'Лиет Кайнс', '#C08A57', SUIT, 'sprout', { paint: FACE, eyes: IBAD, over: SHORT, pal: { s: 0x7a4a30, h: 0x2a1a10 } }), // мечта о зелёном Арракисе
    editor: who('Дункан Айдахо', 'Дунканом Айдахо', '#9FB4D8', 0x3e6b4a, 'sword', {
      paint: FACE,
      over: [...CURLS, '...hhhhhh...'], // кудри и борода
      pal: { s: 0xc89a70, h: 0x2a1a10 },
    }),
    planner: who('Суфир Хават', 'Суфиром Хаватом', '#E5484D', 0x3e6b4a, 'scroll', {
      paint: FACE, // ментат: седая борода, губы красные от сока сафо
      over: ['', '', '', '', '...ggrrgg...'],
      pal: { s: 0x6b4a30, g: 0xb8b8b8, r: 0xb0302a },
    }),
    // сабагенты
    guest0: who('Стилгар', 'Стилгаром', '#5F8FEF', SUIT, 'crysknife', {
      paint: FACE,
      eyes: IBAD,
      over: ['', '..hhhhhhhh..', '.h........h.', '', '..hhhhhhhh..', '...hhhhhh...'],
      pal: { h: 0x1b1b1b },
    }),
    guest1: who('Герцог Лето', 'герцогом Лето', '#5FB37A', 0x3e6b4a, 'raven', {
      paint: FACE, // ястреб Атрейдесов
      over: ['', '..hhhhhhhh..', '.h........h.', '', '...hhhhhh...'],
      pal: { h: 0x3a3036 },
    }),
    guest2: who('Раббан', 'Раббаном', '#E5484D', 0x34343e, 'greatsword', {
      paint: FACE,
      over: ['', '', '', '', 'k..........k'],
      pal: { s: 0xc89a8a, k: 0x34343e },
    }),
    guest3: who('Шаддам IV', 'Шаддамом IV', '#F2C230', 0xd4a017, 'scroll', { paint: FACE, over: SHORT, pal: { h: 0xb0452a } }),
    guest4: who('Алия', 'Алией', '#9FD3F5', 0x34343e, 'crysknife', { paint: FACE, eyes: IBAD, over: BOB, pal: { h: 0x1b1b1b } }),
    guest5: who('Питер де Фриз', 'Питером де Фризом', '#A98BEF', 0x5a3a5a, 'card', { paint: FACE, over: SHORT, pal: { h: 0x2a1a10 } }),
  },
  southpark: {
    // Шапки — главное: по ним этих четверых узнают с другого конца улицы
    foreman: who('Картман', 'Картманом', '#5FD3F5', 0xd0312d, 'megaphone', {
      paint: FACE,
      legs: 0x8b5a2b,
      over: ['.....yy.....', '..cccccccc..', '.yyyyyyyyyy.', '', 'r..........r', '.r........r.'], // шапка с помпоном, толстые бока
      pal: { c: 0x3fc8d8, y: 0xf2c230, r: 0xd0312d },
    }),
    mechanic: who('Стэн', 'Стэном', '#5F8FEF', 0x8b5a3a, 'lute', {
      paint: FACE, // Guitar Hero
      legs: 0x3b5fbf,
      over: ['.....rr.....', '..bbbbbbbb..', '.rrrrrrrrrr.'],
      pal: { b: 0x3b5fbf, r: 0xd0312d },
    }),
    researcher: who('Кайл', 'Кайлом', '#5FB37A', 0xe0823d, 'book', {
      paint: FACE,
      legs: 0x3e8e5a,
      over: ['', '..gggggggg..', '.gggggggggg.', '.g........g.', '.g........g.'], // зелёная ушанка
      pal: { g: 0x3e9e4a },
    }),
    scout: who('Кенни', 'Кенни', '#E0823D', 0xe8822d, 'binoculars', {
      paint: ['', '', '', '..fssssssf..'], // из капюшона видны одни глаза
      legs: 0xe8822d,
      over: ['', '..oooooooo..', '.o........o.', '.o........o.'],
      pal: { o: 0xe8822d, f: 0x8b5a2b },
    }),
    writer: who('Баттерс', 'Баттерсом', '#9FD3F5', 0x5fc8c0, 'pencil', {
      paint: FACE,
      legs: 0x2e6b45,
      over: ['....hhh.....', '..hhhhhhhh..'],
      pal: { h: 0xf8f0b0 },
    }),
    designer: who(
      'Венди', 'Венди', '#EF74A2', 0xa86ac8, 'brush',
      { paint: FACE, legs: 0x3b4a8c, over: ['', '', '.h........h.', '.h........h.', '.h........h.', '.h........h.'], pal: { h: 0x1b1b1b } },
      { hat: 'beret', hatColor: 0xd05a9a },
    ),
    apprentice: who('Рэнди', 'Рэнди', '#C08A57', 0x5a7aa8, 'sprout', {
      paint: FACE, // ферма «Тегриди»
      over: ['', '..hhhhhhhh..', '.h........h.', '', '....mmmm....'],
      pal: { h: 0x1b1b1b, m: 0x1b1b1b },
    }),
    artist: who('Мистер Гаррисон', 'Мистером Гаррисоном', '#5FB37A', 0x5f8f5a, 'mrhat', { paint: FACE, over: ['', '', '.h........h.'], pal: { h: 0x8b5a2b } }),
    librarian: who('Шеф', 'Шефом', '#E8E0C8', 0xd8dce2, 'tray', {
      paint: FACE,
      over: ['...wwwwww...', '..wwwwwwww..'], // поварской колпак
      pal: { s: 0x6b4a30, w: 0xf2f2f2 },
    }),
    editor: who('Мистер Мэки', 'Мистером Мэки', '#9FB4D8', 0x8fa8c8, 'scroll', {
      paint: TIE,
      legs: 0x5a5f6a,
      over: ['', '..hhhhhhhh..', 'sh........hs', 's..........s'], // голова шире плеч, м'кей
      pal: { h: 0x6b4a2e, w: 0xf2f2f2, r: 0xb0302a },
    }),
    planner: who('Твик', 'Твиком', '#5FB37A', 0x3e8e5a, 'cup', {
      paint: FACE, // кофе, всклокоченный
      over: ['.h..h.h..h..', '..hhhhhhhh..', '.h.h....h.h.'],
      pal: { h: 0xf2d04a },
    }),
    // сабагенты
    guest0: who('Крейг', 'Крейгом', '#5F8FEF', 0x3b5fbf, 'card', {
      paint: FACE,
      over: ['.....yy.....', '..bbbbbbbb..', '.bbbbbbbbbb.', '.b........b.', '.b........b.'], // синяя чульо
      pal: { b: 0x3b5fbf, y: 0xf2c230 },
    }),
    guest1: who('Токен', 'Токеном', '#A98BEF', 0x8e5bd9, 'lute', { paint: FACE, over: SHORT, pal: { s: 0x6b4a30, h: 0x1b1b1b } }),
    guest2: who('Клайд', 'Клайдом', '#E5484D', 0xc0392b, 'sandwich', { paint: FACE, over: SHORT, pal: { h: 0x6b4a2e } }),
    guest3: who('Шейла', 'Шейлой', '#E5484D', 0x5f8f7a, 'megaphone', {
      paint: FACE,
      over: ['..hhhhhhhh..', '.hhhhhhhhhh.', '.h........h.'],
      pal: { h: 0xc0402a },
    }),
    guest4: who('Шэрон', 'Шэрон', '#C08A57', 0x9b4a4a, 'cup', { paint: FACE, over: BOB, pal: { h: 0x6b4a2e } }),
    guest5: who('Джимбо', 'Джимбо', '#E0823D', 0x6b8a5a, 'binoculars', { paint: FACE, over: ['', '', '.h........h.'], pal: { h: 0x8a8a8a } }, { hat: 'cap', hatColor: 0xe0823d }),
  },
  simpsons: {
    // жёлтая кожа у всех — главное, по чему узнают Спрингфилд
    foreman: who('Гомер', 'Гомером', '#F2C230', 0xf2f2f2, 'donut', {
      paint: [...FACE, '...qqqqqq...'], // щетина вокруг рта
      legs: 0x3b6fb0,
      over: ['', '....k.k.....', '.k........k.'], // два волоска
      pal: { s: YELLOW, q: 0xc8a878, k: 0x3a3030 },
    }),
    mechanic: who('Барт', 'Бартом', '#E5484D', 0xe5484d, 'slingshot', {
      paint: FACE,
      legs: 0x3b6fb0,
      over: ['', '..s.s.s.s...'], // ёжик зубцами
      pal: { s: YELLOW },
    }),
    researcher: who('Лиза', 'Лизой', '#E0823D', 0xe0603a, 'sax', {
      paint: FACE,
      legs: YELLOW,
      over: ['..s..s..s...', '.s.ssssss.s.'], // волосы звездой
      pal: { s: YELLOW },
    }),
    scout: who('Мардж', 'Мардж', '#5F8FEF', 0x6fbf5a, 'tray', {
      paint: FACE,
      legs: 0x6fbf5a,
      over: ['...hhhhhh...', '..hhhhhhhh..', '..hhhhhhhh..'], // синяя башня
      pal: { s: YELLOW, h: 0x3b6fdf },
    }),
    writer: who('Мистер Бёрнс', 'мистером Бёрнсом', '#5FB37A', 0x5a6a4a, 'scroll', {
      paint: FACE,
      over: ['', '', '.g........g.'],
      pal: { s: 0xe8d870, g: 0xb8b8b8 },
    }),
    designer: who('Милхаус', 'Милхаусом', '#5F8FEF', 0xc8504a, 'card', {
      paint: FACE,
      legs: 0x5a5a6a,
      over: ['', '..hhhhhhhh..', '.h........h.', '..k.k..k.k..'], // синие волосы, очки
      pal: { s: YELLOW, h: 0x4a5fbf, k: 0x1b1b1b },
    }),
    apprentice: who('Мо', 'Мо', '#B8C0CC', 0x5a5f6a, 'beer', { paint: FACE, over: ['', '..hhhhhhhh..', '.h........h.'], pal: { s: YELLOW, h: 0x8a8a8a } }),
    artist: who('Красти', 'Красти', '#5FB37A', 0x8e5bd9, 'mic', {
      paint: ['', '', '..wwwwwwww..', '..wwwrrwww..'], // грим клоуна, красный нос
      over: ['', '.g........g.', 'gg........gg', '.g........g.'],
      pal: { w: 0xf2f2f2, r: 0xe5484d, g: 0x3fae5a },
    }),
    librarian: who('Фландерс', 'Фландерсом', '#5FB37A', 0x3e8e5a, 'book', {
      paint: FACE,
      over: ['', '..hhhhhhhh..', '.h........h.', '..k.k..k.k..', '....hhhh....'], // очки и усы
      pal: { s: YELLOW, h: 0x6b4a2e, k: 0x1b1b1b },
    }),
    editor: who('Скиннер', 'Скиннером', '#9FB4D8', 0x6b5a4a, 'pencil', {
      paint: TIE,
      over: ['', '..hhhhhhhh..', '.hh......hh.'],
      pal: { s: YELLOW, h: 0x9a9a9a, w: 0xf2f2f2, r: 0x2f4f9f },
    }),
    planner: who('Мэгги', 'Мэгги', '#5F8FEF', 0x5fb3e8, 'pacifier', {
      paint: FACE,
      legs: 0x5fb3e8,
      over: ['....bb......', '..s.s.s.s...'], // бантик и ёжик
      pal: { s: YELLOW, b: 0x3b6fdf },
    }),
    // сабагенты
    guest0: who('Барни Гамбл', 'Барни Гамблом', '#C08A57', 0x8b6a4a, 'beer', {
      paint: [...FACE, '...qqqqqq...'],
      over: ['', '..hhhhhhhh..', '.hh......hh.'],
      pal: { s: YELLOW, h: 0x6b4a2e, q: 0xc8a878 },
    }),
    guest1: who('Шеф Виггам', 'шефом Виггамом', '#5F8FEF', 0x3b5fbf, 'donut', { paint: FACE, over: ['', '', '.h........h.'], pal: { s: YELLOW, h: 0x3a3030 } }, { hat: 'cap', hatColor: 0x2f4f9f }),
    guest2: who('Ральф', 'Ральфом', '#9FD3F5', 0x5fb3e8, 'pencil', { paint: FACE, over: ['', '..hhhhhhhh..'], pal: { s: YELLOW, h: 0xb08a5a } }),
    guest3: who('Сайдшоу Боб', 'Сайдшоу Бобом', '#E5484D', 0x3e8e5a, 'staff', {
      paint: FACE, // пальма на голове; грабли
      over: ['h.hh.hh.h...', '.hhhhhhhhh..', '.h........h.'],
      pal: { s: YELLOW, h: 0xc0402a },
    }),
    guest4: who('Смитерс', 'Смитерсом', '#9FB4D8', 0x5a6f8f, 'scroll', {
      paint: TIE,
      over: [...SHORT, '..k.k..k.k..'],
      pal: { s: YELLOW, h: 0x3a3030, k: 0x1b1b1b, w: 0xf2f2f2, r: 0x2f4f9f },
    }),
    guest5: who('Нельсон', 'Нельсоном', '#C08A57', 0x6b8a5a, 'bat', { paint: FACE, over: ['', '..hhhhhhhh..'], pal: { s: YELLOW, h: 0x8b5a2b } }),
  },
  familyguy: {
    foreman: who('Питер', 'Питером', '#5FB37A', 0xf2f2f2, 'beer', {
      paint: FACE,
      legs: 0x3e8e5a,
      over: ['', '..hhhhhhhh..', '.h........h.', '..k.k..k.k..'], // очки, белая рубашка, зелёные брюки
      pal: { h: 0x5a3a24, k: 0x1b1b1b },
    }),
    mechanic: who('Стьюи', 'Стьюи', '#E5484D', 0xe5484d, 'blaster', {
      paint: [...FACE, '..yyyyyyyy..'], // жёлтая рубашка под красным комбинезоном
      legs: 0xe5484d,
      over: ['', '...hhhhhh...', '.s........s.', 'ss........ss'], // голова-мяч для регби
      pal: { h: 0x8b6a3a, y: 0xf2d04a },
    }),
    researcher: who('Брайан', 'Брайаном', '#E8E0C8', 0xf2f2f2, 'martini', {
      paint: ['', '', '', '.....KK.....', '..rrrrrrrr..'], // белый пёс: чёрный нос, красный ошейник
      legs: 0xf2f2f2,
      pal: { r: 0xe5484d },
    }),
    scout: who('Лоис', 'Лоис', '#E0823D', 0x5fb37a, 'tray', {
      paint: FACE,
      legs: 0xb08a5a,
      over: ['', '..hhhhhhhh..', '.hhhhhhhhhh.', '.h........h.'],
      pal: { h: 0xd2501e },
    }),
    writer: who('Мег', 'Мег', '#EF74A2', 0xe0607a, 'pencil', {
      paint: FACE, // розовая шапка, очки; пишет в дневник
      legs: 0x3b4a8c,
      over: ['...pppppp...', '..pppppppp..', '.h........h.', '.hk.k..k.kh.', '.h........h.'],
      pal: { p: 0xef74a2, h: 0x6b4a2e, k: 0x1b1b1b },
    }),
    designer: who('Куагмир', 'Куагмиром', '#E5484D', 0xc0392b, 'card', { paint: FACE, over: ['', '..hhhhhhhh..', '.hh......hh.'], pal: { h: 0x3a3036 } }), // гавайка
    apprentice: who('Кливленд', 'Кливлендом', '#C08A57', 0x5a6f8f, 'cup', {
      paint: FACE,
      over: ['', '..hhhhhhhh..', '.h........h.', '', '...mmmmmm...'],
      pal: { s: 0x6b4a30, h: 0x3a3036, m: 0x3a3036 },
    }),
    artist: who('Крис', 'Крисом', '#5F8FEF', 0x3b6fb0, 'palette', { paint: FACE, over: ['', '', '.h........h.'], pal: { h: 0xf2d04a } }, { hat: 'cap', hatColor: 0xe5484d }),
    librarian: who('Джо', 'Джо', '#5F8FEF', 0x2f4f9f, 'megaphone', { paint: FACE, over: ['', '', '.h........h.'], pal: { h: 0x6b4a2e } }, { hat: 'cap', hatColor: 0x2f4f9f }),
    editor: who('Том Такер', 'Томом Такером', '#B8C0CC', 0x5a5f6a, 'mic', { paint: TIE, over: SHORT, pal: { h: 0x8a8a8a, w: 0xf2f2f2, r: 0xb0302a } }),
    planner: who('Смерть', 'Смертью', '#B8C0CC', 0x3a3a44, 'scythe', {
      paint: ['', '', '..wwwwwwww..', '..wwwwwwww..'], // череп в капюшоне
      over: ['', '..cccccccc..', '.cc......cc.', '.c........c.', '.c........c.', '.c........c.'],
      pal: { w: 0xe8e8e8, c: 0x3a3a44 },
    }),
    // сабагенты
    guest0: who('Цыплёнок Эрни', 'цыплёнком Эрни', '#F2C230', 0xf2d04a, 'bat', {
      legs: 0xe0823d, // гребешок и клюв
      over: ['....rr......', '...rrrr.....', '', '.....oo.....'],
      pal: { r: 0xe5484d, o: 0xe0823d },
    }),
    guest1: who('Адам Вест', 'Адамом Вестом', '#9FB4D8', 0x3a3a46, 'batarang', { paint: TIE, over: SHORT, pal: { h: 0x5a3a24, w: 0xf2f2f2, r: 0x2f4f9f } }), // мэр, бывший Бэтмен
    guest2: who('Морт', 'Мортом', '#B8C0CC', 0x8a8a7a, 'scroll', { paint: FACE, over: [...SHORT, '..k.k..k.k..'], pal: { h: 0x5a4a3a, k: 0x1b1b1b } }),
    guest3: who('Бонни', 'Бонни', '#EF74A2', 0xef74a2, 'cup', { paint: FACE, over: BOB, pal: { h: 0x6b4a2e } }),
    guest4: who('Картер', 'Картером', '#F2C230', 0x3a3a46, 'card', { paint: TIE, over: ['', '', '.h........h.'], pal: { h: 0xe8e8e8, w: 0xf2f2f2, r: 0xb0302a } }),
    guest5: who('Брюс', 'Брюсом', '#5FB37A', 0x5f8f5a, 'cup', {
      paint: FACE,
      over: ['', '..hhhhhhhh..', '.h........h.', '', '....mmmm....'],
      pal: { h: 0x3a2a20, m: 0x3a2a20 },
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
  dc: [
    ['запускает: ', 'разгоняет: '],
    ['набирает команду', 'надевает плащ'],
    ['читает: ', 'вытягивает правду: '],
    ['ищет, что прочитать', 'раскручивает лассо'],
    ['ищет «', 'выпытывает «'],
    ['ищет файлы: ', 'выпытывает файлы: '],
    ['правит: ', 'правит трезубцем: '],
    ['правит блокнот: ', 'правит трезубцем: '],
    ['пишет правку', 'точит трезубец'],
    ['пишет: ', 'оставляет карту: '],
    ['пишет файл', 'тасует колоду'],
    ['гуглит: ', 'обежал мир за: '],
    ['открывает: ', 'метнулся в: '],
    ['составляет запрос', 'разгоняется'],
    ['раздаёт задачу: ', 'зажигает бэт-сигнал: '],
    ['пишет задание', 'готовит бэт-сигнал'],
    ['достаёт инструкцию: ', 'загружает протокол: '],
    ['ищет инструмент', 'сканирует базы'],
    ['обновляет план', 'сверяет список дел, сэр'],
    ['составляет план', 'готовит план, сэр'],
    ['ждёт ответа от вас', 'ждёт распоряжений, сэр'],
    ['готовит макет', 'раскрашивает макет'],
    ['готовит генерацию', 'заряжает кольцо'],
    ['готовится', 'надевает маску'],
    ['читает задачу', 'изучает дело'],
    ['обдумывает результат', 'думает в Бэтпещере'],
    ['смотрит за командой', 'смотрит с крыши'],
    ['получил задание', 'увидел бэт-сигнал'],
    ['сдал работу', 'Готэм спасён'],
    ['уходит домой', 'исчезает в ночи'],
    ['ест курочку', 'ест пиццу'],
    ['пьёт кофе', 'пьёт чай от Альфреда'],
    ['читает газету', 'читает «Дейли Плэнет»'],
    ['листает ленту', 'листает новости Готэма'],
    ['играет в приставку', 'сидит за бэт-компьютером'],
    ['летает на шарике', 'парит над Метрополисом'],
    ['поливает цветок', 'поливает цветы Плюща'],
    ['медитирует', 'медитирует на Фемискире'],
    ['качает гантели', 'жмёт грузовик'],
    ['жонглирует', 'жонглирует бэтарангами'],
    ['рисует картину', 'рисует бэт-символ'],
    ['танцует', 'танцует на лестнице'],
    ['моется в душе', 'отмывается после Готэма'],
    ['гуляет', 'патрулирует Готэм'],
    ['слушает музыку', 'слушает джаз'],
    ['болтает с ', 'совещается с '],
    ['играет в мяч с ', 'кидает бэтаранг с '],
  ],
  got: [
    ['запускает: ', 'рубит: '],
    ['набирает команду', 'обнажает Длинный Коготь'],
    ['читает: ', 'читает за вином: '],
    ['ищет, что прочитать', 'наливает вина'],
    ['ищет «', 'выведывает «'],
    ['ищет файлы: ', 'выведывает файлы: '],
    ['правит: ', 'отсекает лишнее: '],
    ['правит блокнот: ', 'отсекает лишнее: '],
    ['пишет правку', 'точит Лёд'],
    ['пишет: ', 'пишет указ: '],
    ['пишет файл', 'ставит печать'],
    ['гуглит: ', 'выслеживает: '],
    ['открывает: ', 'пробирается в: '],
    ['составляет запрос', 'меняет лицо'],
    ['раздаёт задачу: ', 'шлёт ворона: '],
    ['пишет задание', 'созывает знамёна'],
    ['достаёт инструкцию: ', 'смотрит глазами ворона: '],
    ['ищет инструмент', 'заглядывает в прошлое'],
    ['обновляет план', 'плетёт интригу'],
    ['составляет план', 'слушает пташек'],
    ['ждёт ответа от вас', 'ждёт ответа, милорд'],
    ['готовит макет', 'вышивает макет'],
    ['готовит генерацию', 'смотрит в пламя'],
    ['готовится', 'седлает коня'],
    ['читает задачу', 'слушает совет'],
    ['обдумывает результат', 'держит совет'],
    ['смотрит за командой', 'смотрит за войском'],
    ['получил задание', 'получил ворона'],
    ['сдал работу', 'долг исполнен'],
    ['уходит домой', 'уходит за Стену'],
    ['ест курочку', 'грызёт жареную ногу'],
    ['пьёт кофе', 'пьёт вино'],
    ['читает газету', 'читает свиток'],
    ['листает ленту', 'читает письмо с вороном'],
    ['играет в приставку', 'играет в кайвассу'],
    ['летает на шарике', 'летает на драконе'],
    ['поливает цветок', 'сидит у чардрева'],
    ['медитирует', 'молится Старым богам'],
    ['качает гантели', 'тренируется с мечом'],
    ['жонглирует', 'жонглирует яйцами драконов'],
    ['рисует картину', 'вышивает гобелен'],
    ['танцует', 'танцует на пиру'],
    ['моется в душе', 'моется в горячем источнике'],
    ['гуляет', 'обходит Стену'],
    ['слушает музыку', 'слушает «Рейны из Кастамере»'],
    ['играет на гитаре', 'играет на лютне'],
    ['болтает с ', 'плетёт интриги с '],
    ['играет в мяч с ', 'фехтует с '],
  ],
  twilight: [
    ['запускает: ', 'заводит: '],
    ['набирает команду', 'чинит мотоцикл'],
    ['читает: ', 'читает мысли: '],
    ['ищет, что прочитать', 'прислушивается к мыслям'],
    ['ищет «', 'ловит мысли «'],
    ['ищет файлы: ', 'ловит мысли: '],
    ['правит: ', 'доводит до идеала: '],
    ['правит блокнот: ', 'доводит до идеала: '],
    ['пишет правку', 'смотрится в зеркало'],
    ['пишет: ', 'выписывает рецепт: '],
    ['пишет файл', 'надевает халат'],
    ['гуглит: ', 'берёт след: '],
    ['открывает: ', 'выслеживает: '],
    ['составляет запрос', 'принюхивается'],
    ['раздаёт задачу: ', 'просит Калленов: '],
    ['пишет задание', 'собирает Калленов'],
    ['достаёт инструкцию: ', 'листает архив Вольтури: '],
    ['ищет инструмент', 'берёт за руку и узнаёт всё'],
    ['обновляет план', 'обновляет сводку шерифа'],
    ['составляет план', 'составляет протокол'],
    ['ждёт ответа от вас', 'ждёт ответа, Беллз'],
    ['готовит макет', 'подбирает макету наряд'],
    ['готовит генерацию', 'нагоняет настроение'],
    ['готовится', 'выходит из тени'],
    ['читает задачу', 'слушает Карлайла'],
    ['обдумывает результат', 'думает о вечности'],
    ['смотрит за командой', 'смотрит за кланом'],
    ['получил задание', 'почуял задание'],
    ['сдал работу', 'сделано навеки'],
    ['уходит домой', 'исчезает в лесу'],
    ['спит', 'притворяется спящим'],
    ['ест курочку', 'ест яблоко'],
    ['пьёт кофе', 'пьёт кровь пумы'],
    ['читает газету', 'читает «Грозовой перевал»'],
    ['листает ленту', 'переписывается с Элис'],
    ['играет в приставку', 'режется в приставку с Эмметом'],
    ['летает на шарике', 'прыгает по верхушкам елей'],
    ['поливает цветок', 'поливает цветы на поляне'],
    ['медитирует', 'слушает мысли Форкса'],
    ['качает гантели', 'меряется силой с Эмметом'],
    ['жонглирует', 'жонглирует яблоками'],
    ['рисует картину', 'рисует эскиз платья'],
    ['танцует', 'танцует на выпускном'],
    ['моется в душе', 'сверкает на солнце'],
    ['гуляет', 'бродит по лесам Форкса'],
    ['слушает музыку', 'слушает Muse'],
    ['играет на гитаре', 'играет колыбельную Беллы'],
    ['болтает с ', 'шепчется с '],
    ['играет в мяч с ', 'играет в бейсбол с '],
  ],
  witcher: [
    ['запускает: ', 'рассекает: '],
    ['набирает команду', 'точит Ласточку'],
    ['читает: ', 'листает гримуар: '],
    ['ищет, что прочитать', 'открывает гримуар'],
    ['ищет «', 'чует «'],
    ['ищет файлы: ', 'идёт по следу: '],
    ['правит: ', 'перековывает: '],
    ['правит блокнот: ', 'перековывает: '],
    ['пишет правку', 'раздувает горн'],
    ['пишет: ', 'вписывает в бестиарий: '],
    ['пишет файл', 'макает перо'],
    ['гуглит: ', 'собирает сплетни: '],
    ['открывает: ', 'заглядывает в корчму: '],
    ['составляет запрос', 'настраивает лютню'],
    ['раздаёт задачу: ', 'берёт заказ: '],
    ['пишет задание', 'торгуется о награде'],
    ['достаёт инструкцию: ', 'сверяется с бестиарием: '],
    ['ищет инструмент', 'перебирает травы'],
    ['обновляет план', 'шлёт донесение'],
    ['составляет план', 'плетёт заговор'],
    ['ждёт ответа от вас', 'ждёт донесения'],
    ['готовит макет', 'наводит иллюзию'],
    ['готовит генерацию', 'плетёт огненные чары'],
    ['готовится', 'пьёт эликсир'],
    ['читает задачу', 'читает объявление о заказе'],
    ['обдумывает результат', 'медитирует у костра'],
    ['смотрит за командой', 'хмыкает'],
    ['получил задание', 'взял заказ'],
    ['сдал работу', 'чудовище убито'],
    ['уходит домой', 'уходит в портал'],
    ['спит', 'спит у костра'],
    ['ест курочку', 'ест похлёбку в корчме'],
    ['пьёт кофе', 'пьёт краснолюдский спирт'],
    ['читает газету', 'читает доску объявлений'],
    ['листает ленту', 'читает письмо от Йеннифэр'],
    ['играет в приставку', 'играет в гвинт'],
    ['летает на шарике', 'летает на драконе Борхе'],
    ['поливает цветок', 'собирает травы'],
    ['качает гантели', 'фехтует с чучелом'],
    ['жонглирует', 'жонглирует бомбами'],
    ['рисует картину', 'чертит знаки'],
    ['танцует', 'танцует на балу в Туссенте'],
    ['моется в душе', 'отмокает в бадье'],
    ['гуляет', 'бродит по Велену'],
    ['слушает музыку', 'напевает «Ведьмаку заплатите»'],
    ['играет на гитаре', 'играет на лютне'],
    ['болтает с ', 'хмыкает с '],
    ['играет в мяч с ', 'фехтует с '],
  ],
  himym: [
    ['запускает: ', 'чертит: '],
    ['набирает команду', 'разворачивает чертежи'],
    ['читает: ', 'изучает дело: '],
    ['ищет, что прочитать', 'листает свод законов'],
    ['ищет «', 'ищет прецедент «'],
    ['ищет файлы: ', 'ищет прецеденты: '],
    ['правит: ', 'сводит тату: '],
    ['правит блокнот: ', 'сводит тату: '],
    ['пишет правку', 'настраивает лазер'],
    ['пишет: ', 'записывает: '],
    ['пишет файл', 'раскрывает жёлтый зонт'],
    ['гуглит: ', 'ведёт репортаж: '],
    ['открывает: ', 'выходит в эфир: '],
    ['составляет запрос', 'готовится к эфиру'],
    ['раздаёт задачу: ', 'бросает вызов: '],
    ['пишет задание', 'кричит «Костюмы надеть!»'],
    ['достаёт инструкцию: ', 'сверяется с Кодексом братана: '],
    ['ищет инструмент', 'листает Кодекс братана'],
    ['обновляет план', 'печёт по рецепту'],
    ['составляет план', 'расписывает рецепт'],
    ['ждёт ответа от вас', 'ждёт ответа — подождите-подождите'],
    ['готовит макет', 'рисует эскиз'],
    ['готовит генерацию', 'наливает за счёт заведения'],
    ['готовится', 'надевает костюм'],
    ['читает задачу', 'слушает Теда'],
    ['обдумывает результат', 'ЛЕГЕН — подождите…'],
    ['смотрит за командой', 'смотрит из кабинки в «Макларенс»'],
    ['получил задание', 'вызов принят'],
    ['сдал работу', '…ДАРНО!'],
    ['уходит домой', 'ловит такси'],
    ['спит', 'спит на диване Теда'],
    ['ест курочку', 'ест лучший бургер Нью-Йорка'],
    ['пьёт кофе', 'пьёт пиво в «Макларенс»'],
    ['читает газету', 'читает Пособие'],
    ['листает ленту', 'смотрит клипы Робин Спарклз'],
    ['играет в приставку', 'играет в лазертаг'],
    ['летает на шарике', 'витает в облаках'],
    ['поливает цветок', 'поливает фикус'],
    ['медитирует', 'мечтает о будущей жене'],
    ['качает гантели', 'качается к свадьбе'],
    ['жонглирует', 'жонглирует свиданиями'],
    ['рисует картину', 'рисует, как Лили'],
    ['танцует', 'танцует под Робин Спарклз'],
    ['моется в душе', 'моется перед свиданием'],
    ['гуляет', 'гуляет под жёлтым зонтом'],
    ['слушает музыку', 'поёт «500 миль»'],
    ['играет на гитаре', 'играет на басу'],
    ['болтает с ', 'травит байки с '],
    ['играет в мяч с ', 'спорит на пощёчину с '],
  ],
  friends: [
    ['запускает: ', 'обрабатывает данные: '],
    ['набирает команду', 'шутит, чтобы не нервничать'],
    ['читает: ', 'изучает окаменелость: '],
    ['ищет, что прочитать', 'ищет кости динозавра'],
    ['ищет «', 'раскапывает «'],
    ['ищет файлы: ', 'раскапывает: '],
    ['правит: ', 'переписывает: '],
    ['правит блокнот: ', 'переписывает: '],
    ['пишет правку', 'путает имена'],
    ['пишет: ', 'учит роль: '],
    ['пишет файл', 'подмигивает: «Как дела?»'],
    ['гуглит: ', 'гадает: '],
    ['открывает: ', 'видит ауру: '],
    ['составляет запрос', 'настраивает гитару'],
    ['раздаёт задачу: ', 'наводит порядок: '],
    ['пишет задание', 'раскладывает по цветам'],
    ['достаёт инструкцию: ', 'надевает очки: '],
    ['ищет инструмент', 'поправляет усы'],
    ['обновляет план', 'прыгает по полкам'],
    ['составляет план', 'прячет ключи'],
    ['ждёт ответа от вас', 'ждёт банан'],
    ['готовит макет', 'подбирает образ'],
    ['готовит генерацию', 'хохочет: «О. Боже. Мой!»'],
    ['готовится', 'берёт кофе'],
    ['читает задачу', 'слушает Монику'],
    ['обдумывает результат', 'проверяет, всё ли чисто'],
    ['смотрит за командой', 'пересчитывает полотенца'],
    ['получил задание', 'зашёл в «Central Perk»'],
    ['сдал работу', 'всё по местам'],
    ['уходит домой', 'уходит через коридор к себе'],
    ['спит', 'спит на диване в «Central Perk»'],
    ['ест курочку', 'ест и не делится едой'],
    ['пьёт кофе', 'пьёт кофе в «Central Perk»'],
    ['читает газету', 'читает «Маленьких женщин»'],
    ['листает ленту', 'смотрит «Спасателей Малибу»'],
    ['играет в приставку', 'играет в настольный футбол'],
    ['летает на шарике', 'летит в Лондон'],
    ['поливает цветок', 'поливает цветы'],
    ['медитирует', 'медитирует, как Фиби'],
    ['качает гантели', 'тащит диван: «Поворачивай!»'],
    ['жонглирует', 'жонглирует апельсинами'],
    ['рисует картину', 'рисует на двери'],
    ['танцует', 'танцует «Рутину»'],
    ['моется в душе', 'моется, пока есть горячая вода'],
    ['гуляет', 'гуляет по Гринвич-Виллидж'],
    ['слушает музыку', 'слушает «Вонючего кота»'],
    ['играет на гитаре', 'поёт «Вонючего кота»'],
    ['болтает с ', 'сидит на диване с '],
    ['играет в мяч с ', 'играет в «Кубок Геллеров» с '],
  ],
  nrk: [
    ['запускает: ', 'сводит баланс: '],
    ['набирает команду', 'поправляет очки'],
    ['читает: ', 'проверяет отчёт: '],
    ['ищет, что прочитать', 'ищет в отчётах'],
    ['ищет «', 'ищет в отчётах «'],
    ['ищет файлы: ', 'ищет в отчётах: '],
    ['правит: ', 'переделывает: '],
    ['правит блокнот: ', 'переделывает: '],
    ['пишет правку', 'ревнует Андрея'],
    ['пишет: ', 'печатает: '],
    ['пишет файл', 'красит ногти'],
    ['гуглит: ', 'наводит справки: '],
    ['открывает: ', 'заглядывает в: '],
    ['составляет запрос', 'строит глазки'],
    ['раздаёт задачу: ', 'зовёт Катю: '],
    ['пишет задание', 'зовёт Катю'],
    ['достаёт инструкцию: ', 'созывает женсовет: '],
    ['ищет инструмент', 'собирает сплетни'],
    ['обновляет план', 'наводит порядок'],
    ['составляет план', 'составляет распорядок'],
    ['ждёт ответа от вас', 'ждёт Катю к ужину'],
    ['готовит макет', 'кроит коллекцию'],
    ['готовит генерацию', 'устраивает фотосессию'],
    ['готовится', 'входит в «Зималетто»'],
    ['читает задачу', 'слушает Андрея Палыча'],
    ['обдумывает результат', 'листает отчёт Кати'],
    ['смотрит за командой', 'смотрит из кабинета'],
    ['получил задание', 'получил поручение'],
    ['сдал работу', '«Зималетто» спасено'],
    ['уходит домой', 'едет домой на метро'],
    ['спит', 'дремлет над отчётом'],
    ['ест курочку', 'ест мамины пирожки'],
    ['пьёт кофе', 'пьёт кофе с женсоветом'],
    ['читает газету', 'пишет в дневник'],
    ['листает ленту', 'сплетничает по телефону'],
    ['играет в приставку', 'раскладывает пасьянс'],
    ['летает на шарике', 'витает в облаках'],
    ['поливает цветок', 'поливает фикус в приёмной'],
    ['медитирует', 'считает до десяти'],
    ['качает гантели', 'таскает рулоны ткани'],
    ['жонглирует', 'жонглирует отчётами'],
    ['рисует картину', 'рисует эскиз платья'],
    ['танцует', 'танцует на корпоративе'],
    ['моется в душе', 'прихорашивается'],
    ['гуляет', 'бегает по коридорам'],
    ['слушает музыку', 'слушает Савичеву'],
    ['играет на гитаре', 'поёт под гитару'],
    ['болтает с ', 'сплетничает с '],
    ['играет в мяч с ', 'перекидывается записками с '],
  ],
  dune: [
    ['запускает: ', 'ставит тампер: '],
    ['набирает команду', 'вбивает тампер в песок'],
    ['читает: ', 'видит насквозь: '],
    ['ищет, что прочитать', 'применяет Голос'],
    ['ищет «', 'ищет пряность «'],
    ['ищет файлы: ', 'ищет пряность: '],
    ['правит: ', 'правит клинком: '],
    ['правит блокнот: ', 'правит клинком: '],
    ['пишет правку', 'точит клинок'],
    ['пишет: ', 'пишет летопись: '],
    ['пишет файл', 'открывает летопись'],
    ['гуглит: ', 'парит над: '],
    ['открывает: ', 'вплывает в: '],
    ['составляет запрос', 'включает суспензоры'],
    ['раздаёт задачу: ', 'ведёт федайкинов: '],
    ['пишет задание', 'собирает федайкинов'],
    ['достаёт инструкцию: ', 'сверяется с картой: '],
    ['ищет инструмент', 'ищет следы воды'],
    ['обновляет план', 'просчитывает ходы'],
    ['составляет план', 'входит в транс ментата'],
    ['ждёт ответа от вас', 'ждёт вашего слова, герцог'],
    ['готовит макет', 'готовит поединок'],
    ['готовит генерацию', 'достаёт гом джаббар'],
    ['готовится', 'надевает стилсьют'],
    ['читает задачу', 'слушает Стилгара'],
    ['обдумывает результат', 'видит будущее'],
    ['смотрит за командой', 'смотрит на дюны'],
    ['получил задание', 'услышал тампер'],
    ['сдал работу', 'пряность течёт'],
    ['уходит домой', 'уходит в сиетч'],
    ['спит', 'спит в сиетче'],
    ['ест курочку', 'ест лепёшку с пряностью'],
    ['пьёт кофе', 'пьёт кофе с пряностью'],
    ['читает газету', 'читает летописи Ирулан'],
    ['листает ленту', 'слушает пророчества'],
    ['играет в приставку', 'дразнит песчаную форель'],
    ['летает на шарике', 'седлает червя'],
    ['поливает цветок', 'поливает росток по капле'],
    ['медитирует', 'читает литанию от страха'],
    ['качает гантели', 'тренируется с Гурни'],
    ['жонглирует', 'жонглирует пряностью'],
    ['рисует картину', 'рисует карту дюн'],
    ['танцует', 'идёт песчаной походкой'],
    ['моется в душе', 'ловит каплю воды'],
    ['гуляет', 'бродит по дюнам'],
    ['слушает музыку', 'слушает балисет'],
    ['играет на гитаре', 'играет на балисете'],
    ['болтает с ', 'делится водой с '],
    ['играет в мяч с ', 'спаррингует с '],
  ],
  southpark: [
    ['запускает: ', 'мутит: '],
    ['набирает команду', 'собирает пацанов'],
    ['читает: ', 'вникает: '],
    ['ищет, что прочитать', 'готовит речь «Я понял…»'],
    ['правит: ', "переписывает, м'кей: "],
    ['правит блокнот: ', "переписывает, м'кей: "],
    ['пишет правку', "поправляет галстук, м'кей"],
    ['пишет: ', 'строчит: '],
    ['пишет файл', 'надевает шлем Хаоса'],
    ['гуглит: ', 'мычит в капюшон: '],
    ['открывает: ', 'лезет в: '],
    ['составляет запрос', 'затягивает капюшон'],
    ['раздаёт задачу: ', 'уважайте мою власть: '],
    ['пишет задание', 'строит коварный план'],
    ['достаёт инструкцию: ', 'берёт рецепт: '],
    ['ищет инструмент', 'помешивает соус'],
    ['обновляет план', 'кричит «Аргх!»'],
    ['составляет план', 'пьёт десятый кофе'],
    ['ждёт ответа от вас', 'ждёт ответа — Аргх!'],
    ['готовит макет', 'поправляет берет'],
    ['готовит генерацию', 'спорит с Мистером Шляпой'],
    ['готовится', 'надевает шапку'],
    ['читает задачу', 'слушает Картмана'],
    ['обдумывает результат', 'думает: «Чёрт, чувак»'],
    ['смотрит за командой', 'ест сырные шарики'],
    ['получил задание', 'сел в школьный автобус'],
    ['сдал работу', 'круто, чувак'],
    ['уходит домой', 'идёт домой по сугробам'],
    ['спит', 'спит на уроке'],
    ['ест курочку', 'ест сырные шарики'],
    ['пьёт кофе', 'пьёт кофе, как Твик'],
    ['читает газету', 'читает комиксы'],
    ['листает ленту', 'смотрит Терренса и Филлипа'],
    ['играет в приставку', 'играет в «Палку истины»'],
    ['летает на шарике', 'летит, как Енот'],
    ['поливает цветок', 'поливает ферму Тегриди'],
    ['медитирует', "успокаивается, м'кей"],
    ['качает гантели', 'тренируется к вышибалам'],
    ['жонглирует', 'жонглирует снежками'],
    ['рисует картину', 'рисует на доске'],
    ['танцует', 'танцует, как Баттерс'],
    ['моется в душе', 'моется — мама заставила'],
    ['гуляет', 'гуляет по Саут-Парку'],
    ['слушает музыку', 'слушает Лорд'],
    ['играет на гитаре', 'играет в Guitar Hero'],
    ['болтает с ', 'спорит с '],
    ['играет в мяч с ', 'кидается снежками с '],
  ],
  simpsons: [
    ['запускает: ', 'хулиганит: '],
    ['набирает команду', 'пишет на доске сто раз'],
    ['читает: ', 'штудирует: '],
    ['ищет, что прочитать', 'дует в саксофон'],
    ['правит: ', 'проверяет: '],
    ['правит блокнот: ', 'проверяет: '],
    ['пишет правку', 'заполняет журнал'],
    ['пишет: ', 'подписывает: '],
    ['пишет файл', 'сводит пальцы: «Превосходно»'],
    ['гуглит: ', 'бурчит «Хммм»: '],
    ['открывает: ', 'заглядывает в: '],
    ['составляет запрос', 'поправляет причёску'],
    ['раздаёт задачу: ', 'Д’оу, поручает: '],
    ['пишет задание', 'думает о пончиках'],
    ['достаёт инструкцию: ', 'хай-диддли-хо, берёт: '],
    ['ищет инструмент', 'ищет-диддли инструмент'],
    ['обновляет план', 'молча сосёт соску'],
    ['составляет план', 'ползает по ковру'],
    ['ждёт ответа от вас', 'ждёт ответа — чмок-чмок'],
    ['готовит макет', 'поправляет очки'],
    ['готовит генерацию', 'кричит «Эй-эй, детишки!»'],
    ['готовится', 'надевает каску'],
    ['читает задачу', 'слушает Гомера'],
    ['обдумывает результат', 'чешет лысину'],
    ['смотрит за командой', 'ест пончик за пультом'],
    ['получил задание', 'получил задание — Д’оу!'],
    ['сдал работу', 'Ву-ху!'],
    ['уходит домой', 'уходит в таверну Мо'],
    ['спит', 'спит на диване'],
    ['ест курочку', 'ест пончик: «Ммм, пончики»'],
    ['пьёт кофе', 'пьёт «Дафф»'],
    ['читает газету', 'читает комиксы'],
    ['листает ленту', 'смотрит «Щекотку и Царапку»'],
    ['играет в приставку', 'играет в «Боунсторм»'],
    ['поливает цветок', 'поливает газон Фландерса'],
    ['медитирует', 'пускает слюни: «Ммм…»'],
    ['качает гантели', 'качает пресс на диване'],
    ['жонглирует', 'жонглирует пончиками'],
    ['рисует картину', 'пишет «Эль Барто»'],
    ['танцует', 'танцует в таверне Мо'],
    ['моется в душе', 'поёт в душе'],
    ['гуляет', 'гуляет по Спрингфилду'],
    ['слушает музыку', 'слушает блюз'],
    ['играет на гитаре', 'поёт с «Би Шарпс»'],
    ['болтает с ', 'треплется с '],
    ['играет в мяч с ', 'играет в боулинг с '],
  ],
  familyguy: [
    ['запускает: ', 'стреляет лучом: '],
    ['набирает команду', 'строит машину времени'],
    ['читает: ', 'читает с мартини: '],
    ['ищет, что прочитать', 'наливает мартини'],
    ['правит: ', 'правит суфлёр: '],
    ['правит блокнот: ', 'правит суфлёр: '],
    ['пишет правку', 'репетирует улыбку'],
    ['пишет: ', 'пишет в дневник: '],
    ['пишет файл', 'слышит «Заткнись, Мег»'],
    ['гуглит: ', 'выясняет: '],
    ['открывает: ', 'заглядывает в: '],
    ['составляет запрос', 'вздыхает: «Питер!»'],
    ['раздаёт задачу: ', 'хе-хе-хе, поручает: '],
    ['пишет задание', 'вспоминает: «Как в тот раз…»'],
    ['достаёт инструкцию: ', 'проверяет по рации: '],
    ['ищет инструмент', 'кричит «Давай, неси!»'],
    ['обновляет план', 'сверяет свой список'],
    ['составляет план', 'точит косу'],
    ['ждёт ответа от вас', 'ждёт вас, не торопится'],
    ['готовит макет', '«Гиггити-гиггити!»'],
    ['готовит генерацию', 'рисует в тетрадке'],
    ['готовится', 'берёт пиво'],
    ['читает задачу', 'слушает Питера'],
    ['обдумывает результат', 'переключает каналы'],
    ['смотрит за командой', 'смотрит телик на диване'],
    ['получил задание', 'вскочил с дивана'],
    ['сдал работу', 'Птица — это слово!'],
    ['уходит домой', 'идёт в «Пьяного моллюска»'],
    ['спит', 'храпит на диване'],
    ['ест курочку', 'ест курицу назло цыплёнку'],
    ['пьёт кофе', 'пьёт пиво «Потакет»'],
    ['читает газету', 'читает роман Брайана'],
    ['листает ленту', 'смотрит новости Тома Такера'],
    ['играет в приставку', 'играет в приставку со Стьюи'],
    ['летает на шарике', 'летит на шарике Стьюи'],
    ['поливает цветок', 'поливает цветы Лоис'],
    ['медитирует', 'смотрит в стену'],
    ['качает гантели', 'качается к битве с цыплёнком'],
    ['жонглирует', 'жонглирует банками пива'],
    ['рисует картину', 'рисует, как Крис'],
    ['танцует', 'танцует на столе'],
    ['моется в душе', 'поёт в душе'],
    ['гуляет', 'гуляет по Куахогу'],
    ['слушает музыку', 'слушает «Птица — это слово»'],
    ['болтает с ', 'шутит с '],
    ['играет в мяч с ', 'дерётся с '],
  ],
}

/** Фраза голосом текущей команды. */
export function say(action: string): string {
  for (const [from, to] of PHRASES[current]) if (action.startsWith(from)) return to + action.slice(from.length)
  return action
}

export const GUESTS = ['guest0', 'guest1', 'guest2', 'guest3', 'guest4', 'guest5'] as const

/** Кем нарисован работник: в тематической команде сабагент — свой гость вселенной, остальные — по профессии. */
export function face(w: Worker): RoleKey {
  const guest = w.isSub && !w.id.startsWith('crew-') && current !== 'standard'
  return guest ? GUESTS[(w.cast ?? 0) % GUESTS.length]! : w.role
}

/** Команда по тому, что набрали после /masterskaya: номер, имя или вселенная. */
export function teamOf(arg: string): Team | undefined {
  const a = arg.trim().toLowerCase()
  const n = Number(a)
  if (Number.isInteger(n) && n >= 1) return (Object.keys(TEAMS) as Team[])[n - 1]
  if (/^(станд|обыч|standard|default|clawd)/.test(a)) return 'standard'
  if (/^(гарри|поттер|хогвартс|hp|harry|potter)/.test(a)) return 'potter'
  if (/^(мстител|марвел|marvel|avengers)/.test(a)) return 'marvel'
  if (/^(dc|дс|лиг|справедлив|бэтмен|batman|justice)/.test(a)) return 'dc'
  if (/^(игр|престол|got|thrones|вестерос|westeros|старк)/.test(a)) return 'got'
  if (/^(сумер|twilight|каллен|cullen|форкс|forks|белл|эдвард)/.test(a)) return 'twilight'
  if (/^(ведьм|witcher|геральт|geralt|цири|йен|туссент)/.test(a)) return 'witcher'
  if (/^(как я|himym|мам|барни|barney|макларенс|тед)/.test(a)) return 'himym'
  if (/^(друз|friends|френдс|росс|рейчел|джоуи|моник|чендлер|фиби)/.test(a)) return 'friends'
  if (/^(не род|нрк|катя|пушкар|зималетто|жданов)/.test(a)) return 'nrk'
  if (/^(дюн|dune|арракис|arrakis|атрейд|муад|харконн)/.test(a)) return 'dune'
  if (/^(южн|south|саут|картман|cartman|кенни|kenny|кайл)/.test(a)) return 'southpark'
  if (/^(симпс|simpson|гомер|homer|барт|bart|спрингф)/.test(a)) return 'simpsons'
  if (/^(гриф|family|питер|стьюи|stewie|куахог|куагмир)/.test(a)) return 'familyguy'
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
