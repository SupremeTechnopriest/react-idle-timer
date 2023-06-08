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
  promptBeforeIdle: number
  getRemainingTime: () => number
}

function Motion (props: IMotionProps) {
  const height = useMotionValue<number>(1)
  const shouldAnimate = useRef<boolean>(true)

  const tick = useCallback(() => {
    const time = props.isOpen ? props.promptBeforeIdle : props.timeout - props.promptBeforeIdle
    const left = props.isOpen
      ? props.getRemainingTime()
      : props.getRemainingTime() - props.promptBeforeIdle

    height.set(left / time)
    if (shouldAnimate) {
      window.requestAnimationFrame(tick)
    }
  }, [props.timeout, props.promptBeforeIdle, props.isOpen])

  useEffect(() => {
    shouldAnimate.current = false
    const tid = setTimeout(() => {
      shouldAnimate.current = true
      tick()
    })

    return () => {
      clearTimeout(tid)
    }
  }, [props.timeout, props.promptBeforeIdle, props.isOpen])

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
  const [promptBeforeIdle, setPromptBeforeIdle] = useState<number>(0)
  const [startOnMount, setStartOnMount] = useState<boolean>(false)
  const [startManually, setStartManually] = useState<boolean>(false)
  const [disabled, setDisabled] = useState<boolean>(false)
  const [stopOnIdle, setStopOnIdle] = useState<boolean>(false)
  const [debounce, setDebounce] = useState<number>(0)
  const [throttle, setThrottle] = useState<number>(0)
  const [eventsThrottle, setEventsThrottle] = useState<number>(0)
  const [crossTab, setCrossTab] = useState<boolean>(false)
  const [syncTimers, setSyncTimers] = useState<number>(0)
  const [leaderElection, setLeaderElection] = useState<boolean>(false)
  const emitOnSelf = useRef<boolean>(false)

  useEffect(() => {
    if (query.timeout) setTimeoutValue(parseInt(query.timeout as string, 10))
    if (query.promptBeforeIdle) setPromptBeforeIdle(parseInt(query.promptBeforeIdle as string, 10))
    if (query.debounce) setDebounce(parseInt(query.debounce as string, 10))
    if (query.throttle) setThrottle(parseInt(query.throttle as string, 10))
    if (query.eventsThrottle) setEventsThrottle(parseInt(query.eventsThrottle as string, 10))
    if (query.syncTimers) setSyncTimers(parseInt(query.syncTimers as string, 10))
    if (query.startOnMount !== undefined && query.startOnMount !== 'false') setStartOnMount(true)
    if (query.startManually !== undefined && query.startManually !== 'false') setStartManually(true)
    if (query.disabled !== undefined && query.disabled !== 'false') setDisabled(true)
    if (query.stopOnIdle !== undefined && query.stopOnIdle !== 'false') setStopOnIdle(true)
    if (query.crossTab !== undefined && query.crossTab !== 'false') setCrossTab(true)
    if (query.emitOnSelf !== undefined && query.emitOnSelf !== 'false') emitOnSelf.current = true
  }, [query])

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
    activate,
    pause,
    resume,
    message,
    isIdle,
    isPrompted,
    isLeader,
    isLastActiveTab,
    getTabId,
    getRemainingTime,
    getElapsedTime,
    getTotalElapsedTime,
    getLastActiveTime,
    getLastIdleTime,
    getIdleTime,
    getTotalActiveTime,
    getActiveTime,
    getTotalIdleTime
  } = useIdleTimer({
    element: elementRef.current,
    timers: workerTimers,
    startOnMount,
    startManually,
    disabled,
    stopOnIdle,
    timeout,
    promptBeforeIdle,
    debounce,
    throttle,
    eventsThrottle,
    onPrompt,
    onIdle,
    onActive,
    onAction,
    onMessage,
    crossTab,
    syncTimers,
    leaderElection
  })

  const closePrompt = () => {
    setLastEvent('RESET')
    setLastKey('')
    reset()
    onClose()
  }

  const intervalId = useRef(null)
  const [remaining, setRemaining] = useState<number>(promptBeforeIdle)

  const tick = useCallback(() => {
    setRemaining(Math.ceil(getRemainingTime() / 1000))
  }, [timeout, promptBeforeIdle, isOpen])

  useEffect(() => {
    clearInterval(intervalId.current)
    setInterval(tick, 1000)
  }, [timeout, promptBeforeIdle, isOpen])

  const handler = useCallback((event: string, data?: any): any => {
    switch (event) {
      case 'start':
        if (start()) {
          setLastEvent('START')
          setLastKey('')
        }
        break
      case 'reset':
        if (reset()) {
          setLastEvent('RESET')
          setLastKey('')
        }
        break
      case 'activate':
        if (activate()) {
          setLastEvent('ACTIVATE')
          setLastKey('')
        }
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
        const result = isIdle()
        alert('isIdle', result)
        return result
      }
      case 'isPrompted': {
        const result = isPrompted()
        alert('isPrompted', result)
        return result
      }
      case 'isLeader': {
        try {
          const result = isLeader()
          alert('isLeader', result)
          return result
        } catch (err) {
          alert('isLeader', err.message)
          return err.message
        }
      }
      case 'isLastActiveTab': {
        try {
          const result = isLastActiveTab()
          alert('isLastActiveTab', result)
          return result
        } catch (err) {
          alert('isLastActiveTab', err.message)
          return err.message
        }
      }
      case 'getTabId': {
        const result = getTabId()
        alert('getTabId', result)
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
      case 'getActiveTime': {
        const result = getActiveTime()
        alert('getActiveTime', result)
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
      case 'getIdleTime': {
        const result = getIdleTime()
        alert('getIdleTime', result)
        return result
      }
      case 'timeout': {
        const value = parseInt(data, 10)
        setTimeoutValue(value)
        setRemaining(Math.ceil(value / 1000))
        break
      }
      case 'promptBeforeIdle': {
        const value = parseInt(data, 10)
        setPromptBeforeIdle(value)
        setRemaining(Math.ceil(value / 1000))
        break
      }
      case 'startOnMount': {
        setStartOnMount(data)
        setLastEvent('INITIAL')
        setLastKey('')
        break
      }
      case 'disabled': {
        setDisabled(data)
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
      case 'syncTimers': {
        setSyncTimers(data)
        break
      }
      case 'leaderElection': {
        setLeaderElection(data)
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
          promptBeforeIdle={promptBeforeIdle}
          setPromptBeforeIdle={data => handler('promptBeforeIdle', data)}
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
          disabled={disabled}
          setDisabled={data => handler('disabled', data)}
          stopOnIdle={stopOnIdle}
          setStopOnIdle={data => handler('stopOnIdle', data)}
          crossTab={crossTab}
          setCrossTab={data => handler('crossTab', data)}
          syncTimers={syncTimers}
          setSyncTimers={setSyncTimers}
          leaderElection={leaderElection}
          setLeaderElection={data => handler('leaderElection', data)}
          emitOnSelf={emitOnSelf.current}
          setEmitOnSelf={data => handler('emitOnSelf', data)}
          start={() => handler('start')}
          reset={() => handler('reset')}
          activate={() => handler('activate')}
          pause={() => handler('pause')}
          resume={() => handler('resume')}
          message={data => handler('message', data)}
          isIdle={() => handler('isIdle')}
          isPrompted={() => handler('isPrompted')}
          isLeader={() => handler('isLeader')}
          isLastActiveTab={() => handler('isLastActiveTab')}
          getTabId={() => handler('getTabId')}
          getRemainingTime={() => handler('getRemainingTime')}
          getElapsedTime={() => handler('getElapsedTime')}
          getTotalElapsedTime={() => handler('getTotalElapsedTime')}
          getLastActiveTime={() => handler('getLastActiveTime')}
          getLastIdleTime={() => handler('getLastIdleTime')}
          getActiveTime={() => handler('getActiveTime')}
          getTotalActiveTime={() => handler('getTotalActiveTime')}
          getIdleTime={() => handler('getIdleTime')}
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
            promptBeforeIdle={promptBeforeIdle}
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
