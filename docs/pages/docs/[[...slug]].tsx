import { GetStaticPaths, GetStaticProps } from 'next'
import { useMDXComponent } from 'next-contentlayer/hooks'

import { allDocs } from '.contentlayer/data'
import type { Doc } from '.contentlayer/types'

import { MDXComponents } from '@components/mdx'
import { Announcer } from '@components/Announcer'
import { Header } from '@components/Header'

import { translationProps } from '@utils/i18n'
import Layout from 'layouts'
import { useTranslation } from 'next-i18next'

export const getStaticPaths: GetStaticPaths = async () => {
  const docs = allDocs
    .map((t) => t._raw.flattenedPath.replace('docs/', ''))
    .map((id) => ({ params: { slug: id.split('/') } }))
  return { paths: docs, fallback: false }
}

export const getStaticProps: GetStaticProps = async (ctx) => {
  const params = Array.isArray(ctx.params.slug)
    ? ctx.params.slug
    : [ctx.params.slug]
  const doc = allDocs.find((doc) => doc._id.includes(params.join('/')))
  return {
    props: {
      doc,
      ...(await translationProps(ctx.locale, ['common']))
    }
  }
}

export default function Page ({ doc }: { doc: Doc }) {
  const Component = useMDXComponent(doc.body.code)
  const { t } = useTranslation('common')
  return (
    <>
      <Announcer
        message={t('announcement.message')}
        link={t('announcement.link.href')}
        title={t('announcement.link.title')}
        />
      <Header />
      <Layout frontMatter={doc.frontMatter}>
        <Component components={MDXComponents} />
      </Layout>
    </>
  )
}
