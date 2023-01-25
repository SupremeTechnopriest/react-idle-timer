import { PropsWithChildren } from 'react'
import { Button, Link } from '@chakra-ui/react'
import { FiCodesandbox } from 'react-icons/fi'

export function CodeSandboxButton (props: PropsWithChildren<{ name: string }>) {
  return (
    <Link
      href={`https://codesandbox.io/s/${props.name}`}
      _hover={{ textDecoration: 'none' }}
      isExternal
      mb={2}
    >
      <Button
        variant='ghost'
        leftIcon={<FiCodesandbox />}
        colorScheme='red'
      >
        {props.children}
      </Button>
    </Link>
  )
}
