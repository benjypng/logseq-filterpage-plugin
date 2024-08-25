import './style.css'
import '@mantine/core/styles.css'

import { Button, Flex, MantineProvider, Space, Title } from '@mantine/core'

import { THEME } from '../../constants'

interface ToggleFiltersProps {
  linkedReferences: CustomBlock[]
}

interface CustomBlock {
  content: string
  page: {
    id: number
  }
  uuid: string
  refs: { name: string }[]
}

export const ToggleFilters = ({ linkedReferences }: ToggleFiltersProps) => {
  const handleClick = (uuid: string) => {
    const element = parent.document.querySelector(`[blockid="${uuid}"]`)
    if (!element) return
    element.classList.add('filterhidden')
  }

  return (
    <MantineProvider theme={THEME}>
      <Flex bg="none" justify="right" p="md">
        <Flex p="md" mt="xl" bg="white" w="20rem" direction="column">
          <Title fz="lg">Toggle References</Title>
          <Space />
          <Flex gap="xs" p="xs" wrap="wrap">
            {linkedReferences &&
              linkedReferences.map((ref: CustomBlock) => (
                <Button
                  key={ref.uuid}
                  p="xs"
                  radius="xl"
                  onClick={() => handleClick(ref.uuid)}
                >
                  {ref.refs[0]?.name}
                </Button>
              ))}
          </Flex>
        </Flex>
      </Flex>
    </MantineProvider>
  )
}
