import { useScrollSpy } from '@hooks/useScrollSpy'
import {
  chakra,
  Box,
  ListItem,
  OrderedList,
  Text,
  useColorModeValue,
  BoxProps
} from '@chakra-ui/react'
import { IHeading } from '@components/PageContainer'
import { useTranslation } from 'next-i18next'

interface ITableOfContentsProps extends BoxProps {
  headings: IHeading[]
}

export function TableOfContents (props: ITableOfContentsProps) {
  const { t } = useTranslation('common')
  const { headings, ...rest } = props
  const activeId = useScrollSpy(
    headings.map(({ id }) => `[id="${id}"]`),
    {
      rootMargin: '0% 0% -24% 0%'
    }
  )
  const linkColor = useColorModeValue('gray.600', 'gray.400')
  const linkActiveColor = useColorModeValue('red.500', 'red.400')
  const linkHoverColor = useColorModeValue('red.600', 'red.500')
  return (
    <Box
      as='nav'
      aria-labelledby='toc-title'
      width='16rem'
      flexShrink={0}
      display={{ base: 'none', xl: 'block' }}
      position='sticky'
      py='10'
      pr='4'
      top='6rem'
      right='0'
      fontSize='sm'
      alignSelf='start'
      maxHeight='calc(100vh - 8rem)'
      overflowY='auto'
      sx={{ overscrollBehavior: 'contain' }}
      {...rest}
    >
      <Text
        as='h2'
        id='toc-title'
        textTransform='uppercase'
        fontWeight='bold'
        fontSize='xs'
        color={useColorModeValue('gray.700', 'gray.400')}
        letterSpacing='wide'
      >
        {t('tableOfContents.onThisPage')}
      </Text>
      <OrderedList spacing={1} ml='0' mt='4' styleType='none'>
        {headings.map(({ id, text, level }) => (
          <ListItem key={id} title={text} ml={level === 'h3' ? '4' : undefined}>
            <chakra.a
              py='1'
              display='block'
              fontWeight={id === activeId ? 'bold' : 'medium'}
              href={`#${id}`}
              aria-current={id === activeId ? 'location' : undefined}
              color={id === activeId ? linkActiveColor : linkColor}
              _hover={{
                color: linkHoverColor
              }}
            >
              {text}
            </chakra.a>
          </ListItem>
        ))}
      </OrderedList>
    </Box>
  )
}
