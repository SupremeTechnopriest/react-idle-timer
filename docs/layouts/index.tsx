import { PageContainer } from '@components/PageContainer'
import dynamic from 'next/dynamic'

const MDXLayout = dynamic(() => import('layouts/mdx'))

export default function DefaultLayout ({ children, frontMatter }) {
  const slug = frontMatter?.slug

  const layoutMap = {
    guides: <MDXLayout frontMatter={frontMatter}>{children}</MDXLayout>,
    docs: <MDXLayout frontMatter={frontMatter}>{children}</MDXLayout>,
    changelog: <MDXLayout frontMatter={frontMatter}>{children}</MDXLayout>,
    faq: <MDXLayout frontMatter={frontMatter}>{children}</MDXLayout>,
    default: (
      <PageContainer frontMatter={frontMatter}>{children}</PageContainer>
    )
  }

  const layout = Object.entries(layoutMap).find(([path]) => {
    return slug?.startsWith(`/${path}`)
  })

  if (!layout) return layoutMap.default

  return layout[1]
}
