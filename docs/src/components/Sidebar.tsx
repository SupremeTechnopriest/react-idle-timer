import { Fragment, useRef } from 'react'
import { useRouter } from 'next/router'
import oneline from 'oneline'
import sortBy from 'lodash/sortBy'
import {
  Badge,
  Box,
  chakra,
  Stack,
  useColorModeValue
} from '@chakra-ui/react'
import { Routes } from '@utils/getRouteContext'
import { SidebarCategory } from '@components/SidebarCategory'
import { SidebarLink } from '@components/SidebarLink'

export type SidebarContentProps = Routes & {
  pathname?: string
  contentRef?: any
}

export function SidebarContent (props: SidebarContentProps) {
  const { routes, pathname, contentRef } = props
  const color = useColorModeValue('gray.700', 'inherit')
  return (
    <>
      {routes.map((lvl1, idx) => {
        return (
          <Fragment key={idx}>
            {lvl1.heading && (
              <chakra.h4
                fontSize='sm'
                fontWeight='bold'
                my='1.25rem'
                textTransform='uppercase'
                letterSpacing='wider'
                color={color}
              >
                {lvl1.title}
              </chakra.h4>
            )}

            {lvl1.routes.map((lvl2, index) => {
              if (!lvl2.routes) {
                return (
                  <SidebarLink ml='-3' mt='2' key={lvl2.path} href={lvl2.path}>
                    {lvl2.title}
                  </SidebarLink>
                )
              }

              const selected = pathname.startsWith(lvl2.path)
              const opened = selected || lvl2.open

              const sortedRoutes = lvl2.sort
                ? sortBy(lvl2.routes, (i) => i.title)
                : lvl2.routes

              return (
                <SidebarCategory
                  contentRef={contentRef}
                  key={lvl2.path + index}
                  title={lvl2.title}
                  selected={selected}
                  opened={opened}
                >
                  <Stack as='ul'>
                    {sortedRoutes.map((lvl3) => (
                      <SidebarLink as='li' key={lvl3.path} href={lvl3.path}>
                        <span>{oneline`${lvl3.title}`}</span>
                        {lvl3.new && (
                          <Badge
                            ml='2'
                            lineHeight='tall'
                            fontSize='10px'
                            variant='solid'
                            colorScheme='purple'
                          >
                            New
                          </Badge>
                        )}
                      </SidebarLink>
                    ))}
                  </Stack>
                </SidebarCategory>
              )
            })}
          </Fragment>
        )
      })}
    </>
  )
}

interface ISidebarProps {
  routes: any
}

export const Sidebar = ({ routes }: ISidebarProps) => {
  const { pathname } = useRouter()
  const ref = useRef<HTMLDivElement>(null)

  return (
    <Box
      ref={ref}
      as='nav'
      aria-label='Main Navigation'
      pos='sticky'
      overscrollBehavior='contain'
      top='6.5rem'
      w='280px'
      h='calc(100vh - 8.125rem)'
      pr='8'
      pb='6'
      pl='6'
      pt='4'
      overflowY='auto'
      className='sidebar-content'
      flexShrink={0}
      display={{ base: 'none', md: 'block' }}
    >
      {/* <MainNavLinkGroup mb='10' /> */}
      <SidebarContent routes={routes} pathname={pathname} contentRef={ref} />
    </Box>
  )
}
