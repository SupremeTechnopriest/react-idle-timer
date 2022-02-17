import { Box } from '@chakra-ui/react'
import theme from 'prism-react-renderer/themes/nightOwl'
import { CodeContainer } from '@components/mdx/CodeContainer'
import { CopyButton } from '@components/mdx/CopyButton'
import { Highlight } from '@components/mdx/Highlight'
import { Language } from 'prism-react-renderer'

export interface ICodeBlockProps {
  children: {
    props: {
      className?: string
      children: string
      viewLines: boolean
      ln: string
    }
  }
}

export function CodeBlock (props: ICodeBlockProps) {
  const {
    className,
    children,
    viewLines,
    ln
  } = props.children.props

  const language = className?.replace(/language-/, '') as Language
  const rawCode = children.trim()

  return (
    <Box position='relative' zIndex='0'>
      <CodeContainer px='0' overflow='hidden'>
        <Highlight
          codeString={rawCode}
          language={language}
          theme={theme}
          metaString={ln}
          showLines={viewLines}
        />
      </CodeContainer>
      <CopyButton top='4' code={rawCode} />
    </Box>
  )
}
