import NextDocument, {
  DocumentContext,
  Head,
  Html,
  Main,
  NextScript
} from 'next/document'
import { ColorModeScript } from '@chakra-ui/react'

export default class Document extends NextDocument {
  static getInitialProps (ctx: DocumentContext) {
    return NextDocument.getInitialProps(ctx)
  }

  render () {
    return (
      <Html lang='en'>
        <Head>
          <link
            rel='preload'
            href='/fonts/Inter.woff2'
            as='font'
            type='font/woff2'
            crossOrigin='anonymous'
          />
        </Head>
        <body>
          <ColorModeScript />
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
