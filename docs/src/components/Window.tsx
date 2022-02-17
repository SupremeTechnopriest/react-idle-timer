import { forwardRef, Ref } from 'react'
import { Box, Flex, Icon, useColorModeValue } from '@chakra-ui/react'
import { FaCircle } from 'react-icons/fa'

interface IWindowProps {
  url: string
  height?: number
}

export const Window = forwardRef(function Window (props: IWindowProps, ref: Ref<HTMLIFrameElement>) {
  return (
    <Box
      w='full'
      borderRadius={8}
      boxShadow={4}
      overflow='hidden'
    >
      <Box
        bg={useColorModeValue('gray.200', 'gray.600')}
        p={2}
        borderTopRadius={8}
      >
        <Flex>
          <Icon as={FaCircle} ml={2} mr={2} color='red.500' />
          <Icon as={FaCircle} mr={2} color='yellow.500' />
          <Icon as={FaCircle} color='green.500' />
        </Flex>
      </Box>
      <Box
        bg={useColorModeValue('gray.100', 'gray.700')}
        borderBottomRadius={8}
        h={props.height || 500}
      >
        <iframe ref={ref} src={props.url} style={{
          width: '100%',
          height: '100%'
        }}/>
      </Box>
    </Box>
  )
})
