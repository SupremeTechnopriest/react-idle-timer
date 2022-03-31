import { useRouter } from 'next/router'
import { useEffect, useState, useRef, useCallback } from 'react'
import { useIdleTimer, MessageType, workerTimers } from 'react-idle-timer'
import { motion, useMotionValue } from 'framer-motion'
import {
  chakra,
  Box,
  Heading,
  Flex,
  Center,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Button,
  useToast,
  useDisclosure
} from '@chakra-ui/react'
import { formatDistanceToNowStrict } from 'date-fns'
import { ControlDrawer } from '@components/ControlDrawer'

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

export default function Demo () {
  const { query } = useRouter()

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

  const elementRef = useRef()

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
    isPrompted,
    getRemainingTime,
    getElapsedTime,
    getTotalElapsedTime,
    getLastActiveTime,
    getLastIdleTime,
    getTotalActiveTime,
    getTotalIdleTime
  } = useIdleTimer({
    element: elementRef.current,
    timers: workerTimers,
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

  const handler = useCallback((event: string, data?: any): any => {
    switch (event) {
      case 'start':
        setLastEvent('START')
        setLastKey('')
        return start()
      case 'reset':
        setLastEvent('RESET')
        setLastKey('')
        return reset()
      case 'pause':
        if (pause()) {
          setLastEvent('PAUSE')
          setLastKey('')
          return true
        }
        return false
      case 'resume':
        if (resume()) {
          setLastEvent('RESUME')
          setLastKey('')
          return true
        }
        return false
      case 'isIdle': {
        const result = isIdle()
        alert('isIdle', result)
        return result
      }
      case 'isLeader': {
        const result = isLeader()
        alert('isLeader', result)
        return result
      }
      case 'isPrompted': {
        const result = isPrompted()
        alert('isPrompted', result)
        return result
      }
      case 'getRemainingTime': {
        const result = getRemainingTime()
        alert('getRemainingTime', result)
        return result
      }
      case 'getElapsedTime': {
        const result = getElapsedTime()
        alert('getElapsedTime', result)
        return result
      }
      case 'getTotalElapsedTime': {
        const result = getTotalElapsedTime()
        alert('getTotalElapsedTime', result)
        return result
      }
      case 'getLastActiveTime': {
        const result = getLastActiveTime() || new Date()
        alert('getLastActiveTime', `${formatDistanceToNowStrict(result)} ago`)
        return result
      }
      case 'getLastIdleTime': {
        const result = getLastIdleTime() || new Date()
        alert('getLastIdleTime', `${formatDistanceToNowStrict(result)} ago`)
        return result
      }
      case 'getTotalActiveTime': {
        const result = getTotalActiveTime()
        alert('getTotalActiveTime', result)
        return result
      }
      case 'getTotalIdleTime': {
        const result = getTotalIdleTime()
        alert('getTotalIdleTime', result)
        return result
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
  }, [])

  useEffect(() => {
    const messageHandler = (e: MessageEvent) => {
      const { event, data } = e.data
      handler(event, data)
    }

    setInterval(tick, 1000)
    window.addEventListener('message', messageHandler)
    return () => {
      clearInterval(intervalId.current)
      window.removeEventListener('message', messageHandler)
    }
  }, [])

  return (
    <>
      {!query.hideControls && (
        <ControlDrawer
          timeout={timeout}
          setTimeout={data => handler('timeout', data)}
          promptTimeout={promptTimeout}
          setPromptTimeout={data => handler('promptTimeout', data)}
          debounce={debounce}
          setDebounce={data => handler('debounce', data)}
          throttle={throttle}
          setThrottle={data => handler('throttle', data)}
          eventsThrottle={eventsThrottle}
          setEventsThrottle={data => handler('eventsThrottle', data)}
          startOnMount={startOnMount}
          setStartOnMount={data => handler('startOnMount', data)}
          startManually={startManually}
          setStartManually={data => handler('startManually', data)}
          stopOnIdle={stopOnIdle}
          setStopOnIdle={data => handler('stopOnIdle', data)}
          crossTab={crossTab}
          setCrossTab={data => handler('crossTab', data)}
          emitOnAllTabs={emitOnAllTabs}
          setEmitOnAllTabs={data => handler('emitOnAllTabs', data)}
          setEmitOnSelf={data => handler('emitOnSelf', data)}
          start={() => handler('start')}
          reset={() => handler('reset')}
          pause={() => handler('pause')}
          resume={() => handler('resume')}
          message={data => handler('message', data)}
          isIdle={() => handler('isIdle')}
          isLeader={() => handler('isLeader')}
          isPrompted={() => handler('isPrompted')}
          getRemainingTime={() => handler('getRemainingTime')}
          getElapsedTime={() => handler('getElapsedTime')}
          getTotalElapsedTime={() => handler('getTotalElapsedTime')}
          getLastActiveTime={() => handler('getLastActiveTime')}
          getLastIdleTime={() => handler('getLastIdleTime')}
          getTotalActiveTime={() => handler('getTotalActiveTime')}
          getTotalIdleTime={() => handler('getTotalIdleTime')}
        />
      )}
      <Box
        ref={elementRef}
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
