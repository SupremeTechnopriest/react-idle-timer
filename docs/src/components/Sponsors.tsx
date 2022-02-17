import { useTranslation } from 'next-i18next'
import {
  chakra,
  Box,
  Container,
  Text,
  Stack,
  Icon,
  LightMode,
  Button,
  Wrap,
  WrapItem,
  Circle,
  Tooltip
} from '@chakra-ui/react'
import { FaGithub } from 'react-icons/fa'
import { ChakraNextImage } from '@components/ChakraNextImage'

export interface ISponsor {
  name: string
  image: string
  website?: string
}

interface ISponsorsProps {
  individuals: ISponsor[]
  organizations: ISponsor[]
}

export function Sponsors ({ individuals, organizations }: ISponsorsProps) {
  const { t } = useTranslation('common')
  return (
    <Box bgGradient='linear(to-r,orange.500, pink.500)'>
      <Container py='120px' maxW='1200px' px='32px' color='white'>
        <Box maxW='560px' mx='auto' textAlign='center' mb='56px'>
          <chakra.h2 textStyle='heading' mb='4'>
            {t('homepage.sponsor.title')}
          </chakra.h2>
          <Text fontSize='lg' opacity={0.7}>
            {t('homepage.sponsor.description')}
          </Text>
        </Box>

        <Stack
          direction={{ base: 'column', md: 'row' }}
          spacing='6'
          maxW='600px'
          mx='auto'
          bg='white'
          color='gray.800'
          shadow='md'
          rounded='lg'
          p='6'
        >
          <Stack flex='1' isInline spacing='6' pr={{ base: 0, md: '4' }}>
            <Icon h='40px' w='40px' as={FaGithub} />
            <Box flex='1'>
              <Text fontSize='lg' fontWeight='bold' mt='-1'>
                Github Sponsors
              </Text>
              <Text opacity={0.7}>
                {t(
                  'homepage.sponsor.sponsorTheProject'
                )}
              </Text>
            </Box>
          </Stack>
          <LightMode>
            <Button
              w={{ base: '100%', md: 'auto' }}
              alignSelf='center'
              as='a'
              minW='7rem'
              colorScheme='green'
              href='https://github.com/sponsors/SupremeTechnopriest'
              rel='noopener'
              target='_blank'
            >
              Sponsor
            </Button>
          </LightMode>
        </Stack>

        <Box maxW='600px' mx='auto' textAlign='center'>
          <chakra.p textStyle='caps' mb='8' mt='4rem'>
            {t('homepage.sponsor.organizationSponsors')}
          </chakra.p>
          <Wrap justify='center'>
            {organizations.map((sponsor, i) => (
              <WrapItem key={i}>
                <Tooltip hasArrow label={sponsor.name}>
                  <Circle
                    as='a'
                    href={sponsor.website}
                    target='_blank'
                    rel='noopener'
                    size='80px'
                    bg='gray.50'
                    shadow='lg'
                  >
                    <ChakraNextImage
                      rounded='full'
                      width={56}
                      height={56}
                      alt={sponsor.name}
                      src={sponsor.image}
                      loading='lazy'
                    />
                  </Circle>
                </Tooltip>
              </WrapItem>
            ))}
          </Wrap>

          <chakra.p mb='8' mt='4rem' textStyle='caps'>
            {t('homepage.sponsor.individualSponsors')}
          </chakra.p>
          <Wrap justify='center'>
            {individuals.map((sponsor, i) => (
              <WrapItem key={i}>
                <Tooltip hasArrow label={sponsor.name}>
                  <Box
                    as='a'
                    href={sponsor.website}
                    target='_blank'
                    rel='noopener'
                  >
                    <ChakraNextImage
                      src={sponsor.image}
                      alt={sponsor.name}
                      loading='lazy'
                      rounded='full'
                      width={40}
                      height={40}
                      objectFit='cover'
                    />
                  </Box>
                </Tooltip>
              </WrapItem>
            ))}
          </Wrap>
        </Box>
      </Container>
    </Box>
  )
}
