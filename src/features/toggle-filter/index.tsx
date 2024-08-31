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
  const [selectRef, setSelectRef] = useState<string | null>()
  const { control, watch } = useForm<FormInputs>({
    defaultValues: {
      filter: '',
    },
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

  const handleClick = useCallback(
    // Show only these blocks
    (refKey: string) => {
      const refObj = mappedRefs[refKey]
      if (!refObj) return
      setSelectRef(refKey)

      const rootParentsToKeep = refObj.uuids.map((obj) => obj.rootParent)

      const divsToHide = showOnlySelectedBlocks(rootParentsToKeep)
      if (!divsToHide) return

      toggleFilteredDivs(divsToHide)
    },
    [linkedReferences],
  )

  const handleRightClick = useCallback(
    // Hide only these blocks
    (refKey: string) => {
      const refObj = mappedRefs[refKey]
      if (!refObj) return
      setSelectRef(refKey)

      const rootParentsToHide = refObj.uuids.map((obj) => obj.rootParent)

      const divsToHide = hideOnlySelectedBlocks(rootParentsToHide)
      if (!divsToHide) return

      toggleFilteredDivs(divsToHide)
    },
    [linkedReferences],
  )

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
            Click to filter only blocks with this reference, and right-click to
            filter out blocks with this reference.
          </Text>
          <Space h="1rem" />
          <Controller
            name="filter"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="Filter" size="xs" />
            )}
          />
          <Space h="1rem" />
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
                  onClick={() => handleClick(ref)}
                  onContextMenu={() => handleRightClick(ref)}
                  variant={ref === selectRef ? 'filled' : 'outline'}
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
