import { fireEvent, renderHook } from '@testing-library/react'
import { sleep, waitFor } from './test.utils'

import { useIdleTimer } from '../src'
import { timers, createMocks } from '../src/utils/timers'

describe('useIdleTimer', () => {
  let props

  const idleTimer = () => {
    return renderHook(() => useIdleTimer(props))
  }

  beforeEach(() => {
    props = {
      timeout: undefined,
      promptTimeout: undefined,
      element: undefined,
      events: undefined,
      timers: undefined,
      immediateEvents: undefined,
      onPresenceChange: undefined,
      onPrompt: undefined,
      onIdle: undefined,
      onActive: undefined,
      onAction: undefined,
      onMessage: undefined,
      debounce: undefined,
      throttle: undefined,
      eventsThrottle: undefined,
      startOnMount: undefined,
      startManually: undefined,
      stopOnIdle: undefined,
      capture: undefined,
      passive: undefined,
      crossTab: undefined,
      name: undefined,
      syncTimers: undefined,
      leaderElection: undefined,
      disabled: undefined
    }
  })

  describe('useIdleTimer', () => {
    describe('lifecycle', () => {
      it('Should unmount before unload', async () => {
        props.crossTab = true
        props.debounce = 200
        props.onAction = jest.fn()
        idleTimer()
        fireEvent.mouseDown(document)
        await sleep(200)
        expect(props.onAction).toHaveBeenCalledTimes(1)
        fireEvent(window, new Event('beforeunload'))
        fireEvent.mouseDown(document)
        await sleep(200)
        expect(props.onAction).toHaveBeenCalledTimes(1)
      })

      it('Should compare sanity check timestamps', () => {
        jest.useFakeTimers()
        props.timeout = 10000
        props.onIdle = jest.fn()
        const start = Date.now()
        const { result } = idleTimer()

        expect(result.current.isIdle()).toBe(false)
        jest.setSystemTime(start + props.timeout)
        fireEvent.focus(document)

        expect(result.current.isIdle()).toBe(true)
        expect(props.onIdle).toHaveBeenCalledTimes(1)
        jest.useRealTimers()
      })
    })

    describe('.props', () => {
      describe('.element', () => {
        it('Should set custom element', async () => {
          props.element = window
          props.timeout = 200
          props.onActive = jest.fn()
          const { result } = idleTimer()
          await waitFor(() => result.current.isIdle())
          fireEvent.mouseDown(props.element)
          expect(props.onActive).toHaveBeenCalledTimes(1)
        })

        it('Should not bind events on parent', async () => {
          props.element = document
          props.timeout = 200
          props.onActive = jest.fn()

          const { result } = idleTimer()
          await waitFor(() => result.current.isIdle())

          fireEvent.mouseDown(window)
          expect(props.onActive).toHaveBeenCalledTimes(0)

          fireEvent.mouseDown(props.element)
          expect(props.onActive).toHaveBeenCalledTimes(1)
        })

        it('Should update dynamically', () => {
          props.element = document
          props.onAction = jest.fn()
          props.eventsThrottle = 0
          props.startOnMount = false

          const { rerender } = idleTimer()
          fireEvent.mouseDown(document)
          expect(props.onAction).toBeCalledTimes(1)

          props.element = window
          rerender()
          fireEvent.mouseDown(window)
          expect(props.onAction).toBeCalledTimes(2)
        })

        it('Should should not start when startManually is set and updated dynamically', () => {
          props.element = document
          props.onAction = jest.fn()
          props.startManually = true
          props.eventsThrottle = 0

          const { rerender, result } = idleTimer()
          result.current.start()
          fireEvent.mouseDown(document)
          expect(props.onAction).toBeCalledTimes(1)

          props.element = window
          rerender()
          fireEvent.mouseDown(window)
          expect(props.onAction).toBeCalledTimes(1)
        })

        it('Should should start immediately when startOnMount is set and updated dynamically', async () => {
          props.element = document
          props.timeout = 200
          props.onAction = jest.fn()
          props.onIdle = jest.fn()
          props.startOnMount = true
          props.eventsThrottle = 0

          const { rerender, result } = idleTimer()
          result.current.start()
          fireEvent.mouseDown(document)
          expect(props.onAction).toBeCalledTimes(1)

          props.element = window
          rerender()

          fireEvent.mouseDown(window)
          expect(props.onAction).toBeCalledTimes(2)

          await waitFor(() => result.current.isIdle())
          expect(props.onIdle).toBeCalledTimes(1)
        })

        it('Should memoize element', () => {
          props.element = window
          props.timeout = 200
          props.startOnMount = false
          props.startManually = true
          props.onAction = jest.fn()
          props.eventsThrottle = 0
          const { result, rerender } = idleTimer()
          result.current.start()
          fireEvent.mouseDown(window)
          expect(props.onAction).toHaveBeenCalledTimes(1)
          props.element = window
          rerender(props)
          fireEvent.mouseDown(window)
          expect(props.onAction).toHaveBeenCalledTimes(2)
        })

        it('Should support undefined element to start', async () => {
          props.element = null
          props.onAction = jest.fn()
          props.eventsThrottle = 0
          props.startOnMount = false

          const { rerender } = idleTimer()

          props.element = window
          rerender()
          fireEvent.mouseDown(window)
          expect(props.onAction).toBeCalledTimes(1)
        })
      })

      describe('.events', () => {
        it('Should set custom events', async () => {
          props.onAction = jest.fn()
          props.events = ['mousedown']
          props.timeout = 200

          idleTimer()

          fireEvent.keyPress(document)
          expect(props.onAction).toHaveBeenCalledTimes(0)

          fireEvent.mouseDown(document)
          expect(props.onAction).toHaveBeenCalledTimes(1)
        })

        it('Should update dynamically', () => {
          props.onAction = jest.fn()
          props.events = ['mousedown']
          props.eventsThrottle = 0

          const { rerender } = idleTimer()
          fireEvent.mouseDown(document)
          expect(props.onAction).toBeCalledTimes(1)

          props.events = ['keypress']
          rerender(props)

          fireEvent.mouseDown(document)
          fireEvent.keyPress(document)
          fireEvent.keyPress(document)
          expect(props.onAction).toBeCalledTimes(3)
        })

        it('Should memoize events', async () => {
          props.events = ['mousedown', 'mousemove']
          props.timeout = 200
          props.startOnMount = false
          props.startManually = true
          props.onAction = jest.fn()
          props.eventsThrottle = 0
          const { result, rerender } = idleTimer()
          result.current.start()
          fireEvent.mouseDown(document)
          expect(props.onAction).toHaveBeenCalledTimes(1)
          props.events = ['mousedown', 'mousemove']
          rerender(props)
          fireEvent.mouseDown(document)
          expect(props.onAction).toHaveBeenCalledTimes(2)
        })
      })

      describe('.immediateEvents', () => {
        it('Should call idle immediately on immediate event', () => {
          props.immediateEvents = ['mousedown']
          const { result } = idleTimer()
          fireEvent.mouseDown(document)
          expect(result.current.isIdle()).toBe(true)
        })

        it('Should concat events', () => {
          props.eventsThrottle = 0
          props.events = ['mousemove']
          props.immediateEvents = ['mousedown']
          props.startOnMount = false
          const { result } = idleTimer()
          fireEvent.mouseMove(document)
          expect(result.current.isIdle()).toBe(false)
          fireEvent.mouseDown(document)
          expect(result.current.isIdle()).toBe(true)
        })

        it('Should update dynamically', () => {
          props.eventsThrottle = 0
          const { result, rerender } = idleTimer()
          fireEvent.mouseDown(document)
          expect(result.current.isIdle()).toBe(false)
          props.immediateEvents = ['mousedown']
          rerender()
          fireEvent.mouseDown(document)
          expect(result.current.isIdle()).toBe(true)
        })

        it('Should memoize element', () => {
          props.events = ['keydown']
          props.immediateEvents = ['mousedown']
          props.timeout = 200
          props.startOnMount = false
          props.startManually = true
          props.onAction = jest.fn()
          props.eventsThrottle = 0
          const { result, rerender } = idleTimer()
          result.current.start()
          fireEvent.mouseDown(document)
          expect(props.onAction).toHaveBeenCalledTimes(1)
          props.immediateEvents = ['mousedown']
          rerender(props)
          fireEvent.mouseDown(document)
          expect(props.onAction).toHaveBeenCalledTimes(2)
        })
      })

      describe('.timeout', () => {
        it('Should not allow an overflowed value', () => {
          props.timeout = 2147483648

          expect(() => idleTimer()).toThrow(
            new Error('❌ The value for the timeout property must fit in a 32 bit signed integer, 2147483647.')
          )
        })

        it('Should update timeout dynamically', async () => {
          props.onIdle = jest.fn()
          props.timeout = 200
          const { rerender, result } = idleTimer()

          await waitFor(() => result.current.isIdle())
          expect(props.onIdle).toHaveBeenCalledTimes(1)

          props.timeout = 400
          rerender()

          await waitFor(() => result.current.isIdle())
          expect(result.current.getTotalActiveTime()).toBeAround(600, 30)
          expect(props.onIdle).toHaveBeenCalledTimes(2)
        })

        it('Should call active on manager when timeout is updated', async () => {
          props.onIdle = jest.fn()
          props.onActive = jest.fn()
          props.timeout = 200
          props.crossTab = true
          const { rerender, result } = idleTimer()

          await waitFor(() => result.current.isIdle())
          expect(props.onIdle).toHaveBeenCalledTimes(1)

          props.timeout = 400
          rerender()

          await waitFor(() => result.current.isIdle())
          expect(result.current.getTotalActiveTime()).toBeAround(600, 30)
          expect(props.onIdle).toHaveBeenCalledTimes(2)
          expect(props.onActive).toHaveBeenCalledTimes(2)
        })

        it('Should update when started manually', async () => {
          props.timeout = 400
          props.startOnMount = false
          props.startManually = true
          props.stopOnIdle = true
          const { result, rerender } = idleTimer()
          result.current.pause()
          expect(result.current.isIdle()).toBe(false)
          props.timeout = 200
          rerender(props)
          result.current.start()
          expect(result.current.isIdle()).toBe(false)
          await sleep(200)
          expect(result.current.isIdle()).toBe(true)
        })

        it('Should call onActive if timeout changes while idle', async () => {
          props.onIdle = jest.fn()
          props.onActive = jest.fn()
          props.timeout = 200
          const { rerender, result } = idleTimer()

          await waitFor(() => result.current.isIdle())
          expect(props.onIdle).toHaveBeenCalledTimes(1)

          props.timeout = 400
          rerender()

          await waitFor(() => result.current.isIdle())
          expect(props.onActive).toHaveBeenCalledTimes(1)
          expect(props.onIdle).toHaveBeenCalledTimes(2)
        })

        it('Should not call onActive if timeout changes while active', () => {
          props.onActive = jest.fn()
          props.timeout = 200

          const { rerender } = idleTimer()
          props.timeout = 400
          rerender()

          expect(props.onActive).toHaveBeenCalledTimes(0)
        })
      })

      describe('.promptTimeout', () => {
        it('Should throw a deprecation warning to the console', () => {
          const warn = jest.spyOn(console, 'warn')
          props.promptTimeout = 200

          idleTimer()
          expect(warn).toHaveBeenCalledWith('⚠️ IdleTimer -- The `promptTimeout` property has been deprecated in favor of `promptBeforeIdle`. It will be removed in the next major release.')
        })

        it('Should not allow an overflowed value', () => {
          props.promptTimeout = 2147483648

          expect(() => idleTimer()).toThrowError(
            new Error('❌ The value for the promptTimeout property must fit in a 32 bit signed integer, 2147483647.')
          )
        })

        it('Should call idle after prompt duration', async () => {
          props.timeout = 200
          props.promptTimeout = 200
          props.onPrompt = jest.fn()
          props.onIdle = jest.fn()

          const { result } = idleTimer()
          await sleep(200)
          expect(props.onPrompt).toHaveBeenCalledTimes(1)
          await waitFor(() => result.current.isIdle())
          expect(props.onIdle).toHaveBeenCalledTimes(1)
        })

        it('Should update dynamically', async () => {
          props.timeout = 200
          props.promptTimeout = 400
          props.onPrompt = jest.fn()
          props.onIdle = jest.fn()

          const { rerender } = idleTimer()
          props.promptTimeout = 200
          rerender()

          await sleep(200)
          expect(props.onPrompt).toHaveBeenCalledTimes(1)
          await sleep(200)
          expect(props.onIdle).toHaveBeenCalledTimes(1)
        })
      })

      describe('.promptBeforeIdle', () => {
        it('Should not allow promptTimeout to be set', () => {
          props.timeout = 400
          props.promptTimeout = 100
          props.promptBeforeIdle = 100

          expect(() => idleTimer()).toThrowError(
            new Error('❌ Both promptTimeout and promptBeforeIdle can not be set. The promptTimeout property will be deprecated in a future version.')
          )
        })

        it('Should not allow an overflowed value', () => {
          props.promptBeforeIdle = 2147483648

          expect(() => idleTimer()).toThrowError(
            new Error('❌ The value for the promptBeforeIdle property must fit in a 32 bit signed integer, 2147483647.')
          )
        })

        it('Should not allow an value greater than or equal to timeout', () => {
          props.promptBeforeIdle = 1000
          props.timeout = 1000

          expect(() => idleTimer()).toThrowError(
            new Error('❌ The value for the promptBeforeIdle property must be less than the timeout property, 1000.')
          )
        })

        it('Should call idle after prompt duration', async () => {
          props.timeout = 400
          props.promptBeforeIdle = 100
          props.onPrompt = jest.fn()
          props.onIdle = jest.fn()

          const { result } = idleTimer()
          await sleep(300)
          expect(props.onPrompt).toHaveBeenCalledTimes(1)
          await waitFor(() => result.current.isIdle())
          expect(props.onIdle).toHaveBeenCalledTimes(1)
        })

        it('Should update dynamically', async () => {
          props.timeout = 600
          props.promptBeforeIdle = 300
          props.onPrompt = jest.fn()
          props.onIdle = jest.fn()

          const { rerender } = idleTimer()
          await sleep(300)
          expect(props.onPrompt).toHaveBeenCalledTimes(1)

          props.promptBeforeIdle = 200
          rerender()

          await sleep(400)
          expect(props.onPrompt).toHaveBeenCalledTimes(2)
          await sleep(200)
          expect(props.onIdle).toHaveBeenCalledTimes(1)
        })
      })

      describe('.startOnMount', () => {
        it('Should start immediately when set', () => {
          props.startOnMount = true
          const { result } = idleTimer()
          expect(result.current.isIdle()).toBe(false)
        })

        it('Should not start when startOnMount not set', () => {
          props.startOnMount = false
          const { result } = idleTimer()
          expect(result.current.isIdle()).toBe(false)
        })

        it('Should start on first event', async () => {
          props.startOnMount = false
          props.onActive = jest.fn()
          const { result } = idleTimer()
          expect(props.onActive).toHaveBeenCalledTimes(0)
          expect(result.current.isIdle()).toBe(false)
          fireEvent.mouseDown(document)
          expect(props.onActive).toHaveBeenCalledTimes(1)
        })

        it('Should update dynamically', async () => {
          props.timeout = 200
          props.startOnMount = false
          props.onIdle = jest.fn()
          props.onActive = jest.fn()

          const { result, rerender } = idleTimer()
          expect(result.current.isIdle()).toBe(false)
          expect(props.onIdle).toHaveBeenCalledTimes(0)
          expect(props.onActive).toHaveBeenCalledTimes(0)

          props.startOnMount = true
          rerender()

          expect(result.current.isIdle()).toBe(false)
          expect(props.onIdle).toHaveBeenCalledTimes(0)
          expect(props.onActive).toHaveBeenCalledTimes(0)

          result.current.start()
          await waitFor(() => result.current.isIdle())
          expect(props.onIdle).toHaveBeenCalledTimes(1)

          fireEvent.mouseDown(document)
          expect(props.onActive).toHaveBeenCalledTimes(1)
        })
      })

      describe('.startManually', () => {
        it('Should not start on activity when set', () => {
          props.timeout = 200
          props.startManually = true
          props.onIdle = jest.fn()
          props.onActive = jest.fn()

          const { result } = idleTimer()
          expect(result.current.isIdle()).toBe(false)
          fireEvent.mouseDown(document)

          expect(result.current.isIdle()).toBe(false)
          expect(props.onIdle).toHaveBeenCalledTimes(0)
          expect(props.onActive).toHaveBeenCalledTimes(0)
        })

        it('Should start when start() is called', async () => {
          props.timeout = 200
          props.startManually = true
          props.onIdle = jest.fn()
          props.onActive = jest.fn()

          const { result } = idleTimer()
          result.current.start()
          expect(result.current.isIdle()).toBe(false)

          // Wait for idle
          await waitFor(() => result.current.isIdle())
          expect(props.onIdle).toHaveBeenCalledTimes(1)
          expect(props.onActive).toHaveBeenCalledTimes(0)

          // Fire event
          fireEvent.mouseDown(document)
          expect(props.onActive).toHaveBeenCalledTimes(1)
        })

        it('Should update dynamically', async () => {
          props.timeout = 200
          props.startManually = false
          props.onIdle = jest.fn()
          props.onActive = jest.fn()

          const { result, rerender } = idleTimer()
          expect(result.current.isIdle()).toBe(false)
          expect(props.onIdle).toHaveBeenCalledTimes(0)
          expect(props.onActive).toHaveBeenCalledTimes(0)

          props.startManually = true
          rerender()

          expect(result.current.isIdle()).toBe(false)
          expect(props.onIdle).toHaveBeenCalledTimes(0)
          expect(props.onActive).toHaveBeenCalledTimes(0)

          result.current.start()
          await waitFor(() => result.current.isIdle())
          expect(props.onIdle).toHaveBeenCalledTimes(1)

          fireEvent.mouseDown(document)
          expect(props.onActive).toHaveBeenCalledTimes(1)
        })
      })

      describe('.stopOnIdle', () => {
        it('Should not restart on activity after idle', async () => {
          props.onIdle = jest.fn()
          props.onActive = jest.fn()
          props.timeout = 200
          props.stopOnIdle = true
          const { result } = idleTimer()
          await waitFor(() => result.current.isIdle())
          fireEvent.mouseDown(document)
          expect(props.onIdle).toHaveBeenCalledTimes(1)
          expect(props.onActive).toHaveBeenCalledTimes(0)
          expect(result.current.isIdle()).toBe(true)
        })

        it('Should start on reset() when stopOnIdle is set', async () => {
          props.onIdle = jest.fn()
          props.onActive = jest.fn()
          props.timeout = 200
          props.stopOnIdle = true
          const { result } = idleTimer()
          await waitFor(() => result.current.isIdle())
          fireEvent.mouseDown(document)
          expect(props.onIdle).toHaveBeenCalledTimes(1)
          expect(props.onActive).toHaveBeenCalledTimes(0)
          expect(result.current.isIdle()).toBe(true)
          result.current.reset()
          expect(result.current.isIdle()).toBe(false)
        })

        it('Should go idle after reset() and user input when stopOnIdle is set', async () => {
          props.onIdle = jest.fn()
          props.onActive = jest.fn()
          props.timeout = 200
          props.stopOnIdle = true
          const { result } = idleTimer()
          await waitFor(() => result.current.isIdle())
          fireEvent.mouseDown(document)
          expect(props.onIdle).toHaveBeenCalledTimes(1)
          expect(props.onActive).toHaveBeenCalledTimes(0)
          expect(result.current.isIdle()).toBe(true)
          result.current.reset()
          expect(result.current.isIdle()).toBe(false)
          expect(result.current.getRemainingTime()).toBeAround(props.timeout, 10)
          fireEvent.mouseDown(document)
          await waitFor(() => result.current.isIdle())
          expect(props.onIdle).toHaveBeenCalledTimes(2)
        })

        it('Should be able to be set dynamically', async () => {
          props.onIdle = jest.fn()
          props.onActive = jest.fn()
          props.timeout = 200
          props.stopOnIdle = false
          const { rerender, result } = idleTimer()

          await waitFor(() => result.current.isIdle())
          expect(props.onIdle).toHaveBeenCalledTimes(1)

          fireEvent.mouseDown(document)
          expect(result.current.isIdle()).toBe(false)
          await waitFor(() => result.current.isIdle())
          expect(props.onIdle).toHaveBeenCalledTimes(2)

          props.stopOnIdle = true
          rerender()

          expect(result.current.isIdle()).toBe(true)
          fireEvent.mouseDown(document)
          expect(result.current.isIdle()).toBe(false)
          await waitFor(() => result.current.isIdle())

          fireEvent.mouseDown(document)
          expect(result.current.isIdle()).toBe(true)
          expect(props.onActive).toHaveBeenCalledTimes(2)
        })

        it('Should unbind all events on idle when stopOnIdle is set', async () => {
          props.onAction = jest.fn()
          props.stopOnIdle = true
          props.timeout = 200

          const { result } = idleTimer()
          await waitFor(() => result.current.isIdle())
          fireEvent.mouseDown(document)
          expect(props.onAction).toHaveBeenCalledTimes(0)
        })
      })

      describe('.onPresenceChange', () => {
        it('Should call presence change when idle', async () => {
          props.timeout = 200
          props.onPresenceChange = jest.fn()

          const { result } = idleTimer()
          await waitFor(result.current.isIdle)
          expect(props.onPresenceChange.mock.calls[0][0])
            .toEqual({ type: 'idle' })
        })

        it('Should call presence change when prompted', async () => {
          props.timeout = 200
          props.promptBeforeIdle = 100
          props.onPresenceChange = jest.fn()

          const { result } = idleTimer()
          await waitFor(result.current.isPrompted)
          expect(props.onPresenceChange.mock.calls[0][0])
            .toEqual({ type: 'active', prompted: true })
        })

        it('Should call presence change when active', async () => {
          props.timeout = 200
          props.promptBeforeIdle = 100
          props.onPresenceChange = jest.fn()

          const { result } = idleTimer()
          await waitFor(result.current.isIdle)
          result.current.activate()
          expect(props.onPresenceChange.mock.calls[2][0])
            .toEqual({ type: 'active', prompted: false })
        })

        it('Should reassign event handler', async () => {
          const fn1 = jest.fn()
          const fn2 = jest.fn()
          props.timeout = 200
          props.onPresenceChange = fn1

          const { rerender, result } = idleTimer()
          await waitFor(result.current.isIdle)

          expect(fn1).toHaveBeenCalledTimes(1)
          props.onPresenceChange = fn2
          rerender()

          result.current.reset()
          await waitFor(result.current.isIdle)
          expect(fn1).toHaveBeenCalledTimes(1)
          expect(fn2).toHaveBeenCalledTimes(1)
        })

        it('Should expose IdleTimer API', async () => {
          props.timeout = 200
          props.onPresenceChange = jest.fn()

          const { result } = idleTimer()
          await waitFor(result.current.isIdle)
          expect(props.onPresenceChange.mock.calls[0][1].isIdle).toBeDefined()
        })
      })

      describe('.onPrompt', () => {
        it('Should reset on start and reset', async () => {
          props.timeout = 200
          props.promptTimeout = 200
          props.onPrompt = jest.fn()
          props.onIdle = jest.fn()

          const { result } = idleTimer()
          await sleep(200)
          expect(props.onPrompt).toHaveBeenCalledTimes(1)
          await sleep(100)
          result.current.reset()
          await sleep(200)
          expect(props.onPrompt).toHaveBeenCalledTimes(2)
          result.current.start()
          await sleep(200)
          expect(props.onPrompt).toHaveBeenCalledTimes(3)
          await waitFor(() => result.current.isIdle())
          expect(props.onIdle).toHaveBeenCalledTimes(1)
        })

        it('Should update dynamically', async () => {
          props.timeout = 200
          props.promptTimeout = 200

          const fn1 = jest.fn()
          const fn2 = jest.fn()
          props.onPrompt = fn1

          const { result, rerender } = idleTimer()
          await sleep(200)
          expect(fn1).toHaveBeenCalledTimes(1)

          props.onPrompt = fn2
          rerender()
          result.current.reset()

          await sleep(200)
          expect(fn1).toHaveBeenCalledTimes(1)
          expect(fn2).toHaveBeenCalledTimes(1)
        })

        it('Should expose IdleTimer API', async () => {
          props.timeout = 200
          props.promptTimeout = 200
          props.onPrompt = jest.fn()

          const { result } = idleTimer()
          await waitFor(() => result.current.isIdle())
          expect(props.onPrompt.mock.calls[0][1].isIdle).toBeDefined()
        })
      })

      describe('.onIdle', () => {
        it('Should call onIdle on user idle', async () => {
          props.onIdle = jest.fn()
          props.timeout = 200
          const { result } = idleTimer()
          await waitFor(() => result.current.isIdle())
          expect(props.onIdle).toHaveBeenCalledTimes(1)
        })

        it('Should not call onIdle on larger timeouts', async () => {
          props.onIdle = jest.fn()
          props.timeout = 2147483646
          idleTimer()
          await sleep(100)
          expect(props.onIdle).toHaveBeenCalledTimes(0)
        })

        it('Should allow reassignment of onIdle', async () => {
          const fn1 = jest.fn()
          const fn2 = jest.fn()
          props.onIdle = fn1
          props.timeout = 200
          const { result, rerender } = idleTimer()
          await waitFor(() => result.current.isIdle())
          fireEvent.mouseDown(document)
          expect(fn1).toHaveBeenCalledTimes(1)
          props.onIdle = fn2
          rerender()
          result.current.reset()
          await waitFor(() => result.current.isIdle())
          expect(fn2).toHaveBeenCalledTimes(1)
        })

        it('Should call on idle when device sleep time exceeds timeout', async () => {
          jest.useFakeTimers()
          const now = Date.now()
          props.onIdle = jest.fn()
          props.onPrompt = jest.fn()
          props.onActive = jest.fn()
          props.timeout = 10_000
          props.promptBeforeIdle = 1_000
          const { result } = idleTimer()

          const elapsed = props.timeout * 2
          jest.setSystemTime(now + elapsed)
          jest.advanceTimersByTime(elapsed)

          fireEvent.mouseDown(document)
          expect(props.onPrompt).toHaveBeenCalledTimes(0)
          expect(props.onActive).toHaveBeenCalledTimes(0)
          expect(props.onIdle).toHaveBeenCalledTimes(1)
          expect(result.current.isIdle()).toBe(true)
          jest.useRealTimers()
        })

        it('Should expose IdleTimer API', async () => {
          props.timeout = 200
          props.promptTimeout = 200
          props.onIdle = jest.fn()

          const { result } = idleTimer()
          await waitFor(() => result.current.isIdle())
          expect(props.onIdle.mock.calls[0][1].isIdle).toBeDefined()
        })
      })

      describe('.onActive', () => {
        it('Should call onActive when calling activate() from prompted state', async () => {
          props.timeout = 200
          props.promptTimeout = 400
          props.onActive = jest.fn()

          const { result } = idleTimer()
          await waitFor(() => result.current.isPrompted())

          result.current.activate()
          expect(props.onActive).toHaveBeenCalledTimes(1) // fails
        })

        it('Should call onActive on user input when user is idle', async () => {
          props.onActive = jest.fn()
          props.timeout = 200
          const { result } = idleTimer()
          await waitFor(() => result.current.isIdle())
          fireEvent.mouseDown(document)
          expect(props.onActive).toHaveBeenCalledTimes(1)
        })

        it('Should not call onActive if the state was not previously idle when syncTimers is set', async () => {
          props.timeout = 200
          props.crossTab = true
          props.syncTimers = 500
          props.onActive = jest.fn()
          idleTimer()
          fireEvent.mouseDown(document, props.element)
          expect(props.onActive).not.toHaveBeenCalled()
        })

        it('Should not call onActive on user input when user is not idle', async () => {
          props.onActive = jest.fn()
          props.timeout = 400
          idleTimer()
          await sleep(300)
          fireEvent.mouseDown(document)
          expect(props.onActive).toHaveBeenCalledTimes(0)
        })

        it('Should allow reassignment of onActive', async () => {
          const fn1 = jest.fn()
          const fn2 = jest.fn()
          props.onActive = fn1
          props.timeout = 200
          const { result, rerender } = idleTimer()
          await waitFor(() => result.current.isIdle())
          fireEvent.mouseDown(document)
          expect(fn1).toHaveBeenCalledTimes(1)
          props.onActive = fn2
          rerender()
          await waitFor(() => result.current.isIdle())
          fireEvent.mouseDown(document)
          expect(fn2).toHaveBeenCalledTimes(1)
        })

        it('Should be called when onActive is set', async () => {
          props.timeout = 200
          props.onActive = jest.fn()
          props.onAction = jest.fn()
          props.throttle = 100
          const { result } = idleTimer()
          fireEvent.mouseDown(document)
          expect(props.onAction).toHaveBeenCalledTimes(1)
          await waitFor(result.current.isIdle)
          fireEvent.mouseDown(document)
          expect(props.onAction).toHaveBeenCalledTimes(2)
          expect(props.onActive).toHaveBeenCalledTimes(1)
        })

        it('Should expose IdleTimer API', async () => {
          props.timeout = 200
          props.promptTimeout = 200
          props.onActive = jest.fn()

          const { result } = idleTimer()
          await waitFor(() => result.current.isIdle())
          result.current.activate()
          expect(props.onActive.mock.calls[0][1].isIdle).toBeDefined()
        })
      })

      describe('.onAction', () => {
        it('Should call onAction on user input when user is not idle', async () => {
          props.onAction = jest.fn()
          props.eventsThrottle = 0
          idleTimer()
          fireEvent.mouseDown(document)
          fireEvent.mouseDown(document)
          expect(props.onAction).toHaveBeenCalledTimes(2)
        })

        it('Should call onAction on user input when user is idle', async () => {
          props.timeout = 200
          props.onAction = jest.fn()
          const { result } = idleTimer()
          await waitFor(() => result.current.isIdle())
          fireEvent.mouseDown(document)
          expect(props.onAction).toHaveBeenCalledTimes(1)
        })

        it('Should allow reassignment of onAction', async () => {
          const fn1 = jest.fn()
          const fn2 = jest.fn()
          props.timeout = 200
          props.onAction = fn1
          const { result, rerender } = idleTimer()
          await waitFor(() => result.current.isIdle())
          fireEvent.mouseDown(document)
          expect(fn1).toHaveBeenCalledTimes(1)
          props.onAction = fn2
          rerender()
          await waitFor(() => result.current.isIdle())
          fireEvent.mouseDown(document)
          expect(fn2).toHaveBeenCalledTimes(1)
        })

        it('Should expose IdleTimer API', async () => {
          props.timeout = 200
          props.eventsThrottle = 0
          props.onAction = jest.fn()
          const { result } = idleTimer()
          await waitFor(() => result.current.isIdle())
          fireEvent.mouseDown(document)
          expect(props.onAction).toHaveBeenCalledTimes(1)
          expect(props.onAction.mock.calls[0][1].isIdle).toBeDefined()
        })
      })

      describe('.onMessage', () => {
        it('Should not emit when emitOnSelf is not set', () => {
          props.onMessage = jest.fn()

          const { result } = idleTimer()
          const data = 'foo'
          result.current.message(data)

          expect(props.onMessage).toHaveBeenCalledTimes(0)
        })

        it('Should emit when emitOnSelf is set', () => {
          props.onMessage = jest.fn()

          const { result } = idleTimer()
          const data = 'foo'
          result.current.message(data, true)

          expect(props.onMessage).toHaveBeenCalledTimes(1)
          expect(props.onMessage.mock.calls[0][0]).toEqual(data)
        })

        it('Should only run the last onmessage callback (on crossTab=true)', async () => {
          const firstOnMessage = jest.fn()
          const secondOnMessage = jest.fn()

          props.crossTab = true
          const { result: leader } = idleTimer()

          props.onMessage = firstOnMessage
          const { rerender } = idleTimer()

          props.onMessage = secondOnMessage
          rerender(props)

          const data = 'foo'
          leader.current.message(data)

          await waitFor(() => secondOnMessage.mock.calls.length >= 1)

          expect(firstOnMessage).toHaveBeenCalledTimes(0)
          expect(secondOnMessage.mock.calls[0][0]).toEqual(data)
        })

        it('Should expose IdleTimer API', () => {
          props.onMessage = jest.fn()

          const { result } = idleTimer()
          const data = 'foo'
          result.current.message(data, true)
          expect(props.onMessage.mock.calls[0][1].isIdle).toBeDefined()
        })
      })

      describe('.debounce', () => {
        it('Should error if debounce and throttle are set', () => {
          jest.spyOn(console, 'error')
          props.debounce = 200
          props.throttle = 200
          expect(() => idleTimer())
            .toThrowError(new Error('❌ onAction can either be throttled or debounced, not both.'))
        })

        it('Should debounce calls to onAction', async () => {
          props.onAction = jest.fn()
          props.debounce = 200
          props.eventsThrottle = 0
          idleTimer()
          fireEvent.mouseDown(document)
          fireEvent.mouseDown(document)
          fireEvent.mouseDown(document)
          fireEvent.mouseDown(document)
          await sleep(200)
          expect(props.onAction).toHaveBeenCalledTimes(1)
        })

        it('Should cancel existing debounced function', async () => {
          const fn1 = jest.fn()
          const fn2 = jest.fn()
          props.onAction = fn1
          props.debounce = 200
          props.eventsThrottle = 0
          const { rerender } = idleTimer()
          fireEvent.mouseDown(document)
          fireEvent.mouseDown(document)
          fireEvent.mouseDown(document)
          fireEvent.mouseDown(document)
          props.onAction = fn2
          rerender(props)
          fireEvent.mouseDown(document)
          fireEvent.mouseDown(document)
          fireEvent.mouseDown(document)
          fireEvent.mouseDown(document)
          await sleep(200)
          expect(fn1).toHaveBeenCalledTimes(0)
          expect(fn2).toHaveBeenCalledTimes(1)
        })

        it('Should cancel debounced callback on idle', async () => {
          props.onAction = jest.fn()
          props.timeout = 200
          props.debounce = 400
          props.eventsThrottle = 0
          const { result } = idleTimer()
          fireEvent.mouseDown(document)
          fireEvent.mouseDown(document)
          fireEvent.mouseDown(document)
          fireEvent.mouseDown(document)
          await waitFor(() => result.current.isIdle())
          await sleep(300)
          expect(props.onAction).toHaveBeenCalledTimes(0)
        })

        it('Should dynamically update debounce', async () => {
          props.onAction = jest.fn()
          props.debounce = 400
          props.eventsThrottle = 0
          const { rerender } = idleTimer()
          fireEvent.mouseDown(document)
          fireEvent.mouseDown(document)
          fireEvent.mouseDown(document)
          fireEvent.mouseDown(document)
          await sleep(400)
          expect(props.onAction).toHaveBeenCalledTimes(1)

          props.debounce = 200
          rerender()
          fireEvent.mouseDown(document)
          fireEvent.mouseDown(document)
          await sleep(200)
          expect(props.onAction).toHaveBeenCalledTimes(2)
        })
      })

      describe('.throttle', () => {
        it('Should error if throttle and debounce are set', () => {
          jest.spyOn(console, 'error')
          props.throttle = 200
          props.debounce = 200
          expect(() => idleTimer())
            .toThrowError(new Error('❌ onAction can either be throttled or debounced, not both.'))
        })

        it('Should throttle calls to onAction', async () => {
          props.onAction = jest.fn()
          props.throttle = 200
          props.eventsThrottle = 0
          idleTimer()
          fireEvent.mouseDown(document)
          fireEvent.mouseDown(document)
          fireEvent.mouseDown(document)
          fireEvent.mouseDown(document)
          await sleep(200)
          expect(props.onAction).toHaveBeenCalledTimes(1)
        })

        it('Should dynamically update throttle', async () => {
          props.onAction = jest.fn()
          props.throttle = 400
          props.eventsThrottle = 0
          const { rerender } = idleTimer()
          fireEvent.mouseDown(document)
          fireEvent.mouseDown(document)
          fireEvent.mouseDown(document)
          fireEvent.mouseDown(document)
          await sleep(400)
          expect(props.onAction).toHaveBeenCalledTimes(1)

          props.throttle = 200
          rerender()
          fireEvent.mouseDown(document)
          fireEvent.mouseDown(document)
          await sleep(200)
          expect(props.onAction).toHaveBeenCalledTimes(2)
        })
      })

      describe('.eventsThrottle', () => {
        it('Should not throttle events', async () => {
          props.eventsThrottle = 0
          props.timeout = 200
          props.onActive = jest.fn()
          const { result } = idleTimer()
          await waitFor(() => result.current.isIdle())
          fireEvent.mouseDown(document)
          await waitFor(() => result.current.isIdle())
          fireEvent.mouseDown(document)
          expect(props.onActive).toHaveBeenCalledTimes(2)
        })

        it('Should throttle events', async () => {
          props.eventsThrottle = 1000
          props.timeout = 200
          props.onActive = jest.fn()
          const { result } = idleTimer()
          await waitFor(() => result.current.isIdle())
          fireEvent.mouseDown(document)
          await waitFor(() => result.current.isIdle())
          fireEvent.mouseDown(document)
          expect(props.onActive).toHaveBeenCalledTimes(1)
        })

        it('Should dynamically update eventsThrottle', async () => {
          props.eventsThrottle = 1000
          props.timeout = 200
          props.onActive = jest.fn()
          const { result, rerender } = idleTimer()
          await waitFor(() => result.current.isIdle())
          fireEvent.mouseDown(document)
          await waitFor(() => result.current.isIdle())
          fireEvent.mouseDown(document)
          expect(props.onActive).toHaveBeenCalledTimes(1)
          props.eventsThrottle = 100
          rerender()
          fireEvent.mouseDown(document)
          await waitFor(() => result.current.isIdle())
          fireEvent.mouseDown(document)
          await waitFor(() => result.current.isIdle())
          fireEvent.mouseDown(document)
          expect(props.onActive).toHaveBeenCalledTimes(4)
        })
      })

      describe('.timers', () => {
        it('Should use custom timers', () => {
          const setTimeout = jest.fn()
          const clearTimeout = jest.fn()
          const setInterval = jest.fn()
          const clearInterval = jest.fn()
          props.timers = {
            setTimeout,
            clearTimeout,
            setInterval,
            clearInterval
          }
          idleTimer()
          expect(timers.setInterval).toEqual(setInterval)
          expect(timers.clearInterval).toEqual(clearInterval)
          expect(timers.setTimeout).toEqual(setTimeout)
          expect(timers.clearTimeout).toEqual(clearTimeout)

          // Rest timers
          createMocks()
        })
      })

      describe('.crossTab', () => {
        it('Should emit prompt, idle and active on manager', async () => {
          props.timeout = 200
          props.promptTimeout = 200
          props.startManually = true
          props.crossTab = true
          props.onPrompt = jest.fn()
          props.onIdle = jest.fn()
          props.onActive = jest.fn()
          const { result } = idleTimer()

          result.current.start()
          await waitFor(() => result.current.isIdle())

          expect(result.current.isIdle()).toBe(true)
          expect(props.onPrompt).toHaveBeenCalledTimes(1)
          expect(props.onIdle).toHaveBeenCalledTimes(1)

          fireEvent.mouseDown(document)
          expect(result.current.isIdle()).toBe(false)
          expect(props.onActive).toHaveBeenCalledTimes(1)
        })

        it('Should emit start, reset, pause and resume on manager', async () => {
          props.timeout = 200
          props.startManually = true
          props.crossTab = true
          props.onIdle = jest.fn()
          props.onActive = jest.fn()
          const { result } = idleTimer()

          result.current.start()
          await waitFor(() => result.current.isIdle())
          result.current.reset()
          result.current.start()

          await sleep(100)
          result.current.pause()

          expect(result.current.isIdle()).toBe(false)
          const remaining = result.current.getRemainingTime()
          expect(remaining).toBeAround(100, 20)

          result.current.resume()
          await sleep(remaining)

          expect(result.current.isIdle()).toBe(true)
          expect(props.onIdle).toHaveBeenCalledTimes(2)

          fireEvent.mouseDown(document)
          expect(result.current.isIdle()).toBe(false)
        })

        it('Should update crossTab dynamically', async () => {
          props.timeout = 200
          props.crossTab = true
          props.onIdle = jest.fn()
          const { result, rerender } = idleTimer()
          await waitFor(() => result.current.isIdle())

          props.crossTab = false
          rerender()

          await waitFor(() => result.current.isIdle())
          expect(props.onIdle).toHaveBeenCalledTimes(1)
        })
      })

      describe('.name', () => {
        it('Should set separate names for multiple instances', async () => {
          props.timeout = 200
          props.crossTab = true
          props.name = 'timer-1'
          props.onIdle = jest.fn()
          props.crossTab = false
          const timer1 = idleTimer()

          props.name = 'timer-2'
          const timer2 = idleTimer()
          await waitFor(() => timer1.result.current.isIdle())
          await waitFor(() => timer2.result.current.isIdle())
          expect(props.onIdle).toHaveBeenCalledTimes(2)
        })
      })

      describe('.syncTimers', () => {
        it('Should keep timers relatively in sync', async () => {
          props.timeout = 500
          props.crossTab = true
          props.syncTimers = 200
          props.eventsThrottle = 0
          const { result } = idleTimer()
          const { result: result2 } = idleTimer()
          result.current.start()
          await sleep(100)
          fireEvent.mouseDown(document)
          await sleep(200)
          expect(result.current.getRemainingTime()).toBeAround(300, 20)
          expect(result2.current.getRemainingTime()).toBeAround(300, 20)
        })
      })

      describe('.disabled', () => {
        it('Should not start a disabled timer by default', async () => {
          props.eventsThrottle = 0
          props.timeout = 200
          props.disabled = true
          props.onActive = jest.fn()
          const { result } = idleTimer()
          await sleep(200)
          expect(result.current.isIdle()).toBe(false)
          fireEvent.mouseDown(document)
          expect(result.current.isIdle()).toBe(false)
          expect(props.onActive).toHaveBeenCalledTimes(0)
        })

        it('Should disable the timer when its running', async () => {
          props.eventsThrottle = 0
          props.timeout = 200
          props.disabled = false
          props.onActive = jest.fn()
          const { result, rerender } = idleTimer()

          await sleep(100)
          expect(result.current.getRemainingTime()).toBeGreaterThan(0)

          props.disabled = true
          rerender()
          await sleep(200)

          expect(result.current.isIdle()).toBe(false)
          fireEvent.mouseDown(document)

          expect(result.current.isIdle()).toBe(false)
          expect(props.onActive).toHaveBeenCalledTimes(0)
        })

        it('Should enable the timer when disabled', async () => {
          props.eventsThrottle = 0
          props.timeout = 200
          props.disabled = false
          props.onActive = jest.fn()
          const { result, rerender } = idleTimer()

          await sleep(100)
          expect(result.current.getRemainingTime()).toBeGreaterThan(0)

          props.disabled = true
          rerender()
          await sleep(200)

          expect(result.current.isIdle()).toBe(false)
          fireEvent.mouseDown(document)

          expect(result.current.isIdle()).toBe(false)
          expect(props.onActive).toHaveBeenCalledTimes(0)

          props.disabled = false
          rerender()

          expect(result.current.getRemainingTime()).toBeGreaterThan(0)
          await waitFor(() => result.current.isIdle())

          fireEvent.mouseDown(document)
          expect(props.onActive).toHaveBeenCalledTimes(1)
        })

        it('Should respect startManually', async () => {
          props.eventsThrottle = 0
          props.timeout = 200
          props.disabled = false
          props.startManually = true
          props.onActive = jest.fn()
          const { result, rerender } = idleTimer()

          await sleep(100)
          expect(result.current.getRemainingTime()).toBeGreaterThan(0)

          props.disabled = true
          rerender()
          await sleep(200)

          expect(result.current.isIdle()).toBe(false)
          fireEvent.mouseDown(document)

          expect(result.current.isIdle()).toBe(false)
          expect(props.onActive).toHaveBeenCalledTimes(0)

          props.disabled = false
          rerender()

          expect(result.current.isIdle()).toBe(false)
          fireEvent.mouseDown(document)

          expect(result.current.isIdle()).toBe(false)
          expect(props.onActive).toHaveBeenCalledTimes(0)

          result.current.start()

          expect(result.current.getRemainingTime()).toBeGreaterThan(0)
          await waitFor(() => result.current.isIdle())

          fireEvent.mouseDown(document)
          expect(props.onActive).toHaveBeenCalledTimes(1)
        })

        it('Disables control methods', async () => {
          props.eventsThrottle = 0
          props.timeout = 200
          props.disabled = true
          const { result } = idleTimer()

          result.current.start()
          expect(result.current.getRemainingTime()).toBe(200)

          result.current.reset()
          expect(result.current.getRemainingTime()).toBe(200)

          result.current.activate()
          expect(result.current.getRemainingTime()).toBe(200)

          result.current.resume()
          expect(result.current.getRemainingTime()).toBe(200)

          result.current.pause()
          expect(result.current.getRemainingTime()).toBe(200)
        })
      })
    })

    describe('.methods', () => {
      describe('.start()', () => {
        it('Should start timer when start is called', () => {
          props.startOnMount = false
          const { result } = idleTimer()
          result.current.start()
          expect(result.current.isIdle()).toBe(false)
        })

        it('Should bind all events on start()', async () => {
          props.onAction = jest.fn()
          props.stopOnIdle = true
          props.timeout = 200
          const { result } = idleTimer()
          await waitFor(() => result.current.isIdle())
          fireEvent.mouseDown(document)
          expect(props.onAction).toHaveBeenCalledTimes(0)
          result.current.start()
          fireEvent.mouseDown(document)
          expect(props.onAction).toHaveBeenCalledTimes(1)
        })

        it('Should not redefine on rerender', async () => {
          props.onAction = jest.fn()
          props.stopOnIdle = true
          props.timeout = 200
          const { result, rerender } = idleTimer()
          await waitFor(() => result.current.isIdle())
          fireEvent.mouseDown(document)
          expect(props.onAction).toHaveBeenCalledTimes(0)
          rerender()
          result.current.start()
          fireEvent.mouseDown(document)
          expect(props.onAction).toHaveBeenCalledTimes(1)
        })
      })

      describe('.reset()', () => {
        it('Should start timer when reset is called', () => {
          props.startOnMount = false
          const { result } = idleTimer()
          result.current.reset()
          expect(result.current.isIdle()).toBe(false)
        })

        it('Should not start time when startManually is set', async () => {
          props.timeout = 200
          props.startOnMount = false
          props.startManually = true
          const { result } = idleTimer()
          result.current.reset()
          await sleep(200)
          expect(result.current.isIdle()).toBe(false)
        })

        it('Should bind all events on reset()', async () => {
          props.onAction = jest.fn()
          props.stopOnIdle = true
          props.timeout = 200
          const { result } = idleTimer()
          await waitFor(() => result.current.isIdle())
          fireEvent.mouseDown(document)
          expect(props.onAction).toHaveBeenCalledTimes(0)
          result.current.reset()
          fireEvent.mouseDown(document)
          expect(props.onAction).toHaveBeenCalledTimes(1)
        })

        it('Should reset all ref values', async () => {
          props.timeout = 200
          const { result } = idleTimer()
          await sleep(200)
          expect(result.current.getTotalActiveTime()).toBeAround(200, 10)
          expect(result.current.getActiveTime()).toBeAround(200, 10)
          await sleep(100)
          expect(result.current.getTotalIdleTime()).toBeAround(100, 10)
          expect(result.current.getIdleTime()).toBeAround(100, 10)
          expect(result.current.getElapsedTime()).toBeAround(300, 20)
          result.current.reset()
          expect(result.current.getTotalIdleTime()).toBeAround(100, 20)
          expect(result.current.getTotalActiveTime()).toBeAround(200, 20)
          expect(result.current.getTotalElapsedTime()).toBeAround(300, 20)
          expect(result.current.getElapsedTime()).toBeAround(0, 5)
          expect(result.current.getIdleTime()).toBeAround(0, 5)
          expect(result.current.getActiveTime()).toBeAround(0, 5)
          expect(result.current.getLastIdleTime()).toBeDefined()
          expect(result.current.getLastActiveTime()).toBeDefined()
        })
      })

      describe('.activate()', () => {
        it('Should start timer when activate() is called', () => {
          props.startOnMount = false
          const { result } = idleTimer()
          result.current.activate()
          expect(result.current.isIdle()).toBe(false)
        })

        it('Should call onActive if user was idle', async () => {
          props.timeout = 200
          props.onActive = jest.fn()
          const { result } = idleTimer()
          await waitFor(() => result.current.isIdle())
          result.current.activate()
          expect(props.onActive).toHaveBeenCalledTimes(1)
        })

        it('Should emit active event when cross tab is enabled', async () => {
          props.timeout = 200
          props.onActive = jest.fn()
          props.crossTab = true
          const { result } = idleTimer()
          idleTimer()
          await waitFor(() => result.current.isIdle())
          result.current.activate()
          await sleep(100)
          expect(props.onActive).toHaveBeenCalledTimes(2)
        })

        it('Should bind all events on activate()', async () => {
          props.onAction = jest.fn()
          props.stopOnIdle = true
          props.timeout = 200
          const { result } = idleTimer()
          await waitFor(() => result.current.isIdle())
          fireEvent.mouseDown(document)
          expect(props.onAction).toHaveBeenCalledTimes(0)
          result.current.activate()
          fireEvent.mouseDown(document)
          expect(props.onAction).toHaveBeenCalledTimes(1)
        })
      })

      describe('.pause()', () => {
        it('Should pause the timer', () => {
          const { result } = idleTimer()
          result.current.pause()
          expect(result.current.isIdle()).toBe(false)
        })

        it('Should not pause a paused idleTimer instance', () => {
          const { result } = idleTimer()
          result.current.pause()
          result.current.pause()
          expect(result.current.isIdle()).toBe(false)
          expect(result.current.getRemainingTime()).toBeDefined()
        })

        it('Should unbind all events on pause()', () => {
          props.onAction = jest.fn()
          props.timeout = 400
          const { result } = idleTimer()
          result.current.pause()
          fireEvent.mouseDown(document)
          expect(props.onAction).toHaveBeenCalledTimes(0)
        })

        it('Should have accurate remaining time', async () => {
          props.timeout = 400
          const { result } = idleTimer()
          await sleep(200)
          result.current.pause()
          const remaining = result.current.getRemainingTime()
          expect(remaining).toBeAround(200, 10)
          await sleep(200)
          expect(result.current.getRemainingTime()).toBe(remaining)
        })
      })

      describe('.resume()', () => {
        it('Should resume a paused idleTimer instance', async () => {
          props.timeout = 400
          const { result } = idleTimer()
          await sleep(200)
          result.current.pause()
          expect(result.current.isIdle()).toBe(false)
          result.current.resume()
          await waitFor(() => result.current.isIdle())
        })

        it('Should not resume a running idleTimer instance', async () => {
          props.timeout = 400
          const { result } = idleTimer()
          await sleep(200)
          result.current.resume()
          expect(result.current.getRemainingTime()).toBeLessThanOrEqual(props.timeout)
        })

        it('Should bind all events on resume()', () => {
          props.onAction = jest.fn()
          props.timeout = 400
          const { result } = idleTimer()
          result.current.pause()
          fireEvent.mouseDown(document)
          expect(props.onAction).toBeCalledTimes(0)
          result.current.resume()
          fireEvent.mouseDown(document)
          expect(props.onAction).toBeCalledTimes(1)
        })

        it('Should resume from paused time', async () => {
          props.timeout = 400
          const { result } = idleTimer()
          await sleep(200)
          result.current.pause()
          expect(result.current.isIdle()).toBe(false)
          expect(result.current.getRemainingTime()).toBeAround(200, 10)
          result.current.resume()
          await sleep(100)
          expect(result.current.isIdle()).toBe(false)
          await sleep(101)
          expect(result.current.isIdle()).toBe(true)
        })

        it('Should have accurate remaining time', async () => {
          props.timeout = 400
          const { result } = idleTimer()
          await sleep(200)
          result.current.pause()
          const remaining = result.current.getRemainingTime()
          expect(remaining).toBeAround(200, 10)
          result.current.resume()
          expect(result.current.getRemainingTime()).toBeAround(remaining, 10)
          await sleep(100)
          expect(result.current.getRemainingTime()).toBeAround(remaining - 100, 10)
        })

        it('Should not rebind events while prompt is active', async () => {
          props.timeout = 200
          props.promptTimeout = 400
          props.onActive = jest.fn()
          const { result } = idleTimer()
          await waitFor(() => result.current.isPrompted())
          await sleep(100)
          result.current.pause()
          await sleep(100)
          result.current.resume()
          fireEvent.mouseDown(document)
          expect(result.current.isPrompted()).toBe(true)
          expect(props.onActive).toHaveBeenCalledTimes(0)
        })
      })

      describe('.message()', () => {
        it('Should send message across tabs when crossTab is enabled', async () => {
          const fn1 = jest.fn()
          const fn2 = jest.fn()

          props.onMessage = fn1
          props.crossTab = true

          const idleTimer1 = idleTimer()

          props.onMessage = fn2
          idleTimer()

          const data = 'foo'
          idleTimer1.result.current.message(data)

          await waitFor(() => fn2.mock.calls.length === 1)
          expect(fn1).toHaveBeenCalledTimes(0)
          expect(fn2).toHaveBeenCalledTimes(1)
          expect(fn2.mock.calls[0][0]).toEqual(data)
        })

        it('Should emit on local callee instance when emitOnSelf is true', async () => {
          const fn1 = jest.fn()
          const fn2 = jest.fn()

          props.onMessage = fn1
          props.crossTab = true

          const idleTimer1 = idleTimer()

          props.onMessage = fn2
          idleTimer()

          const data = 'foo'
          idleTimer1.result.current.message(data, true)

          await waitFor(() => fn2.mock.calls.length === 1)
          expect(fn1).toHaveBeenCalledTimes(1)
          expect(fn1.mock.calls[0][0]).toEqual(data)
          expect(fn2).toHaveBeenCalledTimes(1)
          expect(fn2.mock.calls[0][0]).toEqual(data)
        })

        it('Should accept string data', async () => {
          const fn1 = jest.fn()
          const fn2 = jest.fn()

          props.onMessage = fn1
          props.crossTab = true

          const idleTimer1 = idleTimer()

          props.onMessage = fn2
          idleTimer()

          const data = 'foo'
          idleTimer1.result.current.message(data, true)

          await waitFor(() => fn2.mock.calls.length === 1)
          expect(fn1).toHaveBeenCalledTimes(1)
          expect(fn1.mock.calls[0][0]).toEqual(data)
          expect(fn2).toHaveBeenCalledTimes(1)
          expect(fn2.mock.calls[0][0]).toEqual(data)
        })

        it('Should accept object data', async () => {
          const fn1 = jest.fn()
          const fn2 = jest.fn()

          props.onMessage = fn1
          props.crossTab = true

          const idleTimer1 = idleTimer()

          props.onMessage = fn2
          idleTimer()

          const data = { foo: 'bar' }
          idleTimer1.result.current.message(data, true)

          await waitFor(() => fn2.mock.calls.length === 1)
          expect(fn1).toHaveBeenCalledTimes(1)
          expect(fn1.mock.calls[0][0]).toEqual(data)
          expect(fn2).toHaveBeenCalledTimes(1)
          expect(fn2.mock.calls[0][0]).toEqual(data)
        })

        it('Should accept number data', async () => {
          const fn1 = jest.fn()
          const fn2 = jest.fn()

          props.onMessage = fn1
          props.crossTab = true

          const idleTimer1 = idleTimer()

          props.onMessage = fn2
          idleTimer()

          const data = 1337
          idleTimer1.result.current.message(data, true)

          await waitFor(() => fn2.mock.calls.length === 1)
          expect(fn1).toHaveBeenCalledTimes(1)
          expect(fn1.mock.calls[0][0]).toEqual(data)
          expect(fn2).toHaveBeenCalledTimes(1)
          expect(fn2.mock.calls[0][0]).toEqual(data)
        })
      })

      describe('.isIdle()', () => {
        it('Should get the idle state', async () => {
          props.timeout = 200
          const { result } = idleTimer()
          expect(result.current.isIdle()).toBe(false)
          await waitFor(() => result.current.isIdle())
          expect(result.current.isIdle()).toBe(true)
        })
      })

      describe('.isPrompted', () => {
        it('Should return false when promptTimeout is not set', async () => {
          props.timeout = 200
          const { result } = idleTimer()
          await waitFor(() => result.current.isIdle())
          expect(result.current.isPrompted()).toBe(false)
        })

        it('Should return true after timeout when promptTimeout is set', async () => {
          props.timeout = 200
          props.promptTimeout = 400
          const { result } = idleTimer()
          await sleep(200)
          expect(result.current.isPrompted()).toBe(true)
        })

        it('Should emit onAction while prompt is active', async () => {
          props.timeout = 200
          props.promptTimeout = 400
          props.onAction = jest.fn()
          const { result } = idleTimer()
          await sleep(200)
          expect(result.current.isPrompted()).toBe(true)
          fireEvent.mouseDown(document)
          expect(props.onAction).toHaveBeenCalledTimes(1)
        })
      })

      describe('.isLeader', () => {
        it('Should throw error when crossTab is not set', async () => {
          props.crossTab = false
          const { result } = idleTimer()
          expect(result.current.isLeader()).toBe(null)
        })

        it('Should throw error when leaderElection is not set', async () => {
          props.crossTab = true
          const { result } = idleTimer()
          expect(() => result.current.isLeader()).toThrowError(
            '❌ Leader election is not enabled. To Enable it set the "leaderElection" property to true.'
          )
        })

        it('Should return boolean when properly set up', async () => {
          props.timeout = 200
          props.crossTab = true
          props.leaderElection = true
          const { result } = idleTimer()
          expect(result.current.isLeader()).toBe(false)
          await waitFor(() => result.current.isLeader(), { timeout: 3000 })
          expect(result.current.isLeader()).toBe(true)
        })
      })

      describe('.isLastActiveTab', () => {
        it('Should be null crossTab is not enabled', () => {
          const { result } = idleTimer()
          expect(result.current.isLastActiveTab()).toBe(null)
        })

        it('Should have only one active tab', async () => {
          props.crossTab = true
          props.timeout = 200
          const timer1 = idleTimer()
          const timer2 = idleTimer()
          await waitFor(timer1.result.current.isIdle)
          timer2.result.current.activate()
          expect(timer1.result.current.isLastActiveTab()).toBe(false)
          expect(timer2.result.current.isLastActiveTab()).toBe(true)
        })

        it('Should work with all activations', async () => {
          props.crossTab = true
          props.timeout = 200
          const timer1 = idleTimer()
          const timer2 = idleTimer()
          await waitFor(timer1.result.current.isIdle)

          timer2.result.current.activate()
          expect(timer1.result.current.isLastActiveTab()).toBe(false)
          expect(timer2.result.current.isLastActiveTab()).toBe(true)

          timer1.result.current.start()
          expect(timer1.result.current.isLastActiveTab()).toBe(true)
          await waitFor(timer1.result.current.isIdle)
          expect(timer2.result.current.isLastActiveTab()).toBe(false)

          timer2.result.current.reset()
          await waitFor(timer1.result.current.isIdle)
          expect(timer1.result.current.isLastActiveTab()).toBe(false)
          expect(timer2.result.current.isLastActiveTab()).toBe(true)
        })
      })

      describe('.getTabId', () => {
        it('Should throw when crossTab is not enabled', () => {
          const { result } = idleTimer()
          expect(result.current.getTabId()).toBe(null)
        })

        it('Should return unique ids', () => {
          props.crossTab = true
          const timer1 = idleTimer()
          const timer2 = idleTimer()
          expect(timer1.result.current.getTabId()).not.toBe(timer2.result.current.getTabId())
        })

        it('Should generate unique ids for many instances', () => {
          props.crossTab = true
          const ids = []
          for (let i = 0; i < 100; i++) {
            const { result } = idleTimer()
            ids.push(result.current.getTabId())
          }
          expect((new Set(ids)).size).toBe(ids.length)
        })
      })

      describe('.getRemainingTime()', () => {
        it('Should return 0 for remaining time while idle', async () => {
          props.timeout = 200
          const { result } = idleTimer()
          await waitFor(() => result.current.isIdle())
          expect(result.current.getRemainingTime()).toBeAround(0, 1)
        })

        it('Should return remaining time while paused', async () => {
          props.timeout = 200
          const { result } = idleTimer()
          await sleep(100)
          result.current.pause()
          expect(result.current.getRemainingTime()).toBeAround(100, 10)
        })

        it('Should return timeout value when not started', async () => {
          props.timeout = 400
          props.startManually = true
          const { result } = idleTimer()
          expect(result.current.getRemainingTime()).toBe(props.timeout)
          result.current.start()
          await waitFor(() => result.current.isIdle())
          expect(result.current.getRemainingTime()).toBeAround(0, 1)
        })

        it('Should recalculate when timeout is changed', async () => {
          props.timeout = 400
          props.startManually = true
          const { result, rerender } = idleTimer()
          expect(result.current.getRemainingTime()).toBe(props.timeout)
          props.timeout = 800
          rerender()
          expect(result.current.getRemainingTime()).toBe(props.timeout)
        })

        it('Should return prompt remaining time when prompt is active', async () => {
          props.timeout = 200
          props.promptTimeout = 400
          props.onPrompt = jest.fn()

          const { result } = idleTimer()
          await sleep(100)
          expect(result.current.getRemainingTime()).toBeAround(500, 10)

          await waitFor(() => result.current.isPrompted())
          expect(props.onPrompt).toHaveBeenCalledTimes(1)
          await sleep(100)
          expect(result.current.getRemainingTime()).toBeAround(300, 15)
        })

        it('Should return correct value when paused and resumed', async () => {
          props.timeout = 200
          props.onPrompt = jest.fn()

          const { result } = idleTimer()
          await sleep(100)
          result.current.pause()
          expect(result.current.getRemainingTime()).toBeAround(100, 10)
          await sleep(200)
          result.current.resume()
          expect(result.current.getRemainingTime()).toBeAround(100, 10)

          await waitFor(() => result.current.isIdle())
          expect(result.current.getRemainingTime()).toBeAround(0, 5)
        })

        it('Should return correct value when paused and resumed while prompted', async () => {
          props.timeout = 200
          props.promptTimeout = 400
          props.onPrompt = jest.fn()

          const { result } = idleTimer()
          await waitFor(() => result.current.isPrompted())
          result.current.pause()
          expect(result.current.getRemainingTime()).toBeAround(props.promptTimeout, 20)
          await sleep(100)
          expect(result.current.getRemainingTime()).toBeAround(props.promptTimeout, 20)
          result.current.resume()
          expect(result.current.getRemainingTime()).toBeAround(props.promptTimeout, 20)
          await sleep(100)
          expect(result.current.getRemainingTime()).toBeAround(props.promptTimeout - 100, 20)
          result.current.pause()
          await sleep(100)
          result.current.resume()
          await waitFor(() => result.current.isIdle())
          expect(result.current.getRemainingTime()).toBe(0)
        })

        it('Should reset when start, reset or activate is called', async () => {
          props.timeout = 200
          const { result } = idleTimer()
          await sleep(100)
          expect(result.current.getRemainingTime()).toBeAround(100, 10)
          await waitFor(() => result.current.isIdle())
          expect(result.current.getRemainingTime()).toBeAround(0, 1)
          result.current.reset()
          expect(result.current.getRemainingTime()).toBeAround(200, 10)
          await waitFor(() => result.current.isIdle())
          expect(result.current.getRemainingTime()).toBeAround(0, 1)
          result.current.start()
          expect(result.current.getRemainingTime()).toBeAround(200, 10)
          await waitFor(() => result.current.isIdle())
          expect(result.current.getRemainingTime()).toBeAround(0, 1)
          result.current.activate()
          expect(result.current.getRemainingTime()).toBeAround(200, 10)
        })
      })

      describe('.getElapsedTime()', () => {
        it('Should get the elapsed time', async () => {
          const { result } = idleTimer()
          await sleep(200)
          expect(result.current.getElapsedTime()).toBeAround(200, 20)
          await sleep(200)
          expect(result.current.getElapsedTime()).toBeAround(400, 20)
        })

        it('Should reset when reset() is called', async () => {
          const { result } = idleTimer()
          await sleep(200)
          expect(result.current.getElapsedTime()).toBeAround(200, 20)
          await sleep(200)
          expect(result.current.getElapsedTime()).toBeAround(400, 20)
          result.current.reset()
          expect(result.current.getElapsedTime()).toBeAround(0, 10)
        })
      })

      describe('.getTotalElapsedTime()', () => {
        it('Should get the elapsed time', async () => {
          const { result } = idleTimer()
          await sleep(200)
          expect(result.current.getTotalElapsedTime()).toBeAround(200, 20)
          await sleep(200)
          expect(result.current.getTotalElapsedTime()).toBeAround(400, 20)
        })
      })

      describe('.getLastIdleTime()', () => {
        it('Should get the last idle time', async () => {
          props.timeout = 200
          const { result } = idleTimer()
          await waitFor(() => result.current.isIdle())
          expect(result.current.getLastIdleTime().getTime()).toBeAround(Date.now(), 20)
        })

        it('Should return null if has not been idle', () => {
          props.startManually = true
          const { result } = idleTimer()
          expect(result.current.getLastIdleTime()).toBe(null)
        })

        it('Should recalculate when lastIdle changes', async () => {
          props.timeout = 200
          const { result } = idleTimer()
          await waitFor(() => result.current.isIdle())
          fireEvent.mouseDown(document)
          await waitFor(() => result.current.isIdle())
          expect(result.current.getLastIdleTime().getTime()).toBeAround(Date.now(), 20)
        })
      })

      describe('.getIdleTime()', () => {
        it('Should get the idle time', async () => {
          props.timeout = 200
          const { result } = idleTimer()

          await sleep(300)
          expect(result.current.getIdleTime()).toBeAround(100, 10)
          fireEvent.mouseDown(document)

          await sleep(100)
          expect(result.current.getIdleTime()).toBeAround(100, 15)

          await sleep(300)
          expect(result.current.getIdleTime()).toBeAround(300, 20)
        })

        it('Should return 0 when it has not been idle', async () => {
          props.timeout = 200
          props.startManually = false
          const { result } = idleTimer()
          expect(result.current.getIdleTime()).toBe(0)
          result.current.start()
          expect(result.current.getIdleTime()).toBe(0)
        })

        it('Should recalculate when lastIdle changes', async () => {
          props.timeout = 200
          const { result } = idleTimer()

          await waitFor(() => result.current.isIdle())
          expect(result.current.getIdleTime()).toBeAround(0, 20)

          fireEvent.mouseDown(document)
          await waitFor(() => result.current.isIdle())
          await sleep(200)
          expect(result.current.getIdleTime()).toBeAround(200, 30)
        })

        it('Should reset when reset is called', async () => {
          props.timeout = 200
          const { result } = idleTimer()

          await waitFor(() => result.current.isIdle())
          expect(result.current.getIdleTime()).toBeAround(0, 20)

          fireEvent.mouseDown(document)
          await waitFor(() => result.current.isIdle())
          await sleep(200)
          expect(result.current.getIdleTime()).toBeAround(200, 30)
          result.current.reset()
          expect(result.current.getIdleTime()).toBe(0)
        })
      })

      describe('.getTotalIdleTime()', () => {
        it('Should get the total idle time', async () => {
          props.timeout = 200
          const { result } = idleTimer()

          await sleep(300)
          expect(result.current.getTotalIdleTime()).toBeAround(100, 10)
          fireEvent.mouseDown(document)

          await sleep(100)
          expect(result.current.getTotalIdleTime()).toBeAround(100, 15)

          await sleep(300)
          expect(result.current.getTotalIdleTime()).toBeAround(300, 20)
        })

        it('Should return 0 when it has not been idle', async () => {
          props.timeout = 200
          props.startManually = false
          const { result } = idleTimer()
          expect(result.current.getTotalIdleTime()).toBe(0)
          result.current.start()
          expect(result.current.getTotalIdleTime()).toBe(0)
        })

        it('Should recalculate when lastIdle changes', async () => {
          props.timeout = 200
          const { result } = idleTimer()

          await waitFor(() => result.current.isIdle())
          expect(result.current.getTotalIdleTime()).toBeAround(0, 20)

          fireEvent.mouseDown(document)
          await waitFor(() => result.current.isIdle())
          await sleep(200)
          expect(result.current.getTotalIdleTime()).toBeAround(200, 30)
        })
      })

      describe('.getLastActiveTime()', () => {
        it('Should get the last active time', async () => {
          props.timeout = 200
          props.startManually = true
          const { result } = idleTimer()
          result.current.start()
          expect(result.current.getLastActiveTime().getTime()).toBeAround(Date.now(), 20)
        })

        it('Should return null if has not been active', () => {
          props.startManually = true
          const { result } = idleTimer()
          expect(result.current.getLastActiveTime()).toBe(null)
        })

        it('Should recalculate when lastActive changes', async () => {
          props.timeout = 200
          const { result } = idleTimer()
          await waitFor(() => result.current.isIdle())
          fireEvent.mouseDown(document)
          expect(result.current.getLastActiveTime().getTime()).toBeAround(Date.now(), 20)
        })
      })

      describe('.getActiveTime()', () => {
        it('Should get the active time', async () => {
          props.timeout = 300
          const { result } = idleTimer()

          // Test during active
          await sleep(100)
          expect(result.current.getActiveTime()).toBeAround(100, 20)

          // Test after idle
          await waitFor(() => result.current.isIdle())
          expect(result.current.getActiveTime()).toBeAround(300, 25)

          // Activate
          fireEvent.mouseDown(document)
          await sleep(100)

          fireEvent.mouseDown(document)
          await sleep(100)

          fireEvent.mouseDown(document)
          await sleep(100)

          expect(result.current.getActiveTime()).toBeAround(600, 20)
        })

        it('Should return 0 when it has not been active', async () => {
          props.timeout = 200
          props.startManually = true
          const { result } = idleTimer()
          expect(result.current.getActiveTime()).toBeAround(0, 5)
          result.current.start()
          expect(result.current.getActiveTime()).toBeAround(0, 20)
          await waitFor(() => result.current.isIdle())
          expect(result.current.getActiveTime()).toBeAround(200, 20)
        })

        it('Should recalculate when lastActive changes', async () => {
          props.timeout = 200
          const { result } = idleTimer()

          await waitFor(() => result.current.isIdle())
          expect(result.current.getActiveTime()).toBeAround(200, 20)

          fireEvent.mouseDown(document)
          await waitFor(() => result.current.isIdle())
          expect(result.current.getActiveTime()).toBeAround(400, 20)
        })

        it('Should start over when reset is called', async () => {
          props.timeout = 200
          const { result } = idleTimer()

          await waitFor(() => result.current.isIdle())
          expect(result.current.getActiveTime()).toBeAround(200, 20)

          fireEvent.mouseDown(document)
          await waitFor(() => result.current.isIdle())
          expect(result.current.getActiveTime()).toBeAround(400, 20)

          result.current.reset()
          await waitFor(() => result.current.isIdle())
          expect(result.current.getActiveTime()).toBeAround(200, 20)
        })
      })

      describe('.getTotalActiveTime()', () => {
        it('Should get the total active time', async () => {
          props.timeout = 300
          const { result } = idleTimer()

          // Test during active
          await sleep(100)
          expect(result.current.getTotalActiveTime()).toBeAround(100, 20)

          // Test after idle
          await waitFor(() => result.current.isIdle())
          expect(result.current.getTotalActiveTime()).toBeAround(300, 25)

          // Activate
          fireEvent.mouseDown(document)
          await sleep(100)

          fireEvent.mouseDown(document)
          await sleep(100)

          fireEvent.mouseDown(document)
          await sleep(100)

          expect(result.current.getTotalActiveTime()).toBeAround(600, 20)
        })

        it('Should return 0 when it has not been active', async () => {
          props.timeout = 200
          props.startManually = true
          const { result } = idleTimer()
          expect(result.current.getTotalActiveTime()).toBeAround(0, 5)
          result.current.start()
          expect(result.current.getTotalActiveTime()).toBeAround(0, 20)
          await waitFor(() => result.current.isIdle())
          expect(result.current.getTotalActiveTime()).toBeAround(200, 20)
        })

        it('Should recalculate when lastActive changes', async () => {
          props.timeout = 200
          const { result } = idleTimer()

          await waitFor(() => result.current.isIdle())
          expect(result.current.getTotalActiveTime()).toBeAround(200, 20)

          fireEvent.mouseDown(document)
          await waitFor(() => result.current.isIdle())
          expect(result.current.getTotalActiveTime()).toBeAround(400, 20)
        })

        it('Should not start over when reset is called', async () => {
          props.timeout = 200
          const { result } = idleTimer()

          await waitFor(() => result.current.isIdle())
          expect(result.current.getTotalActiveTime()).toBeAround(200, 20)

          fireEvent.mouseDown(document)
          await waitFor(() => result.current.isIdle())
          expect(result.current.getTotalActiveTime()).toBeAround(400, 20)

          result.current.reset()
          await waitFor(() => result.current.isIdle())
          expect(result.current.getTotalActiveTime()).toBeAround(600, 20)
        })
      })
    })
  })
})
