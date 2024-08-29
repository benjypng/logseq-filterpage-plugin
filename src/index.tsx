import '@logseq/libs'

import { BlockEntity } from '@logseq/libs/dist/LSPlugin'
import { createRoot } from 'react-dom/client'

import { PAGE_REFERENCE_QUERY } from './constants'
import { ToggleFilters } from './features/toggle-filter'
import { handlePopup } from './handle-popup'
import { settings } from './settings'
import { CustomBlock } from './services/map-uuids-to-refs'

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
      if (!page) {
        logseq.UI.showMsg('Can only be used on a journal or page.', 'error', {
          timeout: 3000,
        })
        return
      }

      let linkedReferences = await logseq.DB.datascriptQuery(
        PAGE_REFERENCE_QUERY,
        page.id,
      )

      if (!linkedReferences || linkedReferences.length === 0) {
        logseq.UI.showMsg('No references found', 'warning', { timeout: 3000 })
        return
      }

      linkedReferences = linkedReferences.map(
        (block: CustomBlock[]) => block[0],
      )

      root.render(<ToggleFilters linkedReferences={linkedReferences} />)
      logseq.showMainUI()
    },
  })
}

logseq.useSettingsSchema(settings).ready(main).catch(console.error)
