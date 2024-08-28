export interface CustomBlock {
  content: string
  page: { id: number }
  refs: { name: string }[]
  uuid: string
}

export type MappedRef = Record<
  string,
  {
    uuids: string[]
  }
>

export const mapUuidsToRefs = (linkedReferences: CustomBlock[]) => {
  return linkedReferences.reduce<MappedRef>((acc, item) => {
    if (Array.isArray(item.refs) && item.refs.length > 0) {
      item.refs.forEach((ref) => {
        const key = ref.name.toLowerCase()
        if (!acc[key]) acc[key] = { uuids: [] }
        acc[key].uuids.push(item.uuid)
      })
    } else {
      // Empty ref
      const key = 'noref'
      if (!acc[key]) acc[key] = { uuids: [] }
      acc[key].uuids.push(item.uuid)
    }
    return acc
  }, {})
}
