import { expect, test } from 'claude-code/testing'

import type { Worker } from '../types'
import { plan } from '../hooks/life'
import { onStage } from '../hooks/register'

const w = (id: string, fields: Partial<Worker> = {}): Worker => ({
  id,
  name: id,
  role: id === 'main' ? 'foreman' : 'mechanic',
  action: 'отдыхает',
  status: 'idle',
  startedAt: 0,
  isSub: id !== 'main',
  ...fields,
})

test('отдыхающие соседи могут занять друг друга: менеджер болтает с механиком', () => {
  const out = plan([w('main'), w('crew-mechanic')], 1000, () => 0)
  expect(out.get('main')).toMatchObject({ pastime: 'chat', partner: 'crew-mechanic', leads: true, action: 'болтает с механиком' })
  expect(out.get('crew-mechanic')).toMatchObject({ pastime: 'chat', partner: 'main', leads: false, action: 'болтает с менеджером' })
})

test('занятой работой в досуг не попадает, сосед отдыхает один', () => {
  const out = plan([w('main'), w('crew-mechanic', { status: 'work' })], 1000, () => 0)
  expect(out.has('crew-mechanic')).toBe(false)
  expect(out.get('main')?.partner).toBeUndefined()
  expect(out.get('main')?.pastime).toBeDefined()
})

test('пока занятие не кончилось, его не меняют; напарник ушёл работать — меняют', () => {
  const busy = [w('main', { pastime: 'coffee', pastimeUntil: 5000 })]
  expect(plan(busy, 1000).size).toBe(0)
  const left = [w('main', { pastime: 'ball', pastimeUntil: 5000, partner: 'crew-mechanic', leads: true }), w('crew-mechanic', { status: 'work' })]
  expect(plan(left, 1000).get('main')?.partner).toBeUndefined()
})

test('работы нет — рядом с менеджером до двух отдыхающих, последних звавшихся', () => {
  const stage = onStage([w('a', { startedAt: 1 }), w('b', { startedAt: 3 }), w('c', { startedAt: 2 })])
  expect(stage.map(x => x.id)).toEqual(['b', 'c'])
})

test('идёт работа — в полосе все, кто работает, отдыхающие за кадром', () => {
  const subs = [
    w('rest', { startedAt: 9 }),
    w('a', { status: 'work', startedAt: 1 }),
    w('b', { status: 'think', startedAt: 3 }),
    w('c', { status: 'work', startedAt: 2 }),
  ]
  expect(onStage(subs).map(x => x.id)).toEqual(['a', 'b', 'c'])
})
