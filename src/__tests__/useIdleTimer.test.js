/* eslint-env jest */

// Test utilities
import { renderHook } from '@testing-library/react-hooks'
import simulant from 'simulant'
import sinon from 'sinon'

// Tested component
import { useIdleTimer } from '../index'

// Test Suite
describe('useIdleTimer', () => {
  let props

  // Create an idle timer instance
  const idleTimer = () => {
    return renderHook(() => useIdleTimer(props))
  }

  const sleep = time => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve()
      }, time)
    })
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
      stopOnIdle: undefined,
      capture: undefined,
      passive: undefined
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
        props.onActive = sinon.spy()
        const { result } = idleTimer()
        expect(props.onActive.callCount).toBe(0)
        expect(result.current.isIdle()).toBe(true)
        simulant.fire(document, 'mousedown')
        expect(result.current.isIdle()).toBe(false)
        expect(props.onActive.callCount).toBe(1)
      })

      it('Should set custom element', async done => {
        props.element = window
        props.timeout = 200
        props.onActive = sinon.spy()
        idleTimer()
        await sleep(500)
        simulant.fire(props.element, 'mousedown')
        expect(props.onActive.callCount).toBe(1)
        done()
      })

      it('Should pause on idle when stopOnIdle is set', async done => {
        props.onIdle = sinon.spy()
        props.onActive = sinon.spy()
        props.timeout = 400
        props.stopOnIdle = true
        const { result } = idleTimer()
        await sleep(500)
        simulant.fire(document, 'mousedown')
        expect(props.onIdle.callCount).toBe(1)
        expect(props.onActive.callCount).toBe(0)
        expect(result.current.isIdle()).toBe(true)
        done()
      })

      it('Should start on reset() when stopOnIdle is set', async done => {
        props.onIdle = sinon.spy()
        props.onActive = sinon.spy()
        props.timeout = 400
        props.stopOnIdle = true
        const { result } = idleTimer()
        await sleep(500)
        simulant.fire(document, 'mousedown')
        expect(props.onIdle.callCount).toBe(1)
        expect(props.onActive.callCount).toBe(0)
        expect(result.current.isIdle()).toBe(true)
        result.current.reset()
        expect(result.current.isIdle()).toBe(false)
        done()
      })

      it('Should go idle after reset() and user input when stopOnIdle is set', async done => {
        props.onIdle = sinon.spy()
        props.onActive = sinon.spy()
        props.timeout = 400
        props.stopOnIdle = true
        const { result } = idleTimer()
        await sleep(500)
        simulant.fire(document, 'mousedown')
        expect(props.onIdle.callCount).toBe(1)
        expect(props.onActive.callCount).toBe(0)
        expect(result.current.isIdle()).toBe(true)
        result.current.reset()
        expect(result.current.isIdle()).toBe(false)
        expect(result.current.getRemainingTime()).toBeAround(props.timeout, 3)
        simulant.fire(document, 'mousedown')
        await sleep(500)
        expect(props.onIdle.callCount).toBe(2)
        done()
      })

      it('Should allow timeout to be changed dynamically', async done => {
        props.onIdle = sinon.spy()
        props.timeout = 500
        const { rerender } = idleTimer()
        await sleep(600)
        expect(props.onIdle.callCount).toBe(1)
        props.timeout = 300
        rerender()
        await sleep(400)
        expect(props.onIdle.callCount).toBe(2)
        done()
      })

      it('Should call onActive if timeout changes while idle', async done => {
        props.onIdle = sinon.spy()
        props.onActive = sinon.spy()
        props.timeout = 500
        const { rerender } = idleTimer()
        await sleep(600)
        expect(props.onIdle.callCount).toBe(1)
        props.timeout = 300
        rerender()
        await sleep(400)
        expect(props.onActive.callCount).toBe(1)
        expect(props.onIdle.callCount).toBe(2)
        done()
      })
    })

    describe('events', () => {
      it('Should set custom events', async done => {
        props.onActive = sinon.spy()
        props.events = ['mousedown']
        props.timeout = 200
        idleTimer()
        await sleep(500)
        simulant.fire(document, 'mousedown')
        simulant.fire(document, 'keypress')
        expect(props.onActive.callCount).toBe(1)
        done()
      })
    })

    describe('event handlers', () => {
      it('Should call onIdle on user idle', async done => {
        props.onIdle = sinon.spy()
        props.timeout = 400
        idleTimer()
        await sleep(500)
        expect(props.onIdle.callCount).toBe(1)
        done()
      })

      it('Should not call onIdle on larger timeouts', async done => {
        props.onIdle = sinon.spy()
        props.timeout = 2147483647
        idleTimer()
        await sleep(100)
        expect(props.onIdle.callCount).toBe(0)
        done()
      })

      it('Should call onActive on user input when user is idle', async done => {
        props.onActive = sinon.spy()
        props.timeout = 400
        idleTimer()
        await sleep(500)
        simulant.fire(document, 'mousedown')
        expect(props.onActive.callCount).toBe(1)
        done()
      })

      it('Should not call onActive on user input when user is not idle', async done => {
        props.onActive = sinon.spy()
        props.timeout = 400
        idleTimer()
        await sleep(300)
        simulant.fire(document, 'mousedown')
        expect(props.onActive.callCount).toBe(0)
        done()
      })

      it('Should call onAction on user input when user is not idle', async done => {
        props.onAction = sinon.spy()
        props.timeout = 400
        props.debounce = 0
        idleTimer()
        await sleep(300)
        simulant.fire(document, 'mousedown')
        expect(props.onAction.callCount).toBe(1)
        done()
      })

      it('Should call onAction on user input when user is idle', async done => {
        props.onAction = sinon.spy()
        props.timeout = 400
        props.debounce = 0
        idleTimer()
        await sleep(500)
        simulant.fire(document, 'mousedown')
        expect(props.onAction.callCount).toBe(1)
        done()
      })

      it('Should error if debounce and throttle are set', done => {
        jest.spyOn(console, 'error')
        console.error.mockImplementation(() => { })
        props.timeout = 400
        props.debounce = 200
        props.throttle = 200
        let errorMessage
        try {
          idleTimer()
        } catch (err) {
          errorMessage = err.message
        }
        expect(errorMessage).toBe('onAction can either be throttled or debounced (not both)')
        console.error.mockRestore()
        done()
      })

      it('Should unbind all events on idle when stopOnIdle is set', async done => {
        props.onAction = sinon.spy()
        props.stopOnIdle = true
        props.timeout = 400
        idleTimer()
        await sleep(500)
        simulant.fire(document, 'mousedown')
        expect(props.onAction.callCount).toBe(0)
        done()
      })

      it('Should debounce calls to onAction', async done => {
        props.onAction = sinon.spy()
        props.timeout = 400
        props.debounce = 200
        idleTimer()
        simulant.fire(document, 'mousedown')
        simulant.fire(document, 'mousedown')
        simulant.fire(document, 'mousedown')
        simulant.fire(document, 'mousedown')
        await sleep(200)
        expect(props.onAction.callCount).toBe(1)
        done()
      })

      it('Should throttle calls to onAction', async done => {
        props.onAction = sinon.spy()
        props.timeout = 400
        props.throttle = 200
        idleTimer()
        simulant.fire(document, 'mousedown')
        simulant.fire(document, 'mousedown')
        simulant.fire(document, 'mousedown')
        simulant.fire(document, 'mousedown')
        await sleep(200)
        expect(props.onAction.callCount).toBe(1)
        done()
      })
    })

    describe('methods', () => {
      describe('reset', () => {
        it('Should start timer when reset is called', () => {
          props.startOnMount = false
          const { result } = idleTimer()
          result.current.reset()
          expect(result.current.isIdle()).toBe(false)
        })

        it('Should bind all events on reset()', async done => {
          props.onAction = sinon.spy()
          props.stopOnIdle = true
          props.timeout = 400
          const { result } = idleTimer()
          await sleep(500)
          simulant.fire(document, 'mousedown')
          expect(props.onAction.callCount).toBe(0)
          result.current.reset()
          simulant.fire(document, 'mousedown')
          expect(props.onAction.callCount).toBe(1)
          done()
        })
      })

      describe('pause', () => {
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
          props.onAction = sinon.spy()
          props.stopOnIdle = true
          props.timeout = 400
          const { result } = idleTimer()
          result.current.pause()
          simulant.fire(document, 'mousedown')
          expect(props.onAction.callCount).toBe(0)
          done()
        })
      })

      describe('resume', () => {
        it('Should resume a paused idleTimer instance', async done => {
          const { result } = idleTimer()
          result.current.pause()
          const remaining = result.current.getRemainingTime()
          result.current.resume()
          await sleep(100)
          expect(result.current.getRemainingTime()).toBeLessThan(remaining)
          done()
        })

        it('Should not resume a running idleTimer instance', async done => {
          const { result } = idleTimer()
          const remaining = result.current.getRemainingTime()
          result.current.resume()
          await sleep(100)
          expect(result.current.getRemainingTime()).toBeLessThan(remaining)
          done()
        })

        it('Should bind all events on resume()', done => {
          props.onAction = sinon.spy()
          props.stopOnIdle = true
          props.timeout = 400
          const { result } = idleTimer()
          result.current.pause()
          simulant.fire(document, 'mousedown')
          expect(props.onAction.callCount).toBe(0)
          result.current.resume()
          simulant.fire(document, 'mousedown')
          expect(props.onAction.callCount).toBe(1)
          done()
        })

        it('Should resume from paused time', async done => {
          props.timeout = 3000
          const { result } = idleTimer()
          result.current.pause()
          const time = result.current.getRemainingTime()
          await sleep(2000)
          result.current.resume()
          expect(result.current.getRemainingTime()).toBeAround(time, 5)
          done()
        })
      })

      describe('getRemainingTime', () => {
        it('Should return 0 for remaining time while idle', async done => {
          props.timeout = 200
          const { result } = idleTimer()
          await sleep(500)
          expect(result.current.getRemainingTime()).toBe(0)
          done()
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

      describe('getElapsedTime', () => {
        it('Should get the elapsed time', async done => {
          const { result } = idleTimer()
          await sleep(500)
          expect(result.current.getElapsedTime()).toBeAround(500, 20)
          done()
        })
      })

      describe('getLastIdleTime', () => {
        it('Should get the last idle time', async done => {
          props.timeout = 200
          const { result } = idleTimer()
          await sleep(300)
          const lastIdle = result.current.getLastIdleTime()
          simulant.fire(document, 'mousedown')
          await sleep(100)
          expect(result.current.getLastIdleTime()).toBe(lastIdle)
          done()
        })
      })

      describe('getTotalIdleTime', () => {
        it('Should get the total idle time', async done => {
          props.timeout = 200
          const { result } = idleTimer()

          await sleep(300)
          expect(result.current.getTotalIdleTime()).toBeAround(300, 20)
          simulant.fire(document, 'mousedown')

          await sleep(100)
          expect(result.current.getTotalIdleTime()).toBeAround(300, 20)
          simulant.fire(document, 'mousedown')

          await sleep(300)
          expect(result.current.getTotalIdleTime()).toBeAround(700, 20)

          done()
        })
      })

      describe('getLastActiveTime', () => {
        it('Should get the last active time', async done => {
          props.timeout = 200
          const { result } = idleTimer()
          const lastActive = result.current.getLastActiveTime()
          await sleep(300)
          expect(result.current.getLastActiveTime()).toBe(lastActive)
          done()
        })
      })

      describe('getTotalActiveTime', () => {
        it('Should get the total active time', async done => {
          props.timeout = 300
          const { result } = idleTimer()

          // Test during active
          await sleep(100)
          expect(result.current.getTotalActiveTime()).toBeAround(100, 20)

          // Test after idle
          await sleep(400)
          expect(result.current.getTotalActiveTime()).toBeAround(0, 20)

          // Activate
          simulant.fire(document, 'mousedown')
          await sleep(100)

          simulant.fire(document, 'mousedown')
          await sleep(100)

          simulant.fire(document, 'mousedown')
          await sleep(400)

          expect(result.current.getTotalActiveTime()).toBeAround(200, 50)
          done()
        })
      })

      describe('isIdle', () => {
        it('Should get the idle state', async done => {
          props.timeout = 200
          const { result } = idleTimer()
          expect(result.current.isIdle()).toBe(false)
          await sleep(500)
          expect(result.current.isIdle()).toBe(true)
          done()
        })
      })
    })
  })
})
