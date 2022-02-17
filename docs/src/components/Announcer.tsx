import { chakra, Flex, Center, Text } from '@chakra-ui/react'

interface IAnnouncerProps {
  message: string
  link: string
  title: string
}

export function Announcer (props: IAnnouncerProps) {
  return (
    <Center
      py='2'
      px='3'
      bgGradient='linear(to-r,orange.500, pink.500)'
      color='white'
      textAlign='center'
    >
      <Flex align='center' fontSize='sm'>
        <Text fontWeight='medium' maxW={{ base: '32ch', md: 'unset' }}>
          {props.message}
        </Text>
        <chakra.a
          flexShrink={0}
          href={props.link}
          ms='6'
          bg='blackAlpha.300'
          color='whiteAlpha.900'
          fontWeight='semibold'
          px='3'
          py='1'
          rounded='base'
        >
          {props.title}
        </chakra.a>
      </Flex>
    </Center>
  )
}
