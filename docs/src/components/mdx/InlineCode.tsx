import { chakra, useColorModeValue } from '@chakra-ui/react'

export const InlineCode = (props: any) => (
  <chakra.code
    apply='mdx.code'
    color={useColorModeValue('red.500', 'red.200')}
    {...props}
  />
)
