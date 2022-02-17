import { FC } from 'react'
import { useTranslation } from 'next-i18next'
import { chakra, Icon, Stack, Link } from '@chakra-ui/react'
import { MdEdit } from 'react-icons/md'

export const EditPageLink: FC<{ href?: string }> = ({ href }) => {
  const { t } = useTranslation()
  return (
    <Link href={href} isExternal>
      <Stack
        display='inline-flex'
        direction='row'
        spacing={1}
        align='center'
        opacity={0.7}
      >
        <Icon as={MdEdit} mr='1' />
        <chakra.span>
          {t('component.edit-page-button.edit-this-page')}
        </chakra.span>
      </Stack>
    </Link>
  )
}
