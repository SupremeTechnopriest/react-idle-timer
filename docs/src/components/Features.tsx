import { FC, ReactNode } from 'react'
import { useTranslation } from 'next-i18next'
import {
  chakra,
  Box,
  BoxProps,
  Container,
  Grid,
  Flex,
  Icon,
  Heading,
  Text,
  useColorModeValue
} from '@chakra-ui/react'
import { FiActivity } from 'react-icons/fi'
import { IoHourglassOutline } from 'react-icons/io5'
import { GiConfirmed } from 'react-icons/gi'
import { CgTab } from 'react-icons/cg'

interface IFeatureProps extends BoxProps {
  title: string
  link: string
  icon: FC
  children: ReactNode
}

const Feature = ({ title, icon, link, children, ...props }: IFeatureProps) => {
  return (
    <Box
      as='a'
      bg={useColorModeValue('white', 'gray.700')}
      rounded='12px'
      shadow='base'
      p='40px'
      href={link}
      {...props}
    >
      <Flex
        rounded='full'
        w='12'
        h='12'
        bg='red.400'
        align='center'
        justify='center'
      >
        <Icon fontSize='24px' color='white' as={icon} />
      </Flex>
      <Heading as='h3' size='md' fontWeight='semibold' mt='1em' mb='0.5em'>
        {title}
      </Heading>
      <Text fontSize='lg' opacity={0.7}>
        {children}
      </Text>
    </Box>
  )
}

export function Features () {
  const { t } = useTranslation('common')

  return (
    <Box
      as='section'
      py={20}
      bg={useColorModeValue('gray.50', 'gray.900')}
    >
      <Container maxW='1280px'>
        <Box maxW='760px' mx='auto' textAlign='center' mb='56px'>
          <chakra.h2 textStyle='heading' mb='5'>
            {t('homepage.features.title')}
          </chakra.h2>
          <chakra.p opacity={0.7} fontSize='lg'>
            {t('homepage.features.description')}
          </chakra.p>
        </Box>
        <Grid
          templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }}
          gap={10}
          px={{ md: 12 }}
        >
          <Feature
            icon={IoHourglassOutline}
            link='/docs/features/idle-detection'
            title={t('homepage.features.idleDetection.title')}
          >
            {t('homepage.features.idleDetection.description')}
          </Feature>
          <Feature
            icon={FiActivity}
            link='/docs/features/activity-detection'
            title={t('homepage.features.activityDetection.title')}
          >
            {t('homepage.features.activityDetection.description')}
          </Feature>
          <Feature
            icon={GiConfirmed}
            link='/docs/features/confirm-prompt'
            title={t('homepage.features.confirmPrompt.title')}
          >
            {t('homepage.features.confirmPrompt.description')}
          </Feature>
          <Feature
            icon={CgTab}
            link='/docs/features/cross-tab'
            title={t('homepage.features.crossTabSupport.title')}
          >
            {t('homepage.features.crossTabSupport.description')}
          </Feature>
        </Grid>
      </Container>
    </Box>
  )
}
