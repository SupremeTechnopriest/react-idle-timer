import { Button, ButtonProps, useClipboard } from '@chakra-ui/react'
import { useTranslation } from 'next-i18next'

interface CopyButtonProps extends ButtonProps {
  code: string
}

export function CopyButton ({ code, ...props }: CopyButtonProps) {
  const { hasCopied, onCopy } = useClipboard(code)
  const { t } = useTranslation('common')

  return (
    <Button
      size='sm'
      position='absolute'
      textTransform='uppercase'
      colorScheme='red'
      fontSize='xs'
      height='24px'
      top={0}
      zIndex='1'
      right='1.25em'
      {...props}
      onClick={onCopy}
    >
      {hasCopied
        ? t('copyButton.copied')
        : t('copyButton.copy')}
    </Button>
  )
}
