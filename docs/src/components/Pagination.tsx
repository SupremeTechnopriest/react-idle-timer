import { ReactNode } from 'react'
import NextLink from 'next/link'
import { Link, LinkProps, SimpleGrid, Text, Icon } from '@chakra-ui/react'
import { IoChevronBack, IoChevronForward } from 'react-icons/io5'
import { RouteItem } from '@utils/getRouteContext'

interface IPaginationLinkProps extends LinkProps {
  label: string
  href: string
  children: ReactNode
}

export const PaginationLink = (props: IPaginationLinkProps) => {
  const { label, href, children, ...rest } = props

  return (
    <NextLink href={href} passHref>
      <Link
        _hover={{
          textDecor: 'none'
        }}
        flex='1'
        borderRadius='md'
        {...rest}
      >
        <Text fontSize='sm' px='2'>
          {label}
        </Text>
        <Text mt='1' fontSize='lg' fontWeight='bold' color='red.400'>
          {children}
        </Text>
      </Link>
    </NextLink>
  )
}

interface IPaginationProps {
  previous: RouteItem
  next: RouteItem
}

export const Pagination = ({ previous, next, ...rest }: IPaginationProps) => {
  return (
    <SimpleGrid
      as='nav'
      aria-label='Pagination'
      spacing='40px'
      my='64px'
      columns={2}
      {...rest}
    >
      {previous
        ? (
          <PaginationLink
            textAlign='left'
            label='Previous'
            href={previous.path}
            rel='prev'
          >
            <Icon as={IoChevronBack} mr='1' fontSize='1.2em' />
            {previous.title}
          </PaginationLink>
          )
        : <div />
      }
      {next
        ? (
            <PaginationLink
              textAlign='right'
              label='Next'
              href={next.path}
              rel='next'
            >
              {next.title}
              <Icon as={IoChevronForward} ml='1' fontSize='1.2em' />
            </PaginationLink>
          )
        : <div />
      }
    </SimpleGrid>
  )
}

export default Pagination
