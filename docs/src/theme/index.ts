import { extendTheme } from '@chakra-ui/react'
import { config } from './config'
import { textStyles } from './textStyles'
import { mdx } from './mdx'

const styles = {
  global: {
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
