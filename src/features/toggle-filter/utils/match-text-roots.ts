import { BlockEntity } from '@logseq/libs/dist/LSPlugin'

const getBlockText = (block: BlockEntity): string =>
  block.fullTitle ?? block.title ?? block.content ?? ''

const subtreeMatches = (block: BlockEntity, term: string): boolean => {
  if (getBlockText(block).toLowerCase().includes(term)) return true

  if (Array.isArray(block.children)) {
    for (const child of block.children) {
      if (!Array.isArray(child) && subtreeMatches(child, term)) return true
    }
  }

  return false
}

export const matchTextRoots = (
  blocks: BlockEntity[],
  term: string,
): Set<string> => {
  const normalized = term.trim().toLowerCase()
  const roots = new Set<string>()

  for (const block of blocks) {
    if (!block) continue
    if (normalized === '' || subtreeMatches(block, normalized)) {
      roots.add(block.uuid)
    }
  }

  return roots
}
