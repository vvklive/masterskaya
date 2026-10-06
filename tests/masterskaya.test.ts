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

test('помощник встаёт в ряд рядом с Claude, а Claude руководит', async ($, on) => {
  let scout: string | undefined
  let lead: string | undefined
  on('tool.call', async () => {
    const ui = await $.ui.mount({ ...BAND, props: { ...BAND.props, bodyColumns: 160 } } as never)
    scout = (await ui.find({ type: 'Text', text: /Разведчик/ }))?.text
    lead = (await ui.find({ type: 'Text', text: /руководит командой/ }))?.text
    await ui.unmount()
    return { result: 'ok' }
  })
  await $.tool.call({ tool: 'WebSearch', query: 'погода', agentId: 'helper-1' } as never)
  expect(scout).toBe('Разведчик')
  expect(lead).toContain('руководит командой')
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
