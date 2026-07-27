import { FILTER_NOOP_STYLE, FILTER_STYLE_KEY } from '../../../constants'

export const applyRefFilter = (hideUuids: string[]): void => {
  if (hideUuids.length === 0) {
    logseq.provideStyle({ key: FILTER_STYLE_KEY, style: FILTER_NOOP_STYLE })
    return
  }

  const selectors = hideUuids
    .map((uuid) => `.page-blocks-inner .ls-block[blockid="${uuid}"]`)
    .join(', ')

  logseq.provideStyle({
    key: FILTER_STYLE_KEY,
    style: `${selectors} { display: none !important; }`,
  })
}

export const clearRefFilter = (): void => {
  applyRefFilter([])
}
