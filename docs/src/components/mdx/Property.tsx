import { useTranslation } from 'next-i18next'
import { chakra, Flex, Divider } from '@chakra-ui/react'
import theme from 'prism-react-renderer/themes/nightOwl'
import { Highlight } from '@components/mdx/Highlight'
import { convertBackticks } from '@utils/convertBackticks'

interface IPropertyProps {
  description: string
  type: string
  defaultValue: string
}

export function Property (props: IPropertyProps) {
  const { t } = useTranslation('common')
  return (
    <chakra.div
      css={{
        width: '100%',
        fontSize: '0.95em',
        borderCollapse: 'collapse',
        '.row': {
          minWidth: 100,
          width: '20%',
          fontSize: '0.9em',
          textAlign: 'start',
          fontWeight: 500,
          padding: '4px 16px 4px 8px',
          whiteSpace: 'nowrap',
          verticalAlign: 'baseline'
        },
        '.cell': {
          padding: '4px 0px 4px 8px',
          width: '100%'
        }
      }}
    >
      <Divider pt={4} mb={4} />
      <div>
        {props.description && (
          <Flex>
            <div className='row'>
              {t('propsTable.description')}
            </div>
            <div className='cell'>
              <p>{convertBackticks(props.description)}</p>
            </div>
          </Flex>
        )}
        <Flex>
          <div className='row'>{t('propsTable.type')}</div>
          <div className='cell'>
            <Highlight
              codeString={props.type}
              language='typescript'
              theme={theme}
              showLines={false}
              inline
            />
          </div>
        </Flex>
        {props.defaultValue && (
          <Flex>
            <div className='row'>{t('propsTable.default')}</div>
            <div className='cell'>
              <Highlight
                codeString={props.defaultValue}
                language='typescript'
                theme={theme}
                showLines={false}
                inline
              />
            </div>
          </Flex>
        )}
      </div>
    </chakra.div>
  )
}
