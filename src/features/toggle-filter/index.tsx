import './style.css'
import '@mantine/core/styles.css'

import {
  Button,
  Flex,
  Input,
  MantineProvider,
  Space,
  Text,
  Title,
} from '@mantine/core'
import { useCallback, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { THEME } from '../../constants'
import {
  hideOnlySelectedBlocks,
  showOnlySelectedBlocks,
} from '../../services/get-divs-to-hide'
import { CustomBlock, mapUuidsToRefs } from '../../services/map-uuids-to-refs'

interface ToggleFiltersProps {
  linkedReferences: CustomBlock[]
}

interface FormInputs {
  filter: string
}

export const ToggleFilters = ({ linkedReferences }: ToggleFiltersProps) => {
  const [selectRef, setSelectRef] = useState<{
    refKey: string
    rootUuids: string[]
    flag: 'show' | 'hide'
  } | null>()
  const { control, watch } = useForm<FormInputs>({
    defaultValues: {
      filter: '',
    },
  })

  logseq.App.onRouteChanged(() => {
    reset()
    setSelectRef(null)
    const containerEl = parent.document.querySelector('.blocks-container')
    if (!containerEl) return
    const hiddenEls = containerEl.querySelectorAll('.filterhidden')
    toggleFilteredDivs(hiddenEls)
  })

  const mappedRefs = useMemo(
    () => mapUuidsToRefs(linkedReferences),
    [linkedReferences],
  )

  const refsDisplay = Object.keys(mappedRefs).filter((ref) =>
    ref.includes(watch('filter')),
  )

  const toggleFilteredDivs = (divs: NodeListOf<Element>) => {
    divs.forEach((div) => {
      if (div.classList.contains('filterhidden')) {
        div.classList.remove('filterhidden')
        setSelectRef(null)
      } else {
        div.classList.add('filterhidden')
      }
    })
  }

  const showOnlyTheseRefs = useCallback(
    // Show only these blocks
    (refKey: string) => {
      const refObj = mappedRefs[refKey]
      if (!refObj) return

      const rootParentsToKeep = refObj.uuids.map((obj) => obj.rootParent)
      setSelectRef({
        refKey,
        rootUuids: rootParentsToKeep,
        flag: 'show',
      })

      const divsToHide = showOnlySelectedBlocks(rootParentsToKeep)
      if (!divsToHide) return

      toggleFilteredDivs(divsToHide)
    },
    [linkedReferences],
  )

  const hideOnlyTheseRefs = useCallback(
    // Hide only these blocks
    (refKey: string) => {
      const refObj = mappedRefs[refKey]
      if (!refObj) return

      const rootParentsToHide = refObj.uuids.map((obj) => obj.rootParent)
      setSelectRef({
        refKey,
        rootUuids: rootParentsToHide,
        flag: 'hide',
      })

      const divsToHide = hideOnlySelectedBlocks(rootParentsToHide)
      if (!divsToHide) return

      toggleFilteredDivs(divsToHide)
    },
    [linkedReferences],
  )

  const reset = () => {
    let divsToToggle
    if (selectRef?.flag === 'hide') {
      divsToToggle = hideOnlySelectedBlocks(selectRef.rootUuids)
    }
    if (selectRef?.flag === 'show') {
      divsToToggle = showOnlySelectedBlocks(selectRef.rootUuids)
    }
    if (!divsToToggle) return
    toggleFilteredDivs(divsToToggle)
  }

  return (
    <MantineProvider theme={THEME}>
      <Flex bg="none" justify="right" p="md">
        <Flex
          p="md"
          mt="xl"
          bg="white"
          w="20rem"
          direction="column"
          id="filter-page-container"
        >
          <Title fz="md">Toggle References</Title>
          <Text fz="xs">
            Click to filter only blocks with this reference, and cmd/ctrl+click
            to filter out blocks with this reference. Click again to toggle.
          </Text>
          <Space h="1rem" />
          {!selectRef && (
            <>
              <Controller
                name="filter"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="Filter" size="xs" />
                )}
              />
              <Space h="1rem" />
            </>
          )}
          <Flex gap="0.3rem" wrap="wrap">
            {mappedRefs &&
              refsDisplay.map((ref) => (
                <Button
                  key={ref}
                  h="1.8rem"
                  py={0}
                  px="0.4rem"
                  radius="sm"
                  fz="0.7rem"
                  onClick={(e) => {
                    if (selectRef) {
                      reset()
                    } else if (e.metaKey || e.ctrlKey) {
                      hideOnlyTheseRefs(ref)
                    } else {
                      showOnlyTheseRefs(ref)
                    }
                  }}
                  variant={ref === selectRef?.refKey ? 'filled' : 'outline'}
                  style={{
                    display:
                      selectRef && selectRef.refKey !== ref ? 'none' : 'block',
                  }}
                >
                  {ref}{' '}
                  <sup>
                    <Text fz="0.5rem" ml="0.3rem">
                      {mappedRefs[ref] && mappedRefs[ref].uuids.length}
                    </Text>
                  </sup>
                </Button>
              ))}
          </Flex>
        </Flex>
      </Flex>
    </MantineProvider>
  )
}
