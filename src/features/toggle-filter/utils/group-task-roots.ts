import { BlockEntity, EntityID, IEntityID } from '@logseq/libs/dist/LSPlugin'

import { TASK_STATUS_KEY } from '../../../constants'
import { TaskRootUuids } from '../../../types'

const DONE_STATUS_NAMES = new Set(['done', 'canceled', 'cancelled'])
const TASK_CLASS_IDENT = 'logseq.class/Task'
const CLASS_EXTENDS_KEY = ':logseq.property.class/extends'

const getEntityId = (value: unknown): EntityID | undefined =>
  typeof (value as IEntityID)?.id === 'number'
    ? (value as IEntityID).id
    : undefined

const getEntityIds = (value: unknown): EntityID[] =>
  Array.isArray(value)
    ? value.map(getEntityId).filter((id): id is EntityID => id !== undefined)
    : []

const collectTaskInfo = (
  statusIdsByRoot: Map<string, Set<EntityID>>,
  statuslessTagIdsByRoot: Map<string, Set<EntityID>>,
  block: BlockEntity,
  rootUuid: string,
): void => {
  const statusId = getEntityId(block[TASK_STATUS_KEY])
  if (statusId !== undefined) {
    const ids = statusIdsByRoot.get(rootUuid) ?? new Set<EntityID>()
    ids.add(statusId)
    statusIdsByRoot.set(rootUuid, ids)
  } else {
    for (const tagId of getEntityIds(block.tags)) {
      const ids = statuslessTagIdsByRoot.get(rootUuid) ?? new Set<EntityID>()
      ids.add(tagId)
      statuslessTagIdsByRoot.set(rootUuid, ids)
    }
  }

  if (Array.isArray(block.children)) {
    for (const child of block.children) {
      if (!Array.isArray(child)) {
        collectTaskInfo(
          statusIdsByRoot,
          statuslessTagIdsByRoot,
          child,
          rootUuid,
        )
      }
    }
  }
}

const resolveStatusNames = async (
  ids: EntityID[],
): Promise<Map<EntityID, string>> => {
  const entries = await Promise.all(
    ids.map(async (id) => {
      const page = await logseq.Editor.getPage(id)
      const name = page?.title ?? page?.originalName ?? page?.name
      return name ? ([id, name.toLowerCase()] as const) : null
    }),
  )

  return new Map(entries.filter((entry) => entry !== null))
}

const normalizeIdent = (ident: unknown): string | undefined =>
  typeof ident === 'string' ? ident.replace(/^:/, '') : undefined

const isTaskClass = async (
  id: EntityID,
  cache: Map<EntityID, boolean>,
): Promise<boolean> => {
  const cached = cache.get(id)
  if (cached !== undefined) return cached
  cache.set(id, false)

  const page = await logseq.Editor.getPage(id)
  let result = normalizeIdent(page?.ident) === TASK_CLASS_IDENT

  if (!result && page) {
    for (const parentId of getEntityIds(page[CLASS_EXTENDS_KEY])) {
      if (await isTaskClass(parentId, cache)) {
        result = true
        break
      }
    }
  }

  cache.set(id, result)
  return result
}

export const groupTaskRootUuids = async (
  blocks: BlockEntity[],
): Promise<TaskRootUuids> => {
  const statusIdsByRoot = new Map<string, Set<EntityID>>()
  const statuslessTagIdsByRoot = new Map<string, Set<EntityID>>()

  for (const block of blocks) {
    if (!block) continue
    collectTaskInfo(statusIdsByRoot, statuslessTagIdsByRoot, block, block.uuid)
  }

  const allStatusIds = [
    ...new Set([...statusIdsByRoot.values()].flatMap((ids) => [...ids])),
  ]
  const statusNames = await resolveStatusNames(allStatusIds)

  const taskRoots: TaskRootUuids = { todo: new Set(), done: new Set() }

  for (const [rootUuid, ids] of statusIdsByRoot) {
    for (const id of ids) {
      const name = statusNames.get(id)
      if (!name) continue
      if (DONE_STATUS_NAMES.has(name)) {
        taskRoots.done.add(rootUuid)
      } else {
        taskRoots.todo.add(rootUuid)
      }
    }
  }

  const classCache = new Map<EntityID, boolean>()

  for (const [rootUuid, tagIds] of statuslessTagIdsByRoot) {
    if (taskRoots.todo.has(rootUuid)) continue
    for (const tagId of tagIds) {
      if (await isTaskClass(tagId, classCache)) {
        taskRoots.todo.add(rootUuid)
        break
      }
    }
  }

  return taskRoots
}
