import { useTranslation } from 'next-i18next'
import {
  chakra,
  Box,
  Container,
  Wrap,
  Tooltip,
  useColorModeValue
} from '@chakra-ui/react'
import { ChakraNextImage } from '@components/ChakraNextImage'
import { ISponsor } from '@components/Sponsors'

interface IUsedByProps {
  usedBy: ISponsor[]
}

export function UsedBy (props: IUsedByProps) {
  const { t } = useTranslation('common')
  const filter = useColorModeValue(
    'invert(79%) sepia(12%) saturate(435%) hue-rotate(174deg) brightness(88%) contrast(82%)',
    'invert(33%) sepia(10%) saturate(1165%) hue-rotate(179deg) brightness(88%) contrast(83%)'
  )

  return (
    <Box
      as='section'
      py={20}
      bg={useColorModeValue('gray.50', 'gray.900')}
    >
      <Container maxW='1280px'>
        <Box maxW='760px' mx='auto' textAlign='center' mb='56px'>
          <chakra.h2 textStyle='heading' mb='5'>
            {t('homepage.usedBy.title')}
          </chakra.h2>
          <chakra.p opacity={0.7} fontSize='lg'>
            {t('homepage.usedBy.description')}
          </chakra.p>
        </Box>
        <Wrap justify='center'>
          {props.usedBy.map(sponsor => (
            <Tooltip
              hasArrow
              label={sponsor.name}
              key={sponsor.name}
            >
              <Box
                  as='a'
                  target='_blank'
                  href={sponsor.website}
                >
                <ChakraNextImage
                  alt={sponsor.name}
                  src={sponsor.image}
                  filter={filter}
                  height={100}
                  width={300}
                  loading='lazy'
                />
              </Box>
            </Tooltip>
          ))}
        </Wrap>
      </Container>
    </Box>
  )
}
