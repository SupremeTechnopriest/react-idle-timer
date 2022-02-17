import { ElementType, FC } from 'react'
import {
  VStack,
  Icon,
  Text,
  Stack,
  Link
} from '@chakra-ui/react'
import { useTranslation } from 'next-i18next'
import { IoLogoInstagram, IoLogoLinkedin } from 'react-icons/io'
import { FaHeart } from 'react-icons/fa'
import { MdEmail } from 'react-icons/md'
import { DiGithubBadge } from 'react-icons/di'

type FooterLinkProps = {
  icon?: ElementType
  href?: string
  label?: string
}

export const FooterLink: FC<FooterLinkProps> = ({ icon, href, label }) => (
  <Link display='inline-block' href={href} aria-label={label} isExternal>
    <Icon as={icon} fontSize='xl' color='gray.400' />
  </Link>
)

const links = [
  {
    icon: DiGithubBadge,
    label: 'GitHub',
    href: 'https://github.com/supremetechnopriest'
  },
  {
    icon: IoLogoLinkedin,
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/randy-lebeau-10791729'
  },
  {
    icon: IoLogoInstagram,
    label: 'Instagram',
    href: 'https://www.instagram.com/randylebeau'
  },
  {
    icon: MdEmail,
    label: 'Email',
    href: 'mailto:randylebeau@gmail.com'
  }
]

export const Footer = () => {
  const { t } = useTranslation('common')
  return (
    <VStack as='footer' spacing={4} mt={12} textAlign='center'>
      <Text fontSize='sm'>
        <span>
          {t('footer.madeWith')}
          <Icon as={FaHeart} w='4' h='4' color='red.500' mx='2' />
        </span>
        <span>by Randy Lebeau</span>
      </Text>
      <Stack mt={4} direction='row' spacing='12px' justify='center'>
        {links.map((link) => (
          <FooterLink key={link.href} {...link} />
        ))}
      </Stack>
    </VStack>
  )
}
