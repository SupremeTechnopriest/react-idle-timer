import { forwardRef } from 'react'
import { chakra, useColorModeValue } from '@chakra-ui/react'

export const Anchor = forwardRef(function Anchor (props: any, ref: any) {
  const color = useColorModeValue('red.500', 'red.300')
  const hover = useColorModeValue('red.600', 'red.400')
  return <chakra.a ref={ref} apply='mdx.a' color={color} _hover={{ color: hover }} {...props} />
})
