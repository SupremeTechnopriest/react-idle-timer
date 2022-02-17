import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import il8nConfig from '../../next.i18n.config'

export async function translationProps (locale: string, namespaces: string[]) {
  return serverSideTranslations(locale, namespaces, il8nConfig)
}
