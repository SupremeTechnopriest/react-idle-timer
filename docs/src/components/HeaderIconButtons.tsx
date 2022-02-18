import {
  HStack,
  Icon,
  IconButton,
  Link,
  useColorMode,
  useColorModeValue
} from '@chakra-ui/react'
import { CgNpm } from 'react-icons/cg'
import { FaMoon, FaSun } from 'react-icons/fa'
import { SiGithub, SiDiscord } from 'react-icons/si'
import config from '@configs/site.config'

interface IHeaderIconButtonsProps {
  alwaysShow?: boolean
}

export function HeaderIconButtons (props: IHeaderIconButtonsProps) {
  const { toggleColorMode: toggleMode } = useColorMode()
  const text = useColorModeValue('dark', 'light')
  const SwitchIcon = useColorModeValue(FaMoon, FaSun)

  const display = { base: props.alwaysShow ? 'flex' : 'none', md: 'flex' }

  return (
    <>
      <HStack
        spacing='5'
        display={display}
        align='center'
      >
        <Link
          isExternal
          aria-label='NPM'
          href={config.package.url}
        >
          <Icon
            as={CgNpm}
            display='block'
            transition='color 0.2s'
            w='5'
            h='5'
            _hover={{ color: 'gray.600' }}
          />
        </Link>
        <Link
          isExternal
          aria-label='GitHub'
          href={config.repo.url}
        >
          <Icon
            as={SiGithub}
            display='block'
            transition='color 0.2s'
            w='5'
            h='5'
            _hover={{ color: 'gray.600' }}
          />
        </Link>
        <Link aria-label='Discord' href={config.discord.url}>
          <Icon
            as={SiDiscord}
            display='block'
            transition='color 0.2s'
            w='5'
            h='5'
            _hover={{ color: 'gray.600' }}
          />
        </Link>
      </HStack>
      <IconButton
        size='md'
        fontSize='lg'
        display={display}
        aria-label={`Switch to ${text} mode`}
        variant='ghost'
        color='current'
        ml={3}
        onClick={toggleMode}
        icon={<SwitchIcon />}
      />
    </>
  )
}
