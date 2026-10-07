import { expect, mock, test } from 'claude-code/testing'

const PANE = {
  plugin: 'masterskaya',
  surface: 'terminal',
  component: 'Pane',
  requestId: 'masterskaya',
  props: {
    title: 'Мастерская',
    isFocused: false,
    bodyColumns: 80,
    placement: 'dock',
    scroll: { offset: 0, bodyRows: 40 },
    view: {},
  },
  viewport: { columns: 200, rows: 50 },
} as const

test('Bash превращает Claude в механика, пока команда идёт', async ($, on) => {
  let label: string | undefined
  let action: string | undefined
  on('tool.call', async () => {
    const ui = await $.ui.mount(PANE as never)
    label = (await ui.find({ type: 'Text', text: /Механик/ }))?.text
    action = (await ui.find({ type: 'Text', text: /запускает/ }))?.text
    await ui.unmount()
    return { result: 'ok' }
  })
  await $.tool.call({ tool: 'Bash', command: 'npm test' })
  expect(label).toBe('Механик')
  expect(action).toBe('запускает: npm test')
})

test('после чтения файла Claude обдумывает результат', async ($, on) => {
  on('tool.call', () => ({ result: 'ok' }))
  await $.tool.call({ tool: 'Read', file_path: '/tmp/a/notes.md' })
  const ui = await $.ui.mount(PANE as never)
  expect((await ui.find({ type: 'Text', text: /обдумывает/ }))?.text).toBe('обдумывает результат')
  await ui.unmount()
})

const BAND = {
  plugin: 'masterskaya',
  surface: 'terminal',
  component: 'AbovePrompt',
  requestId: 'band',
  props: { hasSurvey: false, isWorking: true, maxRows: 20, bodyColumns: 160, scroll: { offset: 0, bodyRows: 20 } },
  viewport: { columns: 120, rows: 40 },
} as const

test('полоса над вводом показывает, чем занят Claude', async ($, on) => {
  let action: string | undefined
  on('tool.call', async () => {
    const ui = await $.ui.mount(BAND as never)
    action = (await ui.find({ type: 'Text', text: /запускает/ }))?.text
    await ui.unmount()
    return { result: 'ok' }
  })
  await $.tool.call({ tool: 'Bash', command: 'ls' })
  expect(action).toContain('запускает: ls')
})

test('помощник встаёт в ряд рядом с Claude, а Claude смотрит за командой', async ($, on) => {
  let scout: string | undefined
  let lead: string | undefined
  on('agent.spawn', () => ({ agentId: 'helper-1', model: 'm' }) as never)
  on('tool.call', async () => {
    const ui = await $.ui.mount({ ...BAND, props: { ...BAND.props, bodyColumns: 160 } } as never)
    scout = (await ui.find({ type: 'Text', text: /Разведчик/ }))?.text
    lead = (await ui.find({ type: 'Text', text: /смотрит за командой/ }))?.text
    await ui.unmount()
    return { result: 'ok' }
  })
  await $.agent.spawn({ prompt: 'узнай погоду', description: 'погода', subagentType: 'general-purpose' } as never)
  await $.tool.call({ tool: 'WebSearch', query: 'погода', agentId: 'helper-1' } as never)
  expect(scout).toBe('Разведчик')
  expect(lead).toContain('смотрит за командой')
})

