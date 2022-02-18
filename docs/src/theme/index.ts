import { extendTheme } from '@chakra-ui/react'
import { config } from './config'
import { textStyles } from './textStyles'
import { mdx } from './mdx'

const scrollbar = {
  '::-webkit-scrollbar': {
    borderRadius: 10,
    background: 'gray.900',
    width: 15
  },
  '::-webkit-scrollbar-button': {},
  '::-webkit-scrollbar-track': {},
  '::-webkit-scrollbar-track-piece': {},
  '::-webkit-scrollbar-thumb': {
    background: 'gray.700',
    borderRadius: 10,
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: 'gray.900'
  },
  '::-webkit-scrollbar-corner': {},
  '::-webkit-resizer': {}
}

const styles = {
  global: {
    ...scrollbar,
    ':host,:root': {
      '--chakra-ui-focus-ring-color': '#F56565'
    }
  }
}

const shadows = {
  outline: '0 0 0 3px var(--chakra-ui-focus-ring-color)'
}

const components = {
  Input: {
    defaultProps: {
      focusBorderColor: 'red.400'
    }
  }
}

export const theme = extendTheme({
  config,
  textStyles,
  mdx,
  styles,
  shadows,
  components
})
