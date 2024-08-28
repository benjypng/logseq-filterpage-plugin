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

interface CustomBlock {
  content: string
  page: { id: number }
  refs: { name: string }[]
  uuid: string
}

interface ToggleFiltersProps {
  linkedReferences: CustomBlock[]
}

const mapToRefUuids = (linkedReferences: CustomBlock[]) => {
  return linkedReferences.reduce((acc, item) => {
    if (Array.isArray(item.refs) && item.refs.length > 0) {
      item.refs.forEach((ref) => {
        const key = ref.name.toLowerCase()
        if (!acc[key]) acc[key] = { uuids: [] }
        acc[key].uuids.push(item.uuid)
      })
    } else {
      // Handle case where refs is empty or not an array
      const key = 'no_ref'
      if (!acc[key]) acc[key] = { uuids: [] }
      acc[key].uuids.push(item.uuid)
    }
    return acc
  }, {})
}

export const ToggleFilters = ({ linkedReferences }: ToggleFiltersProps) => {
  // Click to include and right-click to exclude. Click again to remove.
  // Search bar as well

  console.log('Linked References', linkedReferences)
  console.log('Mapped References', mapToRefUuids(linkedReferences))

  const handleClick = useCallback(
    // Filter out all other blocks in the page
    (uuid: string) => {
      // const element = parent.document.querySelector(`[blockid="${uuid}"]`)
      // if (!element) return
      // element.classList.add('filterhidden')
    },
    [linkedReferences],
  )

  const handleRightClick = useCallback(
    // Filter out only these blocks
    (uuid: string) => {
      console.log('right click')
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
            {linkedReferences &&
              linkedReferences.map((ref) => (
                <Button
                  key={ref.uuid}
                  h="1.5rem"
                  py={0}
                  px="0.4rem"
                  radius="md"
                  fz="0.7rem"
                  onClick={() => handleClick(ref.uuid)}
                  onContextMenu={() => handleRightClick(ref.uuid)}
                >
                  {ref.content}
                </Button>
              ))}
          </Flex>
        </Flex>
      </Flex>
    </MantineProvider>
  )
}