test('за работой в полосе все работающие: четверо без подписей, если не влезают с ними', async ($, on) => {
  let more: string | undefined
  let label: string | undefined
  let rasters = 0
  let spawned = 0
  on('agent.spawn', () => ({ agentId: 'h' + spawned++, model: 'm' }) as never)
  on('tool.call', async (_, e) => {
    if ((e as { agentId?: string }).agentId === 'h3') {
      const ui = await $.ui.mount({ ...BAND, props: { ...BAND.props, bodyColumns: 140 } } as never)
      more = (await ui.find({ type: 'Text', text: /^\+\d+$/ }))?.text
      label = (await ui.find({ type: 'Text', text: /^Исследователь$/ }))?.text
      for (const k of ['main', 'h0', 'h1', 'h2', 'h3']) if (await ui.find({ type: 'Raster', key: 'b-' + k } as never)) rasters++
      await ui.unmount()
    }
    return { result: 'ok' }
  })
  for (let i = 0; i < 4; i++) await $.agent.spawn({ prompt: 'прочитай', description: 'чтение', subagentType: 'Explore' } as never)
  for (let i = 0; i < 4; i++) await $.tool.call({ tool: 'Read', file_path: '/tmp/x', agentId: 'h' + i } as never)
  expect(rasters).toBe(5)
  expect(more).toBeUndefined()
  expect(label).toBeUndefined()
})

test('менеджер остаётся менеджером, а Bash делает механик рядом', async ($, on) => {
  let lead: string | undefined
  let mech: string | undefined
  on('tool.call', async () => {
    const ui = await $.ui.mount({ ...BAND, props: { ...BAND.props, bodyColumns: 160 } } as never)
    lead = (await ui.find({ type: 'Text', text: /^Менеджер$/ }))?.text
    mech = (await ui.find({ type: 'Text', text: /^Механик$/ }))?.text
    await ui.unmount()
    return { result: 'ok' }
  })
  await $.tool.call({ tool: 'Bash', command: 'ls' })
  expect(lead).toBe('Менеджер')
  expect(mech).toBe('Механик')
})

test('в приложении Claude полоса рисует спрайты картинками SVG', async ($, on) => {
  let svg: unknown
  let mech: string | undefined
  on('tool.call', async () => {
    const ui = await $.ui.mount({ ...BAND, surface: 'desktop' } as never)
    svg = await ui.find({ type: 'Svg' } as never)
    mech = (await ui.find({ type: 'Text', text: /^Механик$/ }))?.text
    await ui.unmount()
    return { result: 'ok' }
  })
  await $.tool.call({ tool: 'Bash', command: 'ls' })
  expect(svg).toBeDefined()
  expect(mech).toBe('Механик')
})

test('после установки менеджер один раз просит звёздочку; «Не сейчас» убирает, второй раз не просит', async ($, on) => {
  // за движок: старт сессии, команды, часы, панель и хранилище между сессиями
  const store = new Map<string, unknown>()
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('command.register', (_, e) => ({ value: { command: (e as { name: string }).name } }))
  // часы не идут: таймеры (досуг, конец просьбы через 90 с) в этом тесте не срабатывают
  for (const k of ['clock.every', 'clock.after'] as const) on(k, () => new Promise(() => undefined) as never)
  for (const k of ['ui.close', 'ui.status', 'ui.invalidate', 'ui.blit'] as const) on(k, () => ({ value: undefined }) as never)
  on('store.get', (_, e) => ({ value: store.get((e as { key: string }).key) }))
  on('store.set', (_, e) => (store.set((e as { key: string }).key, (e as { value: unknown }).value), { value: undefined }))
  const START = { cwd: '/tmp', surface: 'terminal', isInteractive: true } as const
  const askText = async () => {
    const ui = await $.ui.mount(BAND as never)
    const found = (await ui.find({ type: 'Text', text: /поставьте нам ★/ }))?.text
    await ui.unmount()
    return found
  }
  await $.session.start(START)
  expect(await askText()).toContain('поставьте нам ★')
  const ui = await $.ui.mount(BAND as never)
  await $.ui.press({ plugin: 'masterskaya', key: 'star-no' })
  await ui.unmount()
  expect(await askText()).toBeUndefined()
  await $.session.start(START)
  expect(await askText()).toBeUndefined()
})

