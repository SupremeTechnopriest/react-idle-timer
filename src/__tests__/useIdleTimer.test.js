/* eslint-env jest */

// Test utilities
import { renderHook, act } from '@testing-library/react-hooks'
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
        act(() => {
          simulant.fire(document, 'mousedown')
        })
        expect(result.current.isIdle()).toBe(false)
        expect(props.onActive.callCount).toBe(1)
      })

      it('Should set custom element', done => {
        props.element = window
        props.timeout = 200
        props.onActive = sinon.spy()
        idleTimer()
        setTimeout(() => {
          simulant.fire(props.element, 'mousedown')
          expect(props.onActive.callCount).toBe(1)
          done()
        }, 500)
      })

      it('Should pause on idle when stopOnIdle is set', done => {
        props.onIdle = sinon.spy()
        props.onActive = sinon.spy()
        props.timeout = 400
        props.stopOnIdle = true
        const { result } = idleTimer()
        setTimeout(() => {
          simulant.fire(document, 'mousedown')
          expect(props.onIdle.callCount).toBe(1)
          expect(props.onActive.callCount).toBe(0)
          expect(result.current.isIdle()).toBe(true)
          done()
        }, 500)
      })

      it('Should start on reset() when stopOnIdle is set', done => {
        props.onIdle = sinon.spy()
        props.onActive = sinon.spy()
        props.timeout = 400
        props.stopOnIdle = true
        const { result } = idleTimer()
        setTimeout(() => {
          simulant.fire(document, 'mousedown')
          expect(props.onIdle.callCount).toBe(1)
          expect(props.onActive.callCount).toBe(0)
          expect(result.current.isIdle()).toBe(true)
          result.current.reset()
          expect(result.current.isIdle()).toBe(false)
          done()
        }, 500)
      })

      it('Should go idle after reset() and user input when stopOnIdle is set', done => {
        props.onIdle = sinon.spy()
        props.onActive = sinon.spy()
        props.timeout = 400
        props.stopOnIdle = true
        const { result } = idleTimer()
        setTimeout(() => {
          simulant.fire(document, 'mousedown')
          expect(props.onIdle.callCount).toBe(1)
          expect(props.onActive.callCount).toBe(0)
          expect(result.current.isIdle()).toBe(true)
          result.current.reset()
          expect(result.current.isIdle()).toBe(false)
          expect(result.current.getRemainingTime()).toBeAround(props.timeout, 3)
          simulant.fire(document, 'mousedown')

          setTimeout(() => {
            expect(props.onIdle.callCount).toBe(2)
            done()
          }, 500)
        }, 500)
      })

      it('Should allow timeout to be changed dynamically', done => {
        props.onIdle = sinon.spy()
        props.timeout = 500
        const { result, rerender } = idleTimer()
        setTimeout(() => {
          expect(props.onIdle.callCount).toBe(1)
          props.timeout = 300
          rerender()
          result.current.reset()
          setTimeout(() => {
            expect(props.onIdle.callCount).toBe(2)
            done()
          }, 400)
        }, 600)
      })
    })

    describe('events', () => {
      it('Should set custom events', done => {
        props.onActive = sinon.spy()
        props.events = ['mousedown']
        props.timeout = 200
        idleTimer()
        setTimeout(() => {
          simulant.fire(document, 'mousedown')
          simulant.fire(document, 'keypress')
          expect(props.onActive.callCount).toBe(1)
          done()
        }, 500)
      })
    })

    describe('event handlers', () => {
      it('Should call onIdle on user idle', done => {
        props.onIdle = sinon.spy()
        props.timeout = 400
        idleTimer()
        setTimeout(() => {
          expect(props.onIdle.callCount).toBe(1)
          done()
        }, 500)
      })

      it('Should not call onIdle on larger timeouts', done => {
        props.onIdle = sinon.spy()
        props.timeout = 2147483647
        idleTimer()
        setTimeout(() => {
          expect(props.onIdle.callCount).toBe(0)
          done()
        }, 100)
      })

      it('Should call onActive on user input when user is idle', done => {
        props.onActive = sinon.spy()
        props.timeout = 400
        idleTimer()
        setTimeout(() => {
          simulant.fire(document, 'mousedown')
          expect(props.onActive.callCount).toBe(1)
          done()
        }, 500)
      })

      it('Should not call onActive on user input when user is not idle', done => {
        props.onActive = sinon.spy()
        props.timeout = 400
        idleTimer()
        setTimeout(() => {
          simulant.fire(document, 'mousedown')
          expect(props.onActive.callCount).toBe(0)
          done()
        }, 300)
      })

      it('Should call onAction on user input when user is not idle', done => {
        props.onAction = sinon.spy()
        props.timeout = 400
        props.debounce = 0
        idleTimer()
        setTimeout(() => {
          simulant.fire(document, 'mousedown')
          expect(props.onAction.callCount).toBe(1)
          done()
        }, 300)
      })

      it('Should call onAction on user input when user is idle', done => {
        props.onAction = sinon.spy()
        props.timeout = 400
        props.debounce = 0
        idleTimer()
        setTimeout(() => {
          simulant.fire(document, 'mousedown')
          expect(props.onAction.callCount).toBe(1)
          done()
        }, 500)
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

      it('Should unbind all events on idle when stopOnIdle is set', done => {
        props.onAction = sinon.spy()
        props.stopOnIdle = true
        props.timeout = 400
        idleTimer()
        setTimeout(() => {
          simulant.fire(document, 'mousedown')
          expect(props.onAction.callCount).toBe(0)
          done()
        }, 500)
      })

      it('Should debounce calls to onAction', done => {
        props.onAction = sinon.spy()
        props.timeout = 400
        props.debounce = 200
        idleTimer()
        simulant.fire(document, 'mousedown')
        simulant.fire(document, 'mousedown')
        simulant.fire(document, 'mousedown')
        simulant.fire(document, 'mousedown')
        setTimeout(() => {
          expect(props.onAction.callCount).toBe(1)
          done()
        }, 200)
      })

      it('Should throttle calls to onAction', done => {
        props.onAction = sinon.spy()
        props.timeout = 400
        props.throttle = 200
        idleTimer()
        simulant.fire(document, 'mousedown')
        simulant.fire(document, 'mousedown')
        simulant.fire(document, 'mousedown')
        simulant.fire(document, 'mousedown')
        setTimeout(() => {
          expect(props.onAction.callCount).toBe(1)
          done()
        }, 200)
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

        it('Should bind all events on reset()', done => {
          props.onAction = sinon.spy()
          props.stopOnIdle = true
          props.timeout = 400
          const { result } = idleTimer()
          setTimeout(() => {
            simulant.fire(document, 'mousedown')
            expect(props.onAction.callCount).toBe(0)
            result.current.reset()
            simulant.fire(document, 'mousedown')
            expect(props.onAction.callCount).toBe(1)
            done()
          }, 500)
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
        it('Should resume a paused idleTimer instance', done => {
          const { result } = idleTimer()
          result.current.pause()
          const remaining = result.current.getRemainingTime()
          result.current.resume()
          setTimeout(() => {
            expect(result.current.getRemainingTime()).toBeLessThan(remaining)
            done()
          }, 100)
        })

        it('Should not resume a running idleTimer instance', done => {
          const { result } = idleTimer()
          const remaining = result.current.getRemainingTime()
          result.current.resume()
          setTimeout(() => {
            expect(result.current.getRemainingTime()).toBeLessThan(remaining)
            done()
          }, 100)
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

        it('Should resume from paused time', done => {
          props.timeout = 3000
          const { result } = idleTimer()
          result.current.pause()
          const time = result.current.getRemainingTime()
          setTimeout(() => {
            result.current.resume()
            expect(result.current.getRemainingTime()).toBeAround(time, 5)
            done()
          }, 2000)
        })
      })

      describe('getRemainingTime', () => {
        it('Should return 0 for remaining time while idle', done => {
          props.timeout = 200
          const { result } = idleTimer()
          setTimeout(() => {
            expect(result.current.getRemainingTime()).toBe(0)
            done()
          }, 500)
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
        it('Should get the elapsed time', done => {
          const { result } = idleTimer()
          setTimeout(() => {
            // Accurate within 20ms
            expect(result.current.getElapsedTime()).toBeAround(500, 20)
            done()
          }, 500)
        })
      })

      describe('getLastActiveTime', () => {
        it('Should get the last active time', done => {
          props.timeout = 200
          const { result } = idleTimer()
          const lastActive = result.current.getLastActiveTime()
          setTimeout(() => {
            expect(result.current.getLastActiveTime()).toBe(lastActive)
            done()
          }, 300)
        })
      })

      describe('getTotalActiveTime', () => {
        it('Should get the total active time', done => {
          props.timeout = 200
          const { result } = idleTimer()
          setTimeout(() => {
            expect(result.current.getTotalActiveTime()).toBeAround(props.timeout, 5)
            simulant.fire(document, 'mousedown')
            setTimeout(() => {
              expect(result.current.getTotalActiveTime()).toBeAround(props.timeout * 2, 10)
              done()
            }, 300)
          }, 300)
        })
      })

      describe('isIdle', () => {
        it('Should get the idle state', done => {
          props.timeout = 200
          const { result } = idleTimer()
          expect(result.current.isIdle()).toBe(false)
          setTimeout(() => {
            expect(result.current.isIdle()).toBe(true)
            done()
          }, 500)
        })
      })
    })
  })
})
