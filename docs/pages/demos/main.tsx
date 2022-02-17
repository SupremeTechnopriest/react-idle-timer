import { useEffect, useState, useRef, useCallback } from 'react'
import { useIdleTimer, MessageType } from 'react-idle-timer'
import { motion, useMotionValue } from 'framer-motion'
import {
  chakra,
  Box,
  Heading,
  Flex,
  Center,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  useToast,
  useDisclosure
} from '@chakra-ui/react'
import { formatDistanceToNowStrict } from 'date-fns'

interface IMotionProps {
  isOpen: boolean
  timeout: number
  promptTimeout: number
  getRemainingTime: () => number
}

function Motion (props: IMotionProps) {
  const height = useMotionValue<number>(1)
  const shouldAnimate = useRef<boolean>(true)

  const tick = useCallback(() => {
    const time = props.isOpen ? props.promptTimeout : props.timeout
    const left = props.getRemainingTime()
    height.set(left / time)
    if (shouldAnimate) {
      window.requestAnimationFrame(tick)
    }
  }, [props.timeout, props.promptTimeout, props.isOpen])

  useEffect(() => {
    shouldAnimate.current = false
    setTimeout(() => {
      shouldAnimate.current = true
      tick()
    })
  }, [props.timeout, props.promptTimeout, props.isOpen])

  return (
    <motion.div
      style={{
        scaleY: height,
        width: 'inherit',
        height: 'inherit',
        background: '#F56565',
        transformOrigin: '50% 100%'
      }}
    />
  )
}