test('пока модель пишет правку, работает редактор, а не менеджер', async ($, on) => {
  on('turn.step', async function* () {
    yield { kind: 'tool', index: 0, id: 'tu1', name: 'Edit' }
    yield { kind: 'input', index: 0, json: '{"file_path":"/tmp/a.ts"' }
    return { turnId: 't', index: 0, answer: '', toolUses: [], stopReason: 'tool_use', usage: null }
  } as never)
  const s = $.turn.step({ turnId: 't', index: 0, model: 'm', messageCount: 1 })
  for await (const _ of s) void _
  const ui = await $.ui.mount({ ...BAND, props: { ...BAND.props, bodyColumns: 160 } } as never)
  expect((await ui.find({ type: 'Text', text: /^Редактор$/ }))?.text).toBe('Редактор')
  expect((await ui.find({ type: 'Text', text: /пишет правку/ }))?.text).toContain('пишет правку')
  await ui.unmount()
})

test('/masterskaya поттер переодевает команду: менеджер — Дамблдор, Bash делает Гарри и колдует; выбор запоминается', async ($, on) => {
  const store = new Map<string, unknown>()
  on('ui.invalidate', () => ({ value: undefined }) as never)
  on('store.get', (_, e) => ({ value: store.get((e as { key: string }).key) }))
  on('store.set', (_, e) => (store.set((e as { key: string }).key, (e as { value: unknown }).value), { value: undefined }))
  let lead: string | undefined
  let mech: string | undefined
  let spell: string | undefined
  on('tool.call', async () => {
    const ui = await $.ui.mount(BAND as never)
    lead = (await ui.find({ type: 'Text', text: /^Дамблдор$/ }))?.text
    mech = (await ui.find({ type: 'Text', text: /^Гарри Поттер$/ }))?.text
    spell = (await ui.find({ type: 'Text', text: /колдует: ls/ }))?.text
    await ui.unmount()
    return { result: 'ok' }
  })
  const out = await $.command.run({ command: 'masterskaya', args: 'поттер' } as never)
  expect(out.text).toBe('Команда: Гарри Поттер.')
  expect(store.get('team')).toBe('potter')
  await $.tool.call({ tool: 'Bash', command: 'ls' })
  expect(lead).toBe('Дамблдор')
  expect(mech).toBe('Гарри Поттер')
  expect(spell).toContain('колдует: ls') // слова тоже из вселенной
  expect((await $.command.run({ command: 'masterskaya', args: 'хоббиты' } as never)).text).toContain('Такой команды нет')
})

test('служебный проход движка (память, сжатие) с чужим agentId не рисуется помощником', async ($, on) => {
  let ghost: unknown
  let hulkless: unknown
  on('tool.call', async () => {
    const ui = await $.ui.mount({ ...BAND, props: { ...BAND.props, bodyColumns: 160 } } as never)
    ghost = await ui.find({ type: 'Text', text: /^Помощник$/ })
    hulkless = await ui.find({ type: 'Text', text: /^Исследователь$/ })
    await ui.unmount()
    return { result: 'ok' }
  })
  await $.tool.call({ tool: 'Read', file_path: '/tmp/memory.md', agentId: 'engine-fork' } as never)
  expect(ghost).toBeUndefined()
  expect(hulkless).toBeUndefined()
})

test('пока идёт задача, отработавший исполнитель остаётся в полосе', async ($, on) => {
  on('tool.call', () => ({ result: 'ok' }))
  on('prompt.submit', (_, e) => e as never)
  await $.prompt.submit({ text: 'прочитай файл' } as never)
  await $.tool.call({ tool: 'Read', file_path: '/tmp/a.md' })
  await $.tool.call({ tool: 'Bash', command: 'ls' })
  const ui = await $.ui.mount({ ...BAND, props: { ...BAND.props, bodyColumns: 200 } } as never)
  expect((await ui.find({ type: 'Text', text: /^Исследователь$/ }))?.text).toBe('Исследователь')
  expect((await ui.find({ type: 'Text', text: /^Механик$/ }))?.text).toBe('Механик')
  await ui.unmount()
})

