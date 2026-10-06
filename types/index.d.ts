export type RoleKey =
  | 'mechanic' | 'researcher' | 'editor' | 'writer' | 'scout' | 'designer' | 'artist'
  | 'foreman' | 'librarian' | 'planner' | 'apprentice' | 'thinker' | 'idle' | 'done'
  | 'guest0' | 'guest1' | 'guest2' | 'guest3' | 'guest4' | 'guest5' // сабагенты в тематических командах

export type Status = 'work' | 'think' | 'idle' | 'done'

export type Worker = {
  id: string
  name: string
  role: RoleKey
  action: string
  status: Status
  startedAt: number
  isSub: boolean
  leftAt?: number // когда помощник побежал прочь
  // свободное время (status 'idle'): чем занят, до какого момента, с кем
  pastime?: Pastime
  pastimeUntil?: number
  partner?: string
  leads?: boolean // в паре стоит левее и начинает (подаёт мяч, заговаривает первым)
  cast?: number // каким из гостей команды нарисован сабагент (0–5)
}

export type Pastime =
  | 'sleep' | 'eat' | 'coffee' | 'walk' | 'shower' | 'read' | 'phone' | 'gym' | 'music'
  | 'dance' | 'balloon' | 'game' | 'guitar' | 'yoga' | 'plant' | 'juggle' | 'paint'
  | 'chat' | 'ball'

declare module 'claude-code' {
  interface PluginState {
    masterskaya: { workers: Worker[] }
  }
}