export default function MainDemo () {
  const [timeout, setTimeoutValue] = useState<number>(2000)
  const [promptTimeout, setPromptTimeoutValue] = useState<number>(0)
  const [startOnMount, setStartOnMount] = useState<boolean>(false)
  const [startManually, setStartManually] = useState<boolean>(true)
  const [stopOnIdle, setStopOnIdle] = useState<boolean>(false)
  const [debounce, setDebounce] = useState<number>(0)
  const [throttle, setThrottle] = useState<number>(0)
  const [eventsThrottle, setEventsThrottle] = useState<number>(0)
  const [crossTab, setCrossTab] = useState<boolean>(false)
  const [emitOnAllTabs, setEmitOnAllTabs] = useState<boolean>(false)
  const emitOnSelf = useRef<boolean>(false)

  const [lastEvent, setLastEvent] = useState<string>('INITIAL')
  const [lastKey, setLastKey] = useState<string>('')

  // Prompt Modal
  const { isOpen, onOpen, onClose } = useDisclosure()

  // Toast Alert
  const toast = useToast()
  const alert = (event: string, value: any) => {
    toast({
      render: () => (
        <Box
          color='gray.50'
          bg='gray.800'
          p={4}
          borderRadius={8}
        >
          <Center>{event}{':'} {String(value)}</Center>
        </Box>
      ),
      duration: 2000,
      isClosable: false
    })
  }

  const onIdle = () => {
    setLastEvent('IDLE')
    setLastKey('')
    onClose()
  }

  const onActive = () => {
    setLastEvent('ACTIVE')
    setLastKey('')
    onClose()
  }

  const onAction = (e: Event & MouseEvent & KeyboardEvent) => {
    setLastEvent(e.type.toUpperCase())
    if (e.key) setLastKey(e.key.toUpperCase())
    else if (e.buttons === 1) setLastKey('LEFT')
    else if (e.button === 2) setLastKey('RIGHT')
    else if (e.button === 3) setLastKey('MIDDLE')
    else setLastKey('')
  }

  const onPrompt = () => {
    onOpen()
  }

  const onMessage = (data: MessageType) => {
    console.log(data)
    alert('message', data)
  }

  const {
    start,
    reset,
    pause,
    resume,
    message,
    isIdle,
    isLeader,
    getRemainingTime,
    getElapsedTime,
    getLastActiveTime,
    getLastIdleTime,
    getTotalActiveTime,
    getTotalIdleTime
  } = useIdleTimer({
    startOnMount,
    startManually,
    stopOnIdle,
    timeout,
    promptTimeout,
    debounce,
    throttle,
    eventsThrottle,
    onPrompt,
    onIdle,
    onActive,
    onAction,
    onMessage,
    crossTab,
    emitOnAllTabs
  })

  const closePrompt = () => {
    setLastEvent('RESET')
    setLastKey('')
    reset()
    onClose()
  }

  const intervalId = useRef(null)
  const [remaining, setRemaining] = useState<number>(promptTimeout)

  const tick = useCallback(() => {
    setRemaining(Math.ceil(getRemainingTime() / 1000))
  }, [timeout, promptTimeout, isOpen])

  useEffect(() => {
    clearInterval(intervalId.current)
    setInterval(tick, 1000)
  }, [timeout, promptTimeout, isOpen])

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      const { event, data } = e.data
      switch (event) {
        case 'start':
          start()
          setLastEvent('START')
          setLastKey('')
          break
        case 'reset':
          reset()
          setLastEvent('RESET')
          setLastKey('')
          break
        case 'pause':
          if (pause()) {
            setLastEvent('PAUSE')
            setLastKey('')
          }
          break
        case 'resume':
          if (resume()) {
            setLastEvent('RESUME')
            setLastKey('')
          }
          break
        case 'isIdle': {
          alert('isIdle', isIdle())
          break
        }
        case 'isLeader': {
          alert('isLeader', isLeader())
          break
        }
        case 'getRemainingTime': {
          alert('getRemainingTime', getRemainingTime())
          break
        }
        case 'getElapsedTime': {
          alert('getElapsedTime', getElapsedTime())
          break
        }
        case 'getLastActiveTime': {
          alert('getLastActiveTime', `${formatDistanceToNowStrict(getLastActiveTime())} ago`)
          break
        }
        case 'getLastIdleTime': {
          alert('getLastIdleTime', `${formatDistanceToNowStrict(getLastIdleTime())} ago`)
          break
        }
        case 'getTotalActiveTime': {
          alert('getTotalActiveTime', getTotalActiveTime())
          break
        }
        case 'getTotalIdleTime': {
          alert('getTotalIdleTime', getTotalIdleTime())
          break
        }
        case 'timeout': {
          setTimeoutValue(parseInt(data, 10))
          break
        }
        case 'promptTimeout': {
          const value = parseInt(data, 10)
          setPromptTimeoutValue(value)
          setRemaining(Math.ceil(value / 1000))
          break
        }
        case 'startOnMount': {
          setStartOnMount(data)
          setLastEvent('INITIAL')
          setLastKey('')
          break
        }
        case 'startManually': {
          setStartManually(data)
          setLastEvent('INITIAL')
          setLastKey('')
          break
        }
        case 'stopOnIdle': {
          setStopOnIdle(data)
          break
        }
        case 'debounce': {
          setDebounce(parseInt(data, 10))
          break
        }
        case 'throttle': {
          setThrottle(parseInt(data, 10))
          break
        }
        case 'eventsThrottle': {
          setEventsThrottle(parseInt(data, 10))
          break
        }
        case 'crossTab': {
          setCrossTab(data)
          break
        }
        case 'emitOnAllTabs': {
          setEmitOnAllTabs(data)
          break
        }
        case 'message': {
          message(data, emitOnSelf.current)
          break
        }
        case 'emitOnSelf': {
          emitOnSelf.current = data
          break
        }
        default:
          // No Op
      }
    }

    setInterval(tick, 1000)
    window.addEventListener('message', handler)
    return () => {
      clearInterval(intervalId.current)
      window.removeEventListener('message', handler)
    }
  }, [])

  return (
    <>
      <Box
        bg='gray.700'
        h='100vh'
        p={4}
      >
        <chakra.div
          style={{
            width: '100%',
            height: '100%',
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translateX(-50%) translateY(-50%)'
          }}
        >
          <Flex
            h='full'
            w='full'
            align='center'
            justify='center'
            direction='column'
            pos='absolute'
            zIndex={1}
          >
            <Heading>{lastEvent}</Heading>
            <Heading as='h2' fontSize={20}>{lastKey}</Heading>
          </Flex>
          <Motion
            timeout={timeout}
            promptTimeout={promptTimeout}
            isOpen={isOpen}
            getRemainingTime={getRemainingTime}
          />
        </chakra.div>
      </Box>
      <Modal
        isOpen={isOpen}
        onClose={closePrompt}
        closeOnEsc={false}
        closeOnOverlayClick={false}
      >
        <ModalOverlay />
        <ModalContent borderRadius={0}>
          <ModalHeader>Are you still here?</ModalHeader>
          <ModalBody>
            You will be automatically logged out in {remaining} seconds...
          </ModalBody>
          <ModalFooter>
            <Button colorScheme='red' mr={3} onClick={closePrompt}>
              Continue Session
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
