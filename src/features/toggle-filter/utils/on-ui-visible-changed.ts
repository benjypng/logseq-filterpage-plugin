import { VisibilityChangedEvent } from '../../../types'

export const onUiVisibleChanged = (
  callback: (visible: boolean) => void,
): (() => void) => {
  const handler = ({ visible }: VisibilityChangedEvent) => {
    callback(visible)
  }
  logseq.on('ui:visible:changed', handler)
  return () => {
    logseq.off('ui:visible:changed', handler)
  }
}
