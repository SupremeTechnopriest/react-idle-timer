import { useEffect, ReactNode } from 'react'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { Badge, Box, chakra, Flex } from '@chakra-ui/react'
import { SkipNavContent, SkipNavLink } from '@chakra-ui/skip-nav'
import { EditPageLink } from '@components/EditPageButton'
import { Footer } from '@components/Footer'
import { SEO } from '@components/SEO'
import { TableOfContents } from '@components/TableOfContents'
import { PageTransition } from '@components/PageTransition'
import oneline from 'oneline'

function useHeadingFocusOnRouteChange () {
  const router = useRouter()

  useEffect(() => {
    const onRouteChange = () => {
      const [heading] = Array.from(document.getElementsByTagName('h1'))
      heading?.focus()
    }
    router.events.on('routeChangeComplete', onRouteChange)
    return () => {
      router.events.off('routeChangeComplete', onRouteChange)
    }
  }, [router.events])
}

export interface IHeading {
  level: 'h2' | 'h3'
  text: string
  id: string
}

interface IPageContainerProps {
  frontMatter: {
    slug?: string
    title: string
    description?: string
    editUrl?: string
    version?: string
    headings?: IHeading[]
  }
  children: ReactNode
  sidebar?: any
  pagination?: any
}

export function PageContainer (props: IPageContainerProps) {
  const { frontMatter, children, sidebar, pagination } = props
  const { t } = useTranslation()
  useHeadingFocusOnRouteChange()

  if (!frontMatter) return <></>

  const { title, description, editUrl, version, headings = [] } = frontMatter

  return (
    <>
      <SEO title={title} description={description} />
      <SkipNavLink zIndex={20}>
        {t('component.page-container.skip-to-content')}
      </SkipNavLink>
      <Box as='main' className='main-content' w='full' maxW='8xl' mx='auto'>
        <Box display={{ md: 'flex' }}>
          {sidebar || null}
          <Box flex='1' minW='0'>
            <SkipNavContent />
            <Box id='content' px={5} mx='auto' minH='76vh'>
              <Flex>
                <Box
                  minW='0'
                  flex='auto'
                  px={{ base: '4', sm: '6', xl: '8' }}
                  pt='10'
                >
                  <PageTransition style={{ maxWidth: '48rem' }}>
                    <chakra.h1 tabIndex={-1} outline={0} apply='mdx.h1'>
                      {oneline`${title}`}
                    </chakra.h1>
                    {version && (
                      <Badge colorScheme='teal' letterSpacing='wider'>
                        v{version}
                      </Badge>
                    )}
                    {children}
                    <Box mt='40px'>
                      <Box>{editUrl && <EditPageLink href={editUrl} />}</Box>
                      {pagination || null}
                    </Box>
                    <Box pb='20'>
                      <Footer />
                    </Box>
                  </PageTransition>
                </Box>
                <TableOfContents
                  visibility={headings.length === 0 ? 'hidden' : 'initial'}
                  headings={headings}
                />
              </Flex>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  )
}
