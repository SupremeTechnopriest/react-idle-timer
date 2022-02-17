import { ReactElement } from 'react'
import { isObject } from '@chakra-ui/utils'
import { InlineCode } from '@components/mdx/InlineCode'

function toInlineCode (input: string) {
  return input
    .split(/(`\w+`)/)
    .map((chunk) =>
      chunk.startsWith('`') && chunk.endsWith('`')
        ? (
            <InlineCode key={chunk}>
              {chunk.slice(1, -1)}
            </InlineCode>
          )
        : (
            chunk
          )
    )
}

export function convertBackticks (input?: string | ReactElement) {
  if (!input) return ''
  return isObject(input) ? input : toInlineCode(input)
}
