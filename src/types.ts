import { EntityID } from '@logseq/libs/dist/LSPlugin'

export type PageReferences = Record<string, string[]>

export type UuidsByEntityId = Record<EntityID, string[]>

export interface VisibilityChangedEvent {
  visible: boolean
}

export type ThemeMode = 'light' | 'dark'

export type TaskBucket = 'todo' | 'done'

export type TaskFilter = TaskBucket | null

export interface TaskRootUuids {
  todo: Set<string>
  done: Set<string>
}
