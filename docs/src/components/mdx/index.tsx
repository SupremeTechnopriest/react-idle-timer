import * as Chakra from '@chakra-ui/react'
import { LinkedHeading } from '@components/mdx/LinkedHeading'
import { InlineCode } from '@components/mdx/InlineCode'
import { Anchor } from '@components/mdx/Anchor'
import { Pre } from '@components/mdx/Pre'
import { CodeBlock } from '@components/mdx/CodeBlock'
import { Property } from '@components/mdx/Property'

const { Alert, Box, chakra } = Chakra

export const MDXComponents = {
  ...Chakra,
  h1: (props) => <chakra.h1 apply='mdx.h1' {...props} />,
  h2: (props) => <LinkedHeading apply='mdx.h2' {...props} />,
  h3: (props) => <LinkedHeading as='h3' apply='mdx.h3' pb={2} {...props} />,
  h4: (props) => <LinkedHeading as='h4' apply='mdx.h4' {...props} />,
  hr: (props) => <chakra.hr apply='mdx.hr' {...props} />,
  strong: (props) => <Box as='strong' fontWeight='semibold' {...props} />,
  p: (props) => <chakra.p apply='mdx.p' {...props} />,
  ul: (props) => <chakra.ul apply='mdx.ul' {...props} />,
  ol: (props) => <chakra.ol apply='mdx.ul' {...props} />,
  li: (props) => <chakra.li pb='4px' {...props} />,
  a: Anchor,
  code: InlineCode,
  pre: (props) => {
    if (typeof props.children === 'string') return <Pre {...props} />
    return <CodeBlock {...props} />
  },
  Property,
  br: ({ reset, ...props }) => (
    <Box
      as={reset ? 'br' : undefined}
      height={reset ? undefined : '24px'}
      {...props}
    />
  ),
  blockquote: (props) => (
    <Alert
      mt='4'
      role='none'
      status='info'
      colorScheme='purple'
      variant='left-accent'
      as='blockquote'
      rounded='4px'
      my='1.5rem'
      {...props}
    />
  )
}
