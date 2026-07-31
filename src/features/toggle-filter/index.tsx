import './style.css'

import { BlockEntity } from '@logseq/libs/dist/LSPlugin'
import { useEffect, useState } from 'react'

import { NOT_A_PAGE_MESSAGE } from '../../constants'
import {
  PageReferences,
  TaskBucket,
  TaskFilter,
  TaskRootUuids,
  ThemeMode,
} from '../../types'
import {
  applyRefFilter,
  groupTaskRootUuids,
  groupUuidsByTitle,
  matchTextRoots,
  onThemeModeChanged,
  onUiVisibleChanged,
} from './utils'

const EMPTY_TASK_ROOTS: TaskRootUuids = { todo: new Set(), done: new Set() }

export const ToggleFilters = () => {
  const [pageReferences, setPageReferences] = useState<PageReferences>({})
  const [selectedRefs, setSelectedRefs] = useState<Set<string>>(new Set())
  const [pageBlocks, setPageBlocks] = useState<BlockEntity[]>([])
  const [rootUuids, setRootUuids] = useState<string[]>([])
  const [taskRoots, setTaskRoots] = useState<TaskRootUuids>(EMPTY_TASK_ROOTS)
  const [taskFilter, setTaskFilter] = useState<TaskFilter>(null)
  const [filter, setFilter] = useState('')
  const [textFilter, setTextFilter] = useState('')
  const [themeMode, setThemeMode] = useState<ThemeMode>('light')

  const getPageReferences = async () => {
    const currentPbt = await logseq.Editor.getCurrentPageBlocksTree()
    if (!currentPbt) {
      logseq.UI.showMsg(NOT_A_PAGE_MESSAGE, 'error')
      return
    }
    setPageBlocks(currentPbt.filter(Boolean))
    setRootUuids(currentPbt.filter(Boolean).map((block) => block.uuid))
    setPageReferences(await groupUuidsByTitle(currentPbt))
    setTaskRoots(await groupTaskRootUuids(currentPbt))
    setFilter('')
    setTextFilter('')
  }

  useEffect(() => {
    return onUiVisibleChanged((visible) => {
      if (visible) getPageReferences()
    })
  }, [])

  useEffect(() => {
    const offRouteChanged = logseq.App.onRouteChanged(() => {
      setSelectedRefs(new Set())
      setTaskFilter(null)
      setTextFilter('')
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

  const isTextFiltering = textFilter.trim() !== ''
  const textMatchRoots = matchTextRoots(pageBlocks, textFilter)

  const taskHiddenRoots =
    taskFilter === 'todo'
      ? new Set([...taskRoots.done].filter((uuid) => !taskRoots.todo.has(uuid)))
      : taskFilter === 'done'
        ? new Set(
            [...taskRoots.todo].filter((uuid) => !taskRoots.done.has(uuid)),
          )
        : new Set<string>()

  const hiddenUuids = rootUuids.filter(
    (uuid) =>
      (isFiltering && !keepUuids.has(uuid)) ||
      taskHiddenRoots.has(uuid) ||
      (isTextFiltering && !textMatchRoots.has(uuid)),
  )
  const hiddenSet = new Set(hiddenUuids)

  useEffect(() => {
    applyRefFilter(hiddenUuids)
  }, [
    selectedRefs,
    pageReferences,
    rootUuids,
    taskFilter,
    taskRoots,
    textFilter,
    pageBlocks,
  ])

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

  const toggleTaskFilter = (bucket: TaskBucket) => {
    setTaskFilter((prev) => (prev === bucket ? null : bucket))
  }

  const visibleUuidCount = (title: string) => {
    const uuids = pageReferences[title] ?? []
    return uuids.filter((uuid) => !hiddenSet.has(uuid)).length
  }

  const refVisibleRoots = new Set(
    rootUuids.filter(
      (uuid) =>
        (!isFiltering || keepUuids.has(uuid)) &&
        (!isTextFiltering || textMatchRoots.has(uuid)),
    ),
  )
  const taskCount = (bucket: TaskBucket) =>
    [...taskRoots[bucket]].filter((uuid) => refVisibleRoots.has(uuid)).length
  const hasTasks = taskRoots.todo.size + taskRoots.done.size > 0

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
          placeholder="Search references"
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
        {hasTasks && (
          <div className="filter-page-tasks">
            <h2 className="filter-page-section-title">Tasks</h2>
            <p className="filter-page-description">
              Show only blocks with todo or done tasks. Blocks without tasks are
              not affected.
            </p>
            <div className="filter-page-refs">
              {(['todo', 'done'] as const).map((bucket) => (
                <button
                  key={bucket}
                  type="button"
                  className={
                    taskFilter === bucket
                      ? 'filter-page-ref filled'
                      : 'filter-page-ref'
                  }
                  onClick={() => toggleTaskFilter(bucket)}
                >
                  {bucket === 'todo' ? 'Todo' : 'Done'}{' '}
                  <sup className="filter-page-ref-count">
                    {taskCount(bucket)}
                  </sup>
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="filter-page-text">
          <h2 className="filter-page-section-title">Text</h2>
          <p className="filter-page-description">
            Show only blocks containing this text. Blocks whose sub-blocks
            contain the text are also shown.
          </p>
          <input
            value={textFilter}
            onChange={(e) => setTextFilter(e.target.value)}
            placeholder="Show blocks containing…"
            className="filter-page-input"
          />
        </div>
      </div>
    </div>
  )
}
