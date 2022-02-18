import { useRef, useEffect, useState } from 'react'
import NextLink from 'next/link'
import {
  Box,
  chakra,
  Flex,
  HTMLChakraProps,
  useDisclosure,
  useUpdateEffect,
  useColorModeValue
} from '@chakra-ui/react'
import { useViewportScroll } from 'framer-motion'

import { Logo, LogoIcon } from '@components/Logo'
import { SponsorButton } from '@components/SponsorButton'
import { MobileNavButton, MobileNavContent } from '@components/MobileNav'
import { HeaderIconButtons } from '@components/HeaderIconButtons'

function HeaderContent () {
  const mobileNav = useDisclosure()
  const mobileNavBtnRef = useRef<HTMLButtonElement>()

  useUpdateEffect(() => {
    mobileNavBtnRef.current?.focus()
  }, [mobileNav.isOpen])

  return (
    <>
      <Flex w='100%' h='100%' px='6' align='center' justify='space-between'>
        <Flex align='center' wrap='nowrap' w='full'>
          <NextLink href='/' passHref>
            <chakra.a display='block' aria-label='Back Home'>
              <Logo display={{ base: 'none', md: 'block' }} />
              <Box minW='3rem' display={{ base: 'block', md: 'none' }}>
                <LogoIcon />
              </Box>
            </chakra.a>
          </NextLink>
        </Flex>

        <Flex
          justify='flex-end'
          w='100%'
          align='center'
          color='gray.400'
          maxW='1100px'
        >
          <HeaderIconButtons />
          <SponsorButton ml='5' />
          <MobileNavButton
            ref={mobileNavBtnRef}
            aria-label='Open Menu'
            onClick={mobileNav.onOpen}
            ml={5}
          />
        </Flex>
      </Flex>
      <MobileNavContent isOpen={mobileNav.isOpen} onClose={mobileNav.onClose} />
    </>
  )
}

export function Header (props: HTMLChakraProps<'header'>) {
  const bg = useColorModeValue('white', 'gray.800')
  const ref = useRef<HTMLHeadingElement>()
  const [y, setY] = useState(0)
  const { height = 0 } = ref.current?.getBoundingClientRect() ?? {}

  const { scrollY } = useViewportScroll()
  useEffect(() => {
    return scrollY.onChange(() => setY(scrollY.get()))
  }, [scrollY])

  return (
    <chakra.header
      ref={ref}
      shadow={y > height ? 'sm' : undefined}
      transition='box-shadow 0.2s, background-color 0.2s'
      pos='sticky'
      top='0'
      zIndex='3'
      bg={bg}
      left='0'
      right='0'
      width='full'
      {...props}
    >
      <chakra.div height='4.5rem' mx='auto' maxW='8xl'>
        <HeaderContent />
      </chakra.div>
    </chakra.header>
  )
}
