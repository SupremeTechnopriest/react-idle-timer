import { chakra } from '@chakra-ui/react'
import BaseHighlight, {
  defaultProps,
  Language,
  PrismTheme
} from 'prism-react-renderer'
import { liveEditorStyle } from '@components/mdx/CodeBlockStyles'

const RE = /{([\d,-]+)}/

const calculateLinesToHighlight = (meta: string) => {
  if (!RE.test(meta)) {
    return () => false
  }
  const lineNumbers = RE.exec(meta)[1]
    .split(',')
    .map((v) => v.split('-').map((x) => parseInt(x, 10)))

  return (index: number) => {
    const lineNumber = index + 1
    const inRange = lineNumbers.some(([start, end]) =>
      end ? lineNumber >= start && lineNumber <= end : lineNumber === start
    )
    return inRange
  }
}

interface HighlightProps {
  codeString: string
  language: Language
  theme: PrismTheme
  metaString?: string
  showLines?: boolean
  inline?: boolean
}

export function Highlight ({
  codeString,
  language,
  metaString,
  showLines,
  ...props
}: HighlightProps) {
  const shouldHighlightLine = calculateLinesToHighlight(metaString)

  return (
    <BaseHighlight
      {...defaultProps}
      code={codeString}
      language={language}
      {...props}
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <chakra.div style={liveEditorStyle} data-language={language}>
          <pre className={className} style={Object.assign({}, style, { background: props.inline ? 'none' : 'inherit' })}>
            {tokens.map((line, i) => {
              const lineProps = getLineProps({ line, key: i })
              return (
                <chakra.div
                  key={i}
                  px={props.inline ? 0 : 5}
                  bg={shouldHighlightLine(i) ? 'whiteAlpha.200' : undefined}
                  {...lineProps}
                >
                  {showLines && (
                    <chakra.span opacity={0.3} mr='6' fontSize='xs'>
                      {i + 1}
                    </chakra.span>
                  )}
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token, key })} />
                  ))}
                </chakra.div>
              )
            })}
          </pre>
        </chakra.div>
      )}
    </BaseHighlight>
  )
}
