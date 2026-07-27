import './style.css'

import { useEffect, useState } from 'react'

import { NOT_A_PAGE_MESSAGE } from '../../constants'
import { PageReferences, ThemeMode } from '../../types'
import {
  applyRefFilter,
  groupUuidsByTitle,
  onThemeModeChanged,
  onUiVisibleChanged,
} from './utils'

export const ToggleFilters = () => {
  const [pageReferences, setPageReferences] = useState<PageReferences>({})
  const [selectedRefs, setSelectedRefs] = useState<Set<string>>(new Set())
  const [rootUuids, setRootUuids] = useState<string[]>([])
  const [filter, setFilter] = useState('')
  const [themeMode, setThemeMode] = useState<ThemeMode>('light')

  const getPageReferences = async () => {
    const currentPbt = await logseq.Editor.getCurrentPageBlocksTree()
    if (!currentPbt) {
      logseq.UI.showMsg(NOT_A_PAGE_MESSAGE, 'error')
      return
    }
    setRootUuids(currentPbt.filter(Boolean).map((block) => block.uuid))
    setPageReferences(await groupUuidsByTitle(currentPbt))
    setFilter('')
  }

  useEffect(() => {
    return onUiVisibleChanged((visible) => {
      if (visible) getPageReferences()
    })
  }, [])

  useEffect(() => {
    const offRouteChanged = logseq.App.onRouteChanged(() => {
      setSelectedRefs(new Set())
    })
    return offRouteChanged
  }, [])

  useEffect(() => {
    logseq.App.getUserConfigs().then((configs) => {
      setThemeMode(configs.preferredThemeMode === 'dark' ? 'dark' : 'light')
    })
    return onThemeModeChanged(setThemeMode)
  }, [])

  const selectedUuidLists = [...selectedRefs].map(
    (title) => pageReferences[title] ?? [],
  )
  const keepUuids = selectedUuidLists.reduce(
    (acc, uuids) => new Set(uuids.filter((uuid) => acc.has(uuid))),
    new Set(selectedUuidLists[0] ?? []),
  )
  const isFiltering = selectedRefs.size > 0 && keepUuids.size > 0

  useEffect(() => {
    if (!isFiltering) {
      applyRefFilter([])
      return
    }
    applyRefFilter(rootUuids.filter((uuid) => !keepUuids.has(uuid)))
  }, [selectedRefs, pageReferences, rootUuids])

  const toggleRef = (title: string) => {
    setSelectedRefs((prev) => {
      const next = new Set(prev)
      if (next.has(title)) {
        next.delete(title)
      } else {
        next.add(title)
      }
      return next
    })
  }

  const visibleUuidCount = (title: string) => {
    const uuids = pageReferences[title] ?? []
    if (!isFiltering) return uuids.length
    return uuids.filter((uuid) => keepUuids.has(uuid)).length
  }

  const titles = Object.keys(pageReferences)
    .filter((title) => visibleUuidCount(title) > 0)
    .sort((a, b) => a.localeCompare(b))
    .filter((title) => title.toLowerCase().includes(filter.toLowerCase()))

  return (
    <div className="filter-page-overlay">
      <div id="filter-page-container" className={themeMode}>
        <h1 className="filter-page-title">Toggle References</h1>
        <p className="filter-page-description">
          Click a reference to show only blocks with that reference. Select more
          references to narrow the filter, and click again to deselect.
        </p>
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter"
          className="filter-page-input"
        />
        <div className="filter-page-refs">
          {titles.map((title) => (
            <button
              key={title}
              type="button"
              className={
                selectedRefs.has(title)
                  ? 'filter-page-ref filled'
                  : 'filter-page-ref'
              }
              onClick={() => toggleRef(title)}
            >
              {title}{' '}
              <sup className="filter-page-ref-count">
                {visibleUuidCount(title)}
              </sup>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
