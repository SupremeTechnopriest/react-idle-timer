import { fireEvent } from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks'
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
      syncTimers: undefined
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

        it('Should update when started manually', async () => {
          props.timeout = 400
          props.startOnMount = false
          props.startManually = true
          props.stopOnIdle = true
          const { result, rerender } = idleTimer()
          result.current.pause()
          expect(result.current.isIdle()).toBe(true)
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

      describe('.startOnMount', () => {
        it('Should start immediately when set', () => {
          props.startOnMount = true
          const { result } = idleTimer()
          expect(result.current.isIdle()).toBe(false)
        })

        it('Should not start when startOnMount not set', () => {
          props.startOnMount = false
          const { result } = idleTimer()
          expect(result.current.isIdle()).toBe(true)
        })

        it('Should start on first event', async () => {
          props.startOnMount = false
          props.onActive = jest.fn()
          const { result } = idleTimer()
          expect(props.onActive).toHaveBeenCalledTimes(0)
          expect(result.current.isIdle()).toBe(true)
          fireEvent.mouseDown(document)
          await waitFor(() => result.current.isIdle() === false)
          expect(props.onActive).toHaveBeenCalledTimes(1)
        })

        it('Should update dynamically', async () => {
          props.timeout = 200
          props.startOnMount = false
          props.onIdle = jest.fn()
          props.onActive = jest.fn()

          const { result, rerender } = idleTimer()
          expect(result.current.isIdle()).toBe(true)
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
          expect(result.current.isIdle()).toBe(true)
          fireEvent.mouseDown(document)

          expect(result.current.isIdle()).toBe(true)
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

          expect(result.current.isIdle()).toBe(true)
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
          props.timeout = 2147483647
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
      })

      describe('.onActive', () => {
        it('Should call onActive on user input when user is idle', async () => {
          props.onActive = jest.fn()
          props.timeout = 200
          const { result } = idleTimer()
          await waitFor(() => result.current.isIdle())
          fireEvent.mouseDown(document)
          expect(props.onActive).toHaveBeenCalledTimes(1)
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
          props.onAction = jest.fn()
          props.timeout = 200
          const { result } = idleTimer()
          await waitFor(() => result.current.isIdle())
          fireEvent.mouseDown(document)
          expect(props.onAction).toHaveBeenCalledTimes(1)
        })

        it('Should allow reassignment of onAction', async () => {
          const fn1 = jest.fn()
          const fn2 = jest.fn()
          props.onAction = fn1
          props.timeout = 200
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
          expect(props.onMessage).toHaveBeenCalledWith(data)
        })
      })

      describe('.debounce', () => {
        it('Should error if debounce and throttle are set', done => {
          jest.spyOn(console, 'error')
          props.debounce = 200
          props.throttle = 200
          const { result } = idleTimer()
          expect(result.error).toEqual(new Error('❌ onAction can either be throttled or debounced, not both.'))
          done()
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
        it('Should error if throttle and debounce are set', done => {
          jest.spyOn(console, 'error')
          props.throttle = 200
          props.debounce = 200
          const { result } = idleTimer()
          expect(result.error).toEqual(new Error('❌ onAction can either be throttled or debounced, not both.'))
          done()
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
          expect(fn2).toHaveBeenCalledWith(data)
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
          expect(fn1).toHaveBeenCalledWith(data)
          expect(fn2).toHaveBeenCalledTimes(1)
          expect(fn2).toHaveBeenCalledWith(data)
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
          expect(fn1).toHaveBeenCalledWith(data)
          expect(fn2).toHaveBeenCalledTimes(1)
          expect(fn2).toHaveBeenCalledWith(data)
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
          expect(fn1).toHaveBeenCalledWith(data)
          expect(fn2).toHaveBeenCalledTimes(1)
          expect(fn2).toHaveBeenCalledWith(data)
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
          expect(fn1).toHaveBeenCalledWith(data)
          expect(fn2).toHaveBeenCalledTimes(1)
          expect(fn2).toHaveBeenCalledWith(data)
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

      describe('.getRemainingTime()', () => {
        it('Should return 0 for remaining time while idle', async () => {
          props.timeout = 200
          const { result } = idleTimer()
          await waitFor(() => result.current.isIdle())
          expect(result.current.getRemainingTime()).toBe(0)
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
          expect(result.current.getRemainingTime()).toBe(0)
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
          expect(result.current.getRemainingTime()).toBeAround(100, 10)

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

        it('Should reset when start or reset is called', async () => {
          props.timeout = 200
          const { result } = idleTimer()
          await sleep(100)
          expect(result.current.getRemainingTime()).toBeAround(100, 10)
          await waitFor(() => result.current.isIdle())
          expect(result.current.getRemainingTime()).toBe(0)
          result.current.reset()
          expect(result.current.getRemainingTime()).toBeAround(200, 10)
          await waitFor(() => result.current.isIdle())
          expect(result.current.getRemainingTime()).toBe(0)
          result.current.start()
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
          expect(result.current.getTotalActiveTime()).toBe(0)
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
      })
    })
  })
})
