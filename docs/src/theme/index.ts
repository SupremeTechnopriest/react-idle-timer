import { extendTheme } from '@chakra-ui/react'
import { config } from './config'
import { textStyles } from './textStyles'
import { mdx } from './mdx'

const scrollbar = (props: any) => ({
  'body::-webkit-scrollbar': {
    borderRadius: 0
  },
  '::-webkit-scrollbar': {
    borderRadius: 10,
    background: props.colorMode === 'dark' ? 'gray.900' : 'gray.50',
    width: 15
  },
  '::-webkit-scrollbar-button': {},
  '::-webkit-scrollbar-track': {},
  '::-webkit-scrollbar-track-piece': {},
  '::-webkit-scrollbar-thumb': {
    background: props.colorMode === 'dark' ? 'gray.700' : 'gray.100',
    borderRadius: 10,
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: props.colorMode === 'dark' ? 'gray.900' : 'gray.50'
  },
  '::-webkit-scrollbar-corner': {},
  '::-webkit-resizer': {}
})

const styles = {
  global: (props: any) => ({
    ...scrollbar(props),
    ':host,:root': {
      '--chakra-ui-focus-ring-color': '#F56565'
    }
  })
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

const fonts = {
  heading: 'Inter, sans-serif',
  body: 'Inter, sans-serif'
}

export const theme = extendTheme({
  config,
  fonts,
  textStyles,
  mdx,
  styles,
  shadows,
  components
})
