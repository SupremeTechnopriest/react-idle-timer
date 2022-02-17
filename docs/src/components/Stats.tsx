import { ElementType } from 'react'
import { useTranslation } from 'next-i18next'
import {
  chakra,
  Box,
  BoxProps,
  Container,
  Flex,
  Stack,
  Text,
  Icon,
  SimpleGrid
} from '@chakra-ui/react'

import { FiDownload, FiGithub } from 'react-icons/fi'
import { FaDiscord } from 'react-icons/fa'
import { SiCodeclimate, SiJest } from 'react-icons/si'

interface IStatBoxProps extends BoxProps {
  icon?: ElementType
  title: string
  description: string
}

const StatBox = (props: IStatBoxProps) => {
  const { icon: StatIcon, title, description, ...rest } = props
  return (
    <Flex
      direction='column'
      align={{ base: 'center', md: 'flex-start' }}
      pl={{ base: '0', md: '8' }}
      borderLeft='2px solid'
      borderLeftColor='yellow.200'
      {...rest}
    >
      <Box fontSize={{ base: '4rem', md: '6rem' }} lineHeight='1em' mb='20px'>
        {title}
      </Box>
      <Stack isInline align='center'>
        <Icon as={StatIcon} fontSize='24px' color='white' />
        <Text>{description}</Text>
      </Stack>
    </Flex>
  )
}

interface IStatsProps {
  totalDownloads: string
  monthlyDownloads: string
  githubStars: string
  discordMembers: string
  testCoverage: string
  codeQuality: string
}

export function Stats ({
  totalDownloads,
  monthlyDownloads,
  githubStars,
  discordMembers,
  testCoverage,
  codeQuality
}: IStatsProps) {
  const { t } = useTranslation('common')
  return (
    <Box as='section' bgGradient='linear(to-r,orange.500, pink.500)'>
      <Container py='7.5rem' maxW='1280px' color='white'>
        <Box maxW='760px' mx='auto' textAlign='center' mb='56px'>
          <chakra.h2 textStyle='heading' mb='5'>
            {t('homepage.stats.title')}
          </chakra.h2>
          <chakra.p opacity={0.7} fontSize='lg'>
            {t('homepage.stats.description')}
          </chakra.p>
        </Box>
        <SimpleGrid
          columns={{ base: 1, md: 2 }}
          maxW='880px'
          mx='auto'
          spacing='4rem'
          px={{ md: 12 }}
        >
          <StatBox
            icon={FiDownload}
            title={totalDownloads}
            description={t('homepage.stats.totalDownloads')}
            />
          <StatBox
            icon={FiDownload}
            title={monthlyDownloads}
            description={t('homepage.stats.monthlyDownloads')}
          />
          <StatBox
            icon={FiGithub}
            title={githubStars}
            description={t('homepage.stats.githubStars')}
          />
          <StatBox
            icon={FaDiscord}
            title={discordMembers}
            description={t('homepage.stats.discordMembers')}
          />
          <StatBox
            icon={SiJest}
            title={testCoverage}
            description={t('homepage.stats.testCoverage')}
          />
          <StatBox
            icon={SiCodeclimate}
            title={codeQuality}
            description={t('homepage.stats.codeQuality')}
          />
        </SimpleGrid>
      </Container>
    </Box>
  )
}
