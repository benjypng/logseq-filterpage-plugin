import '@logseq/libs'

import { createRoot } from 'react-dom/client'

import {
  NOT_A_PAGE_MESSAGE,
  TOOLBAR_ITEM_KEY,
  TOOLBAR_ITEM_TEMPLATE,
} from './constants'
import { ToggleFilters } from './features/toggle-filter'
import { handlePopup } from './handle-popup'

const main = async () => {
  logseq.UI.showMsg('logseq-filterpage-plugin loaded')

  // Used to handle any popups
  handlePopup()

  const el = document.getElementById('app')
  if (!el) return
  const root = createRoot(el)
  root.render(<ToggleFilters />)

  logseq.App.registerUIItem('toolbar', {
    key: TOOLBAR_ITEM_KEY,
    template: TOOLBAR_ITEM_TEMPLATE,
  })

  logseq.provideModel({
    async filterTags() {
      const currentPbt = await logseq.Editor.getCurrentPageBlocksTree()
      if (!currentPbt) {
        logseq.UI.showMsg(NOT_A_PAGE_MESSAGE, 'error')
        return
      }
      logseq.showMainUI()
    },
  })
}

logseq.ready(main).catch(console.error)
