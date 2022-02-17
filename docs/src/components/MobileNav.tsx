import { useEffect, useRef, useState, forwardRef, Ref } from 'react'
import {
  Box,
  BoxProps,
  Flex,
  Spacer,
  IconButton,
  IconButtonProps,
  useBreakpointValue,
  useColorModeValue,
  useUpdateEffect
} from '@chakra-ui/react'
import { AnimatePresence, motion, useElementScroll } from 'framer-motion'
import { useRouteChanged } from '@hooks/useRouteChanged'
import { getRoutes } from 'layouts/mdx'
import { useRouter } from 'next/router'
import { AiOutlineMenu } from 'react-icons/ai'
import { RemoveScroll } from 'react-remove-scroll'
import { LogoIcon } from '@components/Logo'
import { SidebarContent } from '@components/Sidebar'
import { SponsorButton } from '@components/SponsorButton'

interface MobileNavContentProps {
  isOpen?: boolean
  onClose?: () => void
}

export function MobileNavContent (props: MobileNavContentProps) {
  const { isOpen, onClose } = props
  const { pathname } = useRouter()
  const bgColor = useColorModeValue('white', 'gray.800')
  const closeBtnRef = useRef<HTMLButtonElement>()

  useRouteChanged(onClose)

  const showOnBreakpoint = useBreakpointValue({ base: true, lg: false })

  useEffect(() => {
    if (showOnBreakpoint === false) {
      onClose()
    }
  }, [showOnBreakpoint, onClose])

  useUpdateEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        closeBtnRef.current?.focus()
      })
    }
  }, [isOpen])

  const [isLoaded, setLoaded] = useState<boolean>(false)
  useEffect(() => {
    setLoaded(true)
  }, [])

  if (!isLoaded) {
    return <></>
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <RemoveScroll forwardProps>
          <motion.div
            transition={{ duration: 0.08 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Flex
              direction='column'
              bg={bgColor}
              w='100%'
              h='100vh'
              overflow='auto'
              pos='absolute'
              top='0'
              left='0'
              zIndex={20}
              pb='8'
            >
              <Box>
                <Flex justify='flex-end' align='center' px='6' h='4.5rem'>
                  <LogoIcon />
                  <Spacer />
                  <SponsorButton />
                  <Flex>
                    <IconButton
                      ref={closeBtnRef}
                      aria-label='Close Menu'
                      fontSize='20px'
                      color={useColorModeValue('gray.800', 'inherit')}
                      variant='ghost'
                      icon={<AiOutlineMenu />}
                      onClick={onClose}
                      ml={5}
                    />
                  </Flex>
                </Flex>
              </Box>

              <ScrollView>
                <SidebarContent
                  pathname={pathname}
                  routes={getRoutes(pathname)}
                />
              </ScrollView>
            </Flex>
          </motion.div>
        </RemoveScroll>
      )}
    </AnimatePresence>
  )
}

const ScrollView = (props: BoxProps & { onScroll?: any }) => {
  const { onScroll, ...rest } = props
  const [y, setY] = useState(0)
  const elRef = useRef<any>()
  const { scrollY } = useElementScroll(elRef)
  useEffect(() => {
    return scrollY.onChange(() => setY(scrollY.get()))
  }, [scrollY])

  useUpdateEffect(() => {
    onScroll?.(y > 5)
  }, [y])

  return (
    <Box
      ref={elRef}
      flex='1'
      id='routes'
      overflow='auto'
      px='6'
      pb='6'
      {...rest}
    />
  )
}

export const MobileNavButton = forwardRef(
  function MobileNavButton (props: IconButtonProps, ref: Ref<any>) {
    return (
      <IconButton
        ref={ref}
        display={{ base: 'flex', md: 'none' }}
        aria-label='Open menu'
        fontSize='20px'
        color={useColorModeValue('gray.800', 'inherit')}
        variant='ghost'
        icon={<AiOutlineMenu />}
        {...props}
      />
    )
  }
)
