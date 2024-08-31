const createDynamicSelector = (uuids: string[], flag: 'show' | 'hide') => {
  let selector = 'div[level="1"][blockid]'

  if (flag === 'show') {
    const exclusions = uuids.map((uuid) => `:not([blockid="${uuid}"])`).join('')
    selector += exclusions
  }

  if (flag === 'hide') {
    const inclusions = uuids.map((uuid) => `[blockid="${uuid}"]`).join('')
    selector += inclusions
  }

  return selector
}

export const showOnlySelectedBlocks = (uuids: string[]) => {
  const containerEl = parent.document.querySelector('.blocks-container')
  if (!containerEl) return

  const dynamicSelector = createDynamicSelector(uuids, 'show')

  const divsToHide = containerEl.querySelectorAll(dynamicSelector)
  if (!divsToHide) return

  return divsToHide
}

export const hideOnlySelectedBlocks = (uuids: string[]) => {
  const containerEl = parent.document.querySelector('.blocks-container')
  if (!containerEl) return

  const dynamicSelector = createDynamicSelector(uuids, 'hide')

  const divsToHide = containerEl.querySelectorAll(dynamicSelector)
  if (!divsToHide) return

  return divsToHide
}