test('в тематической команде сабагенты — свои гости вселенной, двое одним персонажем не ходят', async ($, on) => {
  const store = new Map<string, unknown>()
  let n = 0
  on('ui.invalidate', () => ({ value: undefined }) as never)
  on('store.set', (_, e) => (store.set((e as { key: string }).key, (e as { value: unknown }).value), { value: undefined }))
  on('agent.spawn', () => ({ agentId: 'a' + n++, model: 'm' }) as never)
  await $.command.run({ command: 'masterskaya', args: 'марвел' } as never)
  await $.agent.spawn({ prompt: 'найди', description: 'поиск', subagentType: 'general-purpose' } as never)
  await $.agent.spawn({ prompt: 'проверь', description: 'проверка', subagentType: 'general-purpose' } as never)
  const ui = await $.ui.mount({ ...BAND, props: { ...BAND.props, bodyColumns: 200 } } as never)
  expect((await ui.find({ type: 'Text', text: /^Дэдпул$/ }))?.text).toBe('Дэдпул')
  expect((await ui.find({ type: 'Text', text: /^Звёздный Лорд$/ }))?.text).toBe('Звёздный Лорд')
  expect(await ui.find({ type: 'Text', text: /^Думает$/ })).toBeUndefined()
  await ui.unmount()
})

test('сабагент сдал работу — постоял с галочкой и ушёл домой, а не висит в полосе', async ($, on) => {
  const clock = mock.clock(on)
  on('agent.spawn', () => ({ agentId: 'once', model: 'm' }) as never)
  on('ui.invalidate', () => ({ value: undefined }) as never)
  on('turn.complete', () => ({ text: 'готово' }) as never)
  await $.agent.spawn({ prompt: 'сделай', description: 'разовая задача', subagentType: 'general-purpose' } as never)
  await $.turn.complete({ agentId: 'once', reason: 'answer', answer: 'готово', durationMs: 10, isAborted: false, turnId: 't1' } as never)
  const named = async () => {
    const ui = await $.ui.mount(PANE as never)
    const found = (await ui.find({ type: 'Text', text: /разовая задача/ }))?.text
    await ui.unmount()
    return found
  }
  expect(await named()).toBe('разовая задача')
  await clock.advance(1600) // постоял с галочкой — побежал домой
  await clock.advance(1400) // убежал — пропал
  expect(await named()).toBeUndefined()
})

