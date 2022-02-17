import { NextSeo, NextSeoProps } from 'next-seo'
import config from '@configs/site.config'

export interface SEOProps extends Pick<NextSeoProps, 'title' | 'description'> { }

export const SEO = ({ title, description }: SEOProps) => (
  <NextSeo
    title={title}
    description={description}
    openGraph={{ title, description }}
    titleTemplate={config.seo.titleTemplate}
  />
)
