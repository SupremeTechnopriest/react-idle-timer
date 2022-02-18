import { GetStaticProps } from 'next'
import { useTranslation } from 'next-i18next'
import { Box, Divider } from '@chakra-ui/react'

import { translationProps } from '@utils/i18n'
import { getGithubStars } from '@utils/getGithubStars'
import { getDiscordMembers } from '@utils/getDiscordMembers'
import { getTestCoverage } from '@utils/getTestCoverage'
import { getCodeQuality } from '@utils/getCodeQuality'
import { getUsedBy } from '@utils/getUsedBy'
import { getSponsors } from '@utils/getSponsors'
import {
  getTotalNpmDownloads,
  getMonthlyNpmDownloads
} from '@utils/getNpmDownloads'

import { SEO } from '@components/SEO'
import { Announcer } from '@components/Announcer'
import { Header } from '@components/Header'
import { Hero } from '@components/Hero'
import { Features } from '@components/Features'
import { Stats } from '@components/Stats'
import { Demo } from '@components/Demo'
import { DiscordBar } from '@components/DiscordBar'
import { ISponsor, Sponsors } from '@components/Sponsors'
import { UsedBy } from '@components/UsedBy'
import { Footer } from '@components/Footer'

interface IHomeProps {
  githubStars: string
  totalDownloads: string
  monthlyDownloads: string
  discordMembers: string
  testCoverage: string
  codeQuality: string
  usedBy: {
    organizations: ISponsor[]
  }
  sponsors: {
    individuals: ISponsor[]
    organizations: ISponsor[]
  }
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const [
    { prettyCount: githubStars },
    { prettyCount: totalDownloads },
    { prettyCount: monthlyDownloads },
    { prettyCount: discordMembers },
    { prettyCount: testCoverage },
    { score: codeQuality }
  ] = await Promise.all([
    getGithubStars(),
    getTotalNpmDownloads(),
    getMonthlyNpmDownloads(),
    getDiscordMembers(),
    getTestCoverage(),
    getCodeQuality()
  ])

  const usedBy = await getUsedBy()
  const sponsors = await getSponsors()

  return {
    props: {
      ...(await translationProps(locale, ['common'])),
      githubStars,
      totalDownloads,
      monthlyDownloads,
      discordMembers,
      testCoverage,
      codeQuality,
      usedBy,
      sponsors
    },
    revalidate: 60
  }
}

export default function IndexPage (props: IHomeProps) {
  const { t } = useTranslation('common')
  return (
    <>
      <SEO
        title={t('homepage.seo.title')}
        description={t('homepage.seo.description')}
      />
      <Announcer
        message={t('announcement.message')}
        link={t('announcement.link.href')}
        title={t('announcement.link.title')}
      />
      <Header />
      <Box mb={20}>
        <Hero />
        <Divider />
        <Features />
        <Divider />
        <Stats
          githubStars={props.githubStars}
          totalDownloads={props.totalDownloads}
          monthlyDownloads={props.monthlyDownloads}
          discordMembers={props.discordMembers}
          testCoverage={props.testCoverage}
          codeQuality={props.codeQuality}
        />
        <Divider />
        <Demo />
        <Divider />
        <Sponsors
          organizations={props.sponsors.organizations}
          individuals={props.sponsors.individuals}
        />
        <Divider />
        <UsedBy usedBy={props.usedBy.organizations} />
        <Divider />
        <DiscordBar />
        <Footer />
      </Box>
    </>
  )
}