test('ещё вселенные: Лига, Престолы, Сумерки, Ведьмак, Мама, Друзья, НРК, Дюна, Южный парк, Симпсоны, Гриффины — свои менеджеры, исполнители и слова', async ($, on) => {
  const store = new Map<string, unknown>()
  const seen: Record<string, (string | undefined)[]> = {}
  let label = ''
  on('ui.invalidate', () => ({ value: undefined }) as never)
  on('store.set', (_, e) => (store.set((e as { key: string }).key, (e as { value: unknown }).value), { value: undefined }))
  on('tool.call', async () => {
    const ui = await $.ui.mount({ ...BAND, props: { ...BAND.props, bodyColumns: 160 } } as never)
    const find = async (re: RegExp) => (await ui.find({ type: 'Text', text: re }))?.text
    seen[label] = [
      await find(/^(Бэтмен|Дейенерис|Белла|Геральт|Барни|Моника|Андрей Жданов|Пол Атрейдес|Картман|Гомер|Питер)$/),
      await find(/^(Супермен|Джон Сноу|Джейкоб|Цири|Тед|Чендлер|Катя Пушкарёва|Чани|Стэн|Барт|Стьюи)$/),
      await find(/(разгоняет|рубит|заводит|рассекает|чертит|обрабатывает данные|сводит баланс|ставит тампер|мутит|хулиганит|стреляет лучом): ls/),
    ]
    await ui.unmount()
    return { result: 'ok' }
  })
  label = 'dc'
  expect((await $.command.run({ command: 'masterskaya', args: 'dc' } as never)).text).toBe('Команда: Лига Справедливости.')
  await $.tool.call({ tool: 'Bash', command: 'ls' })
  label = 'got'
  expect((await $.command.run({ command: 'masterskaya', args: 'престолы' } as never)).text).toBe('Команда: Игра престолов.')
  await $.tool.call({ tool: 'Bash', command: 'ls' })
  expect(seen.dc).toEqual(['Бэтмен', 'Супермен', 'разгоняет: ls'])
  expect(seen.got).toEqual(['Дейенерис', 'Джон Сноу', 'рубит: ls'])
  label = 'twilight'
  expect((await $.command.run({ command: 'masterskaya', args: 'сумерки' } as never)).text).toBe('Команда: Сумерки.')
  await $.tool.call({ tool: 'Bash', command: 'ls' })
  expect(seen.twilight).toEqual(['Белла', 'Джейкоб', 'заводит: ls'])
  const more: [string, string, string[]][] = [
    ['ведьмак', 'Ведьмак', ['Геральт', 'Цири', 'рассекает: ls']],
    ['как я встретил вашу маму', 'Как я встретил вашу маму', ['Барни', 'Тед', 'чертит: ls']],
    ['друзья', 'Друзья', ['Моника', 'Чендлер', 'обрабатывает данные: ls']],
    ['10', 'Не родись красивой', ['Андрей Жданов', 'Катя Пушкарёва', 'сводит баланс: ls']],
    ['дюна', 'Дюна', ['Пол Атрейдес', 'Чани', 'ставит тампер: ls']],
    ['южный парк', 'Южный парк', ['Картман', 'Стэн', 'мутит: ls']],
    ['симпсоны', 'Симпсоны', ['Гомер', 'Барт', 'хулиганит: ls']],
    ['14', 'Гриффины', ['Питер', 'Стьюи', 'стреляет лучом: ls']],
  ]
  for (const [arg, name, want] of more) {
    label = arg
    expect((await $.command.run({ command: 'masterskaya', args: arg } as never)).text).toBe('Команда: ' + name + '.')
    await $.tool.call({ tool: 'Bash', command: 'ls' })
    expect(seen[arg]).toEqual(want)
  }
  expect((await $.command.run({ command: 'masterskaya', args: '1' } as never)).text).toBe('Команда: Стандартная.') // «1» — не начало «10»
})

test('вышла новая версия — один тост на версию и строка в панели, пока не обновились', async ($, on) => {
  const store = new Map<string, unknown>()
  const toasts: string[] = []
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('command.register', (_, e) => ({ value: { command: (e as { name: string }).name } }))
  for (const k of ['clock.every', 'clock.after'] as const) on(k, () => new Promise(() => undefined) as never)
  for (const k of ['ui.close', 'ui.status', 'ui.invalidate', 'ui.blit'] as const) on(k, () => ({ value: undefined }) as never)
  on('store.get', (_, e) => ({ value: store.get((e as { key: string }).key) }))
  on('store.set', (_, e) => (store.set((e as { key: string }).key, (e as { value: unknown }).value), { value: undefined }))
  on('ui.toast', (_, e) => (toasts.push((e as { text: string }).text), { value: undefined }) as never)
  const remote = "export const NEWS = [\n  ['99.1.0', 'драконы'],\n  ['99.0.0', 'единороги'],\n  ['0.1.0', 'старое'],\n]"
  on('http.fetch', () => ({ value: { status: 200, ok: true, headers: {}, text: remote } }) as never)
  const START = { cwd: '/tmp', surface: 'terminal', isInteractive: true } as const
  const settle = () => new Promise(r => setTimeout(r, 30)) // проверка обновления идёт в фоне, старт сессии её не ждёт
  await $.session.start(START)
  await settle()
  expect(toasts).toEqual(['Вышла Мастерская 99.1.0: драконы. Обновить: /plugin update masterskaya, затем новая сессия'])
  const ui = await $.ui.mount(PANE as never)
  expect((await ui.find({ type: 'Text', text: /^Вышла 99\.1\.0/ }))?.text).toContain('драконы; единороги')
  await ui.unmount()
  await $.session.start(START)
  await settle()
  expect(toasts.length).toBe(1) // второй сессии тост не нужен, строка в панели остаётся
})
