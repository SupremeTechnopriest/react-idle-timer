import NextLink from 'next/link'
import { Button, Heading, Text, VStack } from '@chakra-ui/react'
import { useTranslation } from 'next-i18next'

import { translationProps } from '@utils/i18n'

import { SEO } from '@components/SEO'
import { Announcer } from '@components/Announcer'
import { Header } from '@components/Header'

export async function getStaticProps ({ locale }) {
  return {
    props: {
      ...(await translationProps(locale, ['common']))
    }
  }
}

export default function NotFoundPage () {
  const { t } = useTranslation('common')
  return (
    <>
      <SEO
        title={t('notFound.title')}
        description={t('notFound.description')}
      />
      <Announcer
        message={t('announcement.message')}
        link={t('announcement.link.href')}
        title={t('announcement.link.title')}
      />
      <Header />
      <VStack
        justify='center'
        spacing='4'
        as='section'
        mt={['20', null, '40']}
        textAlign='center'
      >
        <Heading>{t('notFound.heading')}</Heading>
        <Text fontSize={{ md: 'xl' }}>{t('notFound.message')}</Text>
        <NextLink href='/' passHref>
          <Button
            as='a'
            aria-label='Back to Home'
            colorScheme='red'
            size='lg'
          >
            {t('notFound.back-to-home')}
          </Button>
        </NextLink>
      </VStack>
    </>
  )
}
