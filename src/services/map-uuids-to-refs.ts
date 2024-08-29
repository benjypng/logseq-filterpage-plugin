export interface CustomBlock {
  content: string
  page: { id: number }
  refs: { name: string }[]
  uuid: string
  parent: CustomBlock
}

export type MappedRef = Record<
  string,
  {
    uuids: {
      uuid: string
      parent: CustomBlock | null
      rootParent: string
    }[]
  }
>

const findRootParent = (block: CustomBlock) => {
  let currParent = block

  while (currParent.content) {
    if (!currParent.parent.content) {
      return currParent.uuid
    }

    currParent = currParent.parent
    findRootParent(currParent.parent)
  }

  return block.uuid
}

export const mapUuidsToRefs = (linkedReferences: CustomBlock[]): MappedRef => {
  return linkedReferences.reduce<MappedRef>((acc, item) => {
    if (Array.isArray(item.refs) && item.refs.length > 0) {
      item.refs.forEach((ref) => {
        const key = ref.name.toLowerCase()
        if (!acc[key]) acc[key] = { uuids: [] }
        acc[key].uuids.push({
          uuid: item.uuid,
          parent: item.parent || null,
          rootParent: findRootParent(item),
        })
      })
    } else {
      // Empty ref
      const key = 'noref'
      if (!acc[key]) acc[key] = { uuids: [] }
      acc[key].uuids.push({
        uuid: item.uuid,
        parent: item.parent || null,
        rootParent: findRootParent(item),
      })
    }
    return acc
  }, {})
}
