import { ReactElement, forwardRef, Ref } from 'react'
import { chakra, PropsOf, useColorModeValue } from '@chakra-ui/react'
import NextLink from 'next/link'
import { useRouter } from 'next/router'

const StyledLink = forwardRef(function StyledLink (
  props: PropsOf<typeof chakra.a> & { isActive?: boolean },
  ref: Ref<any>
) {
  const { isActive, ...rest } = props
  const bgActiveHoverColor = useColorModeValue('gray.100', 'whiteAlpha.100')
  const color = useColorModeValue('gray.700', 'whiteAlpha.900')

  return (
    <chakra.a
      aria-current={isActive ? 'page' : undefined}
      width='full'
      px={3}
      py={1}
      ml={2}
      rounded='md'
      ref={ref}
      fontSize='sm'
      fontWeight='500'
      color={color}
      transition='all 0.2s'
      _activeLink={{
        bg: useColorModeValue('red.100', 'red.400'),
        color: useColorModeValue('red.700', 'white'),
        fontWeight: '600'
      }}
      _hover={{
        bg: isActive ? 'red.500' : bgActiveHoverColor,
        color: isActive ? 'whiteAlpha.900' : color
      }}
      {...rest}
    />
  )
})

type SidebarLinkProps = PropsOf<typeof chakra.div> & {
  href?: string
  icon?: ReactElement
}

export const SidebarLink = (props: SidebarLinkProps) => {
  const { href, children, ...rest } = props

  const { asPath } = useRouter()
  const isActive = asPath === href

  return (
    <chakra.div
      userSelect='none'
      display='flex'
      alignItems='center'
      lineHeight='1.5rem'
      {...rest}
    >
      <NextLink href={href} passHref>
        <StyledLink isActive={isActive}>{children}</StyledLink>
      </NextLink>
    </chakra.div>
  )
}
