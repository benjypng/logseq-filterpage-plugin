import './style.css'
import '@mantine/core/styles.css'

import {
  Button,
  Flex,
  MantineProvider,
  Space,
  Text,
  Title,
} from '@mantine/core'
import { useCallback } from 'react'

import { THEME } from '../../constants'
import {
  CustomBlock,
  MappedRef,
  mapUuidsToRefs,
} from '../../services/map-uuids-to-refs'

interface ToggleFiltersProps {
  linkedReferences: CustomBlock[]
}

export const ToggleFilters = ({ linkedReferences }: ToggleFiltersProps) => {
  const mappedRefs: MappedRef = mapUuidsToRefs(linkedReferences)

  const handleClick = useCallback(
    // Show only these blocks
    (refKey: string) => {
      const refObj = mappedRefs[refKey]
      if (!refObj) return

      refObj.uuids.forEach((uuid) => {
        const divsToHide = parent.document.querySelectorAll(
          `div[blockid]:not([blockid="${uuid}"]):not([id="block-content-${uuid}"])`,
        )
        console.log(divsToHide)
        if (!divsToHide) return
        divsToHide.forEach((element) => element.classList.add('filterhidden'))
      })
    },
    [linkedReferences],
  )

  const handleRightClick = useCallback(
    // Hide only these blocks
    (refKey: string) => {
      const refObj = mappedRefs[refKey]
      if (!refObj) return

      refObj.uuids.forEach((uuid) => {
        const divsToHide = parent.document.querySelectorAll(
          `.page-blocks-inner div[blockid][blockid="${uuid}"]`,
        )
        if (!divsToHide) return
        divsToHide.forEach((element) => element.classList.add('filterhidden'))
      })
    },
    [linkedReferences],
  )

  return (
    <MantineProvider theme={THEME}>
      <Flex bg="none" justify="right" p="md">
        <Flex p="md" mt="xl" bg="white" w="20rem" direction="column">
          <Title fz="md">Toggle References</Title>
          <Text fz="xs">
            Click to filter only blocks with this reference, and right-click to
            filter out blocks with this reference.
          </Text>
          <Space h="1rem" />
          <Flex gap="0.3rem" wrap="wrap">
            {mappedRefs &&
              Object.keys(mappedRefs).map((ref) => (
                <Button
                  key={ref}
                  h="1.8rem"
                  py={0}
                  px="0.4rem"
                  radius="sm"
                  fz="0.7rem"
                  onClick={() => handleClick(ref)}
                  onContextMenu={() => handleRightClick(ref)}
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
