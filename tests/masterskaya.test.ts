import { expect, test } from 'claude-code/testing'

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
  on('tool.call', async () => {
    const ui = await $.ui.mount({ ...BAND, props: { ...BAND.props, bodyColumns: 160 } } as never)
    scout = (await ui.find({ type: 'Text', text: /Разведчик/ }))?.text
    lead = (await ui.find({ type: 'Text', text: /смотрит за командой/ }))?.text
    await ui.unmount()
    return { result: 'ok' }
  })
  await $.tool.call({ tool: 'WebSearch', query: 'погода', agentId: 'helper-1' } as never)
  expect(scout).toBe('Разведчик')
  expect(lead).toContain('смотрит за командой')
})

test('за работой в полосе все работающие: четверо без подписей, если не влезают с ними', async ($, on) => {
  let more: string | undefined
  let label: string | undefined
  let rasters = 0
  on('tool.call', async (_, e) => {
    if ((e as { agentId?: string }).agentId === 'h3') {
      const ui = await $.ui.mount({ ...BAND, props: { ...BAND.props, bodyColumns: 200 } } as never)
      more = (await ui.find({ type: 'Text', text: /^\+\d+$/ }))?.text
      label = (await ui.find({ type: 'Text', text: /^Исследователь$/ }))?.text
      for (const k of ['main', 'h0', 'h1', 'h2', 'h3']) if (await ui.find({ type: 'Raster', key: 'b-' + k } as never)) rasters++
      await ui.unmount()
    }
    return { result: 'ok' }
  })
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
