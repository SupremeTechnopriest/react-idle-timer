import { ReactNode } from 'react'
import docsSidebar from '@configs/docs.sidebar.json'
import { PageContainer } from '@components/PageContainer'
import { Pagination } from '@components/Pagination'
import { Sidebar } from '@components/Sidebar'
import { findRouteByPath, removeFromLast } from '@utils/findRouteByPath'
import { getRouteContext } from '@utils/getRouteContext'

export function getRoutes (slug: string) {
  const configMap = {
    '/': docsSidebar
  }

  const [, sidebar] =
    Object.entries(configMap).find(([path]) => slug.startsWith(path)) ?? []

  return sidebar?.routes ?? []
}

interface MDXLayoutProps {
  frontMatter: any
  children: ReactNode
}

export default function MDXLayout (props: MDXLayoutProps) {
  const { frontMatter, children } = props
  const routes = getRoutes(frontMatter.slug)

  const route = findRouteByPath(removeFromLast(frontMatter.slug, '#'), routes)
  const routeContext = getRouteContext(route, routes)

  return (
    <PageContainer
      frontMatter={frontMatter}
      sidebar={<Sidebar routes={routes} />}
      pagination={
        <Pagination
          next={routeContext.nextRoute}
          previous={routeContext.prevRoute}
        />
      }
    >
      {children}
    </PageContainer>
  )
}
