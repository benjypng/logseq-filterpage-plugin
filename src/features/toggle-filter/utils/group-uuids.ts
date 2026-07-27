import { BlockEntity, EntityID, IEntityID } from '@logseq/libs/dist/LSPlugin'

import { PageReferences, UuidsByEntityId } from '../../../types'

const getEntityIds = (value: unknown): EntityID[] => {
  if (!Array.isArray(value)) return []

  return value
    .filter(
      (entry): entry is IEntityID =>
        typeof (entry as IEntityID)?.id === 'number',
    )
    .map((entry) => entry.id)
}

const collectIds = (block: BlockEntity): EntityID[] => [
  ...getEntityIds(block.refs),
  ...getEntityIds(block.tags),
]

const addToIndex = (
  index: UuidsByEntityId,
  id: EntityID,
  uuid: string,
): void => {
  if (index[id] === undefined) {
    index[id] = []
  }

  if (!index[id].includes(uuid)) {
    index[id].push(uuid)
  }
}

const indexBlock = (
  index: UuidsByEntityId,
  block: BlockEntity,
  rootUuid: string,
): void => {
  for (const id of collectIds(block)) {
    addToIndex(index, id, rootUuid)
  }

  if (Array.isArray(block.children)) {
    for (const child of block.children) {
      if (!Array.isArray(child)) {
        indexBlock(index, child, rootUuid)
      }
    }
  }
}

export const groupUuidsByTitle = async (
  blocks: BlockEntity[],
): Promise<PageReferences> => {
  const idIndex: UuidsByEntityId = {}

  for (const block of blocks) {
    if (!block) continue
    indexBlock(idIndex, block, block.uuid)
  }

  const resolved = await Promise.all(
    Object.entries(idIndex).map(async ([id, uuids]) => {
      const refBlock = await logseq.Editor.getBlock(Number(id))
      if (!refBlock?.fullTitle) return null
      return { title: refBlock.fullTitle, uuids }
    }),
  )

  const grouped: PageReferences = {}

  for (const entry of resolved) {
    if (!entry) continue
    const existing = grouped[entry.title] ?? []
    grouped[entry.title] = [...new Set([...existing, ...entry.uuids])]
  }

  return grouped
}
