/* eslint-env jest */

// Test utilities
import { renderHook } from '@testing-library/react-hooks'
import simulant from 'simulant'
import { sleep, waitUntil } from '../utils'

// Tested component
import { useIdleTimer } from '../index'

// Test Suite
describe('useIdleTimer', () => {
  let props

  // Create an idle timer instance
  const idleTimer = () => {
    return renderHook(() => useIdleTimer(props))
  }

  // Reset the tests
  beforeEach(() => {
    props = {
      timeout: undefined,
      element: undefined,
      events: undefined,
      onIdle: undefined,
      onActive: undefined,
      onAction: undefined,
      debounce: undefined,
      throttle: undefined,
      eventsThrottle: undefined,
      startOnMount: undefined,
      startManually: undefined,
      stopOnIdle: undefined,
      capture: undefined,
      passive: undefined,
      crossTab: undefined
    }
  })

  describe('useIdleTimer', () => {
    describe('properties', () => {
      it('Should not start when startOnMount is set', () => {
        props.startOnMount = false
        const { result } = idleTimer()
        expect(result.current.isIdle()).toBe(true)
      })

      it('Should start on first event when startOnMount is set', () => {
        props.startOnMount = false
        props.onActive = jest.fn()
        const { result } = idleTimer()
        expect(props.onActive.mock.calls.length).toBe(0)
        expect(result.current.isIdle()).toBe(true)
        simulant.fire(document, 'mousedown')
        expect(result.current.isIdle()).toBe(false)
        expect(props.onActive.mock.calls.length).toBe(1)
      })

      it('Should set custom element', async () => {
        props.element = window
        props.timeout = 200
        props.onActive = jest.fn()
        const { result } = idleTimer()
        await waitUntil(() => result.current.isIdle())
        simulant.fire(props.element, 'mousedown')
        expect(props.onActive.mock.calls.length).toBe(1)
      })

      it('Should pause on idle when stopOnIdle is set', async () => {
        props.onIdle = jest.fn()
        props.onActive = jest.fn()
        props.timeout = 200
        props.stopOnIdle = true
        const { result } = idleTimer()
        await waitUntil(() => result.current.isIdle())
        simulant.fire(document, 'mousedown')
        expect(props.onIdle.mock.calls.length).toBe(1)
        expect(props.onActive.mock.calls.length).toBe(0)
        expect(result.current.isIdle()).toBe(true)
      })

      it('Should start on reset() when stopOnIdle is set', async () => {
        props.onIdle = jest.fn()
        props.onActive = jest.fn()
        props.timeout = 200
        props.stopOnIdle = true
        const { result } = idleTimer()
        await waitUntil(() => result.current.isIdle())
        simulant.fire(document, 'mousedown')
        expect(props.onIdle.mock.calls.length).toBe(1)
        expect(props.onActive.mock.calls.length).toBe(0)
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
        await waitUntil(() => result.current.isIdle())
        simulant.fire(document, 'mousedown')
        expect(props.onIdle.mock.calls.length).toBe(1)
        expect(props.onActive.mock.calls.length).toBe(0)
        expect(result.current.isIdle()).toBe(true)
        result.current.reset()
        expect(result.current.isIdle()).toBe(false)
        expect(result.current.getRemainingTime()).toBeAround(props.timeout, 3)
        simulant.fire(document, 'mousedown')
        await waitUntil(() => result.current.isIdle())
        expect(props.onIdle.mock.calls.length).toBe(2)
      })

      it('Should allow timeout to be changed dynamically', async () => {
        props.onIdle = jest.fn()
        props.timeout = 200
        const { rerender, result } = idleTimer()
        await waitUntil(() => result.current.isIdle())
        expect(props.onIdle.mock.calls.length).toBe(1)
        props.timeout = 300
        rerender()
        await waitUntil(() => result.current.isIdle())
        expect(props.onIdle.mock.calls.length).toBe(2)
      })

      it('Should call onActive if timeout changes while idle', async () => {
        props.onIdle = jest.fn()
        props.onActive = jest.fn()
        props.timeout = 200
        const { rerender, result } = idleTimer()
        await waitUntil(() => result.current.isIdle())
        expect(props.onIdle.mock.calls.length).toBe(1)
        props.timeout = 400
        rerender()
        await waitUntil(() => result.current.isIdle())
        expect(props.onActive.mock.calls.length).toBe(1)
        expect(props.onIdle.mock.calls.length).toBe(2)
      })

      it('Should require manual call to start when startManually is set', async () => {
        props.startManually = true
        props.onIdle = jest.fn()
        props.onActive = jest.fn()
        props.timeout = 200
        const { result } = idleTimer()
        expect(result.current.isIdle()).toBe(true)
        simulant.fire(document, 'mousedown')
        expect(result.current.isIdle()).toBe(true)
        result.current.start()
        expect(result.current.isIdle()).toBe(false)
        await waitUntil(() => result.current.isIdle())
        expect(props.onIdle.mock.calls.length).toBe(1)
        expect(props.onActive.mock.calls.length).toBe(0)
        expect(result.current.isIdle()).toBe(true)
        simulant.fire(document, 'mousedown')
        expect(props.onActive.mock.calls.length).toBe(1)
      })
    })

    describe('events', () => {
      it('Should set custom events', async () => {
        props.onActive = jest.fn()
        props.events = ['mousedown']
        props.timeout = 200
        const { result } = idleTimer()
        await waitUntil(() => result.current.isIdle())
        simulant.fire(document, 'mousedown')
        simulant.fire(document, 'keypress')
        expect(props.onActive.mock.calls.length).toBe(1)
      })
    })

    describe('event handlers', () => {
      it('Should call onIdle on user idle', async () => {
        props.onIdle = jest.fn()
        props.timeout = 200
        const { result } = idleTimer()
        await waitUntil(() => result.current.isIdle())
        expect(props.onIdle.mock.calls.length).toBe(1)
      })

      it('Should not call onIdle on larger timeouts', async () => {
        props.onIdle = jest.fn()
        props.timeout = 2147483647
        const { result } = idleTimer()
        await sleep(100)
        expect(props.onIdle.mock.calls.length).toBe(0)
      })

      it('Should call onActive on user input when user is idle', async () => {
        props.onActive = jest.fn()
        props.timeout = 200
        const { result } = idleTimer()
        await waitUntil(() => result.current.isIdle())
        simulant.fire(document, 'mousedown')
        expect(props.onActive.mock.calls.length).toBe(1)
      })

      it('Should not call onActive on user input when user is not idle', async () => {
        props.onActive = jest.fn()
        props.timeout = 400
        idleTimer()
        await sleep(300)
        simulant.fire(document, 'mousedown')
        expect(props.onActive.mock.calls.length).toBe(0)
      })

      it('Should call onAction on user input when user is not idle', async () => {
        props.onAction = jest.fn()
        props.timeout = 400
        props.debounce = 0
        idleTimer()
        await sleep(300)
        simulant.fire(document, 'mousedown')
        expect(props.onAction.mock.calls.length).toBe(1)
      })

      it('Should call onAction on user input when user is idle', async () => {
        props.onAction = jest.fn()
        props.timeout = 200
        props.debounce = 0
        const { result } = idleTimer()
        await waitUntil(() => result.current.isIdle())
        simulant.fire(document, 'mousedown')
        expect(props.onAction.mock.calls.length).toBe(1)
      })

      it('Should error if debounce and throttle are set', done => {
        jest.spyOn(console, 'error')
        props.timeout = 400
        props.debounce = 200
        props.throttle = 200
        const { result } = idleTimer()
        expect(result.error).toEqual(new Error('onAction can either be throttled or debounced (not both)'))
        done()
      })

      it('Should unbind all events on idle when stopOnIdle is set', async () => {
        props.onAction = jest.fn()
        props.stopOnIdle = true
        props.timeout = 200
        const { result } = idleTimer()
        await waitUntil(() => result.current.isIdle())
        simulant.fire(document, 'mousedown')
        expect(props.onAction.mock.calls.length).toBe(0)
      })

      it('Should debounce calls to onAction', async () => {
        props.onAction = jest.fn()
        props.timeout = 400
        props.debounce = 200
        idleTimer()
        simulant.fire(document, 'mousedown')
        simulant.fire(document, 'mousedown')
        simulant.fire(document, 'mousedown')
        simulant.fire(document, 'mousedown')
        await sleep(200)
        expect(props.onAction.mock.calls.length).toBe(1)
      })

      it('Should throttle calls to onAction', async () => {
        props.onAction = jest.fn()
        props.timeout = 400
        props.throttle = 200
        idleTimer()
        simulant.fire(document, 'mousedown')
        simulant.fire(document, 'mousedown')
        simulant.fire(document, 'mousedown')
        simulant.fire(document, 'mousedown')
        await sleep(200)
        expect(props.onAction.mock.calls.length).toBe(1)
      })

      it('Should not throttle events', async () => {
        props.eventsThrottle = 0
        props.timeout = 200
        props.onActive = jest.fn()
        const { result } = idleTimer()
        await waitUntil(() => result.current.isIdle())
        simulant.fire(document, 'mousedown')
        await waitUntil(() => result.current.isIdle())
        simulant.fire(document, 'mousedown')
        expect(props.onActive.mock.calls.length).toBe(2)
      })

      it('Should throttle events', async () => {
        props.eventsThrottle = 1000
        props.timeout = 200
        props.onActive = jest.fn()
        const { result } = idleTimer()
        await waitUntil(() => result.current.isIdle())
        simulant.fire(document, 'mousedown')
        await waitUntil(() => result.current.isIdle())
        simulant.fire(document, 'mousedown')
        expect(props.onActive.mock.calls.length).toBe(1)
      })

      it('Should allow eventsThrottle to be changed dynamically', async () => {
        props.eventsThrottle = 1000
        props.timeout = 200
        props.onActive = jest.fn()
        const { result, rerender } = idleTimer()
        await waitUntil(() => result.current.isIdle())
        simulant.fire(document, 'mousedown')
        await waitUntil(() => result.current.isIdle())
        simulant.fire(document, 'mousedown')
        expect(props.onActive.mock.calls.length).toBe(1)
        props.eventsThrottle = 100
        rerender()
        simulant.fire(document, 'mousedown')
        await waitUntil(() => result.current.isIdle())
        simulant.fire(document, 'mousedown')
        await waitUntil(() => result.current.isIdle())
        simulant.fire(document, 'mousedown')
        expect(props.onActive.mock.calls.length).toBe(4)
      })

      it('Should allow reassignment of onIdle', async () => {
        const fn1 = jest.fn()
        const fn2 = jest.fn()
        props.onIdle = fn1
        props.timeout = 200
        const { result, rerender } = idleTimer()
        await waitUntil(() => result.current.isIdle())
        simulant.fire(document, 'mousedown')
        expect(fn1.mock.calls.length).toBe(1)
        props.onIdle = fn2
        rerender()
        await waitUntil(() => result.current.isIdle())
        simulant.fire(document, 'mousedown')
        expect(fn2.mock.calls.length).toBe(1)
      })

      it('Should allow reassignment of onActive', async () => {
        const fn1 = jest.fn()
        const fn2 = jest.fn()
        props.onActive = fn1
        props.timeout = 200
        const { result, rerender } = idleTimer()
        await waitUntil(() => result.current.isIdle())
        simulant.fire(document, 'mousedown')
        expect(fn1.mock.calls.length).toBe(1)
        props.onActive = fn2
        rerender()
        await waitUntil(() => result.current.isIdle())
        simulant.fire(document, 'mousedown')
        expect(fn2.mock.calls.length).toBe(1)
      })

      it('Should allow reassignment of onAction', async () => {
        const fn1 = jest.fn()
        const fn2 = jest.fn()
        props.onAction = fn1
        props.timeout = 200
        const { result, rerender } = idleTimer()
        await waitUntil(() => result.current.isIdle())
        simulant.fire(document, 'mousedown')
        expect(fn1.mock.calls.length).toBe(1)
        props.onAction = fn2
        rerender()
        await waitUntil(() => result.current.isIdle())
        simulant.fire(document, 'mousedown')
        expect(fn2.mock.calls.length).toBe(1)
      })
    })

    describe('methods', () => {
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
          await waitUntil(() => result.current.isIdle())
          simulant.fire(document, 'mousedown')
          expect(props.onAction.mock.calls.length).toBe(0)
          result.current.reset()
          simulant.fire(document, 'mousedown')
          expect(props.onAction.mock.calls.length).toBe(1)
        })
      })

      describe('.pause()', () => {
        it('Should pause the idleTimer instance', () => {
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

        it('Should unbind all events on pause()', done => {
          props.onAction = jest.fn()
          props.stopOnIdle = true
          props.timeout = 400
          const { result } = idleTimer()
          result.current.pause()
          simulant.fire(document, 'mousedown')
          expect(props.onAction.mock.calls.length).toBe(0)
          done()
        })
      })

      describe('.resume()', () => {
        it('Should resume a paused idleTimer instance', async () => {
          const { result } = idleTimer()
          result.current.pause()
          const remaining = result.current.getRemainingTime()
          result.current.resume()
          await sleep(100)
          expect(result.current.getRemainingTime()).toBeLessThan(remaining)
        })

        it('Should not resume a running idleTimer instance', async () => {
          const { result } = idleTimer()
          const remaining = result.current.getRemainingTime()
          result.current.resume()
          await sleep(100)
          expect(result.current.getRemainingTime()).toBeLessThan(remaining)
        })

        it('Should bind all events on resume()', done => {
          props.onAction = jest.fn()
          props.stopOnIdle = true
          props.timeout = 400
          const { result } = idleTimer()
          result.current.pause()
          simulant.fire(document, 'mousedown')
          expect(props.onAction.mock.calls.length).toBe(0)
          result.current.resume()
          simulant.fire(document, 'mousedown')
          expect(props.onAction.mock.calls.length).toBe(1)
          done()
        })

        it('Should resume from paused time', async () => {
          props.timeout = 3000
          const { result } = idleTimer()
          result.current.pause()
          const time = result.current.getRemainingTime()
          await sleep(500)
          result.current.resume()
          expect(result.current.getRemainingTime()).toBeAround(time, 5)
        })
      })

      describe('.getRemainingTime()', () => {
        it('Should return 0 for remaining time while idle', async () => {
          props.timeout = 200
          const { result } = idleTimer()
          await waitUntil(() => result.current.isIdle())
          expect(result.current.getRemainingTime()).toBe(0)
        })

        it('Should return remaining time while paused', () => {
          const { result } = idleTimer()
          const remaining = result.current.getRemainingTime()
          result.current.pause()
          expect(result.current.getRemainingTime()).toBeAround(remaining, 5)
        })

        it('Should never return a negative number for remaining time', () => {
          props.timeout = -1
          const { result } = idleTimer()
          expect(result.current.getRemainingTime()).toBe(0)
        })
      })

      describe('.getElapsedTime()', () => {
        it('Should get the elapsed time', async () => {
          const { result } = idleTimer()
          await sleep(500)
          expect(result.current.getElapsedTime()).toBeAround(500, 30)
        })
      })

      describe('.getLastIdleTime()', () => {
        it('Should get the last idle time', async () => {
          props.timeout = 200
          const { result } = idleTimer()
          await waitUntil(() => result.current.isIdle())
          const lastIdle = result.current.getLastIdleTime()
          simulant.fire(document, 'mousedown')
          await sleep(100)
          expect(result.current.getLastIdleTime()).toBe(lastIdle)
        })
      })

      describe('.getTotalIdleTime()', () => {
        it('Should get the total idle time', async () => {
          props.timeout = 200
          const { result } = idleTimer()

          await sleep(300)
          expect(result.current.getTotalIdleTime()).toBeAround(300, 30)
          simulant.fire(document, 'mousedown')

          await sleep(100)
          expect(result.current.getTotalIdleTime()).toBeAround(300, 30)
          simulant.fire(document, 'mousedown')

          await sleep(300)
          expect(result.current.getTotalIdleTime()).toBeAround(700, 30)

        })
      })

      describe('.getLastActiveTime()', () => {
        it('Should get the last active time', async () => {
          props.timeout = 200
          const { result } = idleTimer()
          const lastActive = result.current.getLastActiveTime()
          await waitUntil(() => result.current.isIdle())
          expect(result.current.getLastActiveTime()).toBe(lastActive)
        })
      })

      describe('.getTotalActiveTime()', () => {
        it('Should get the total active time', async () => {
          props.timeout = 300
          const { result } = idleTimer()

          // Test during active
          await sleep(100)
          expect(result.current.getTotalActiveTime()).toBeAround(100, 30)

          // Test after idle
          await waitUntil(() => result.current.isIdle())
          expect(result.current.getTotalActiveTime()).toBeAround(0, 30)

          // Activate
          simulant.fire(document, 'mousedown')
          await sleep(100)

          simulant.fire(document, 'mousedown')
          await sleep(100)

          simulant.fire(document, 'mousedown')
          await sleep(400)

          expect(result.current.getTotalActiveTime()).toBeAround(200, 50)
        })
      })

      describe('.isIdle()', () => {
        it('Should get the idle state', async () => {
          props.timeout = 200
          const { result } = idleTimer()
          expect(result.current.isIdle()).toBe(false)
          await waitUntil(() => result.current.isIdle())
          expect(result.current.isIdle()).toBe(true)
        })
      })
    })
  })
})
