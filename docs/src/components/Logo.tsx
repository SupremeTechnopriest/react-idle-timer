import { useRef } from 'react'
import {
  chakra,
  Box,
  BoxProps,
  Flex,
  Heading,
  HTMLChakraProps
} from '@chakra-ui/react'

export function Logo (props: BoxProps) {
  return (
    <Box {...props}>
      <Flex align='center' w='full'>
        <LogoIcon mr={4} />
        <Heading>IdleTimer</Heading>
      </Flex>
    </Box>
  )
}

let pool = 0

export const LogoIcon = (props: HTMLChakraProps<'svg'>) => {
  const id = useRef<number>(pool++)
  return (
    <chakra.svg
      height='8'
      width='8'
      viewBox='0 0 512 512'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      {...props}
    >
      <defs>
        <linearGradient x1='50%' y1='0%' x2='50%' y2='100%' id={`linearGradient-1-${id.current}`}>
          <stop stopColor='#FF8126' offset='0%'></stop>
          <stop stopColor='#FF117E' offset='100%'></stop>
        </linearGradient>
        <linearGradient x1='75.7684497%' y1='21.7295259%' x2='24.1162556%' y2='73.1245675%' id={`linearGradient-5-${id.current}`}>
          <stop stopColor='#000000' stopOpacity='0.1' offset='0%'></stop>
          <stop stopColor='#000000' stopOpacity='0' offset='100%'></stop>
        </linearGradient>
        <linearGradient x1='23.7033177%' y1='77.2074557%' x2='76.315094%' y2='27.8209261%' id={`linearGradient-6-${id.current}`}>
          <stop stopColor='#000000' stopOpacity='0.1' offset='0%'></stop>
          <stop stopColor='#000000' stopOpacity='0' offset='100%'></stop>
        </linearGradient>
      </defs>
      <rect fill={`url(#linearGradient-1-${id.current})`} x='0' y='0' width='512' height='512' rx='100'></rect>
      <g transform='translate(122.774566, 104.299723)'>
        <path d='M0,22.554617 C31.2472014,7.51820566 75.2940578,0 132.140569,0 C188.98708,0 234.090513,7.51820566 267.450867,22.554617 L133.725434,154.459559 L0,291.37355 C21.7063997,309.124517 65.753256,318 132.140569,318 C198.527882,318 243.631315,309.124517 267.450867,291.37355 L0,22.554617 Z' id='Shape' stroke='#FFFFFF' strokeWidth='45' strokeLinecap='round' strokeLinejoin='round'></path>
        <path d='M0,22.554617 C31.2472014,7.51820566 75.2940578,-5.68434189e-14 132.140569,-5.68434189e-14 C188.98708,-5.68434189e-14 234.090513,7.51820566 267.450867,22.554617 L133.725434,154.459559 L0,291.37355 C21.7063997,309.124517 65.753256,318 132.140569,318 C198.527882,318 243.631315,309.124517 267.450867,291.37355 L0,22.554617 Z' id='Shape' stroke='#FFFFFF' strokeWidth='45' strokeLinecap='round' strokeLinejoin='round'></path>
        <polygon fill={`url(#linearGradient-2-${id.current})`} points='100.897541 155.866388 132.639432 187.776384 105.336038 215.731427 72.2940679 185.147884'></polygon>
        <polygon fill={`url(#linearGradient-3-${id.current})`} points='164.357574 155.849872 132.620973 123.948157 161.024188 95.9333737 193.726368 126.882466'></polygon>
      </g>
    </chakra.svg>
  )
}
