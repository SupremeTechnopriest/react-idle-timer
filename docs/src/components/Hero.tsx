import NextLink from 'next/link'
import { useTranslation } from 'next-i18next'
import {
  chakra,
  Box,
  Container,
  Stack,
  Text,
  Button,
  useColorModeValue
} from '@chakra-ui/react'

import { FaArrowRight } from 'react-icons/fa'
import { DiGithubBadge, DiNpm } from 'react-icons/di'

import config from '@configs/site.config'

export function Hero () {
  const { t } = useTranslation('common')

  return (
    <Box as='section' pt='6rem' pb='5rem'>
      <Container maxW='xl'>
        <Box textAlign='center'>
          <chakra.h1
            maxW='16ch'
            mx='auto'
            fontSize={{ base: '2.25rem', sm: '3rem', lg: '4rem' }}
            fontFamily='heading'
            letterSpacing='tighter'
            fontWeight='extrabold'
            mb='16px'
            lineHeight='1.2'
          >
            {t('homepage.title.main')}
            <Box
              as='span'
              color={useColorModeValue('red.500', 'red.300')}
            >
              {' '}
              {t('homepage.title.highlighted')}
            </Box>
          </chakra.h1>

          <Text
            maxW='560px'
            mx='auto'
            color={useColorModeValue('gray.500', 'gray.400')}
            fontSize={{ base: 'lg', lg: 'xl' }}
            mt='6'
          >
            {t('homepage.message')}
          </Text>

          <Stack
            mt='10'
            spacing='4'
            justify='center'
            direction={{ base: 'column', sm: 'row' }}
          >
            <NextLink href='/docs/getting-started/installation'>
              <Button
                h='4rem'
                px='40px'
                fontSize='1.2rem'
                as='a'
                size='lg'
                colorScheme='red'
                rightIcon={<FaArrowRight fontSize='0.8em' />}
              >
                {t('homepage.getStarted')}
              </Button>
            </NextLink>
            <Button
              as='a'
              size='lg'
              h='4rem'
              px='40px'
              fontSize='1.2rem'
              href={config.repo.url}
              target='__blank'
              leftIcon={<DiGithubBadge size='1.5em' />}
            >
              GitHub
            </Button>
            <Button
              as='a'
              size='lg'
              h='4rem'
              px='40px'
              fontSize='1.2rem'
              href={config.package.url}
              target='__blank'
              leftIcon={<DiNpm size='1.5em' />}
            >
              NPM
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  )
}
