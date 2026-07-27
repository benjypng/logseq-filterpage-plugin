import { ThemeMode } from '../../../types'

export const onThemeModeChanged = (
  callback: (mode: ThemeMode) => void,
): (() => void) => {
  const off = logseq.App.onThemeModeChanged((event) => {
    callback(event.mode)
  })
  return off
}
