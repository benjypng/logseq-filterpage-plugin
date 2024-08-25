import '@logseq/libs'

import { createRoot } from 'react-dom/client'

import { handlePopup } from './handle-popup'
import { settings } from './settings'
import { PAGE_REFERENCE_QUERY } from './constants'
import { BlockEntity } from '@logseq/libs/dist/LSPlugin'
import { ToggleFilters } from './features/toggle-filter'

const main = async () => {
  console.log('logseq-filterpage-plugin loaded')

  // Used to handle any popups
  handlePopup()

  const el = document.getElementById('app')
  if (!el) return
  const root = createRoot(el)

  logseq.provideStyle(`
    .filterhidden {
      display: none !important
    }
  `)

  logseq.App.registerUIItem('toolbar', {
    key: `logseq-filterpage-plugin`,
    template:
      '<a data-on-click="filterTags" class="button"><i class="ti ti-filter"></i></a>',
  })

  logseq.provideModel({
    async filterTags() {
      const page = await logseq.Editor.getCurrentPage()
      if (!page) return
      let linkedReferences = await logseq.DB.datascriptQuery(
        PAGE_REFERENCE_QUERY,
        page.id,
      )
      linkedReferences = linkedReferences.map(
        (block: BlockEntity[]) => block[0],
      )
      root.render(<ToggleFilters linkedReferences={linkedReferences} />)
      logseq.showMainUI()
    },
  })
}

logseq.useSettingsSchema(settings).ready(main).catch(console.error)
