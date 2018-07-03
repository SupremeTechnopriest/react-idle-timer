// Test utilities
import React from 'react'
import sinon from 'sinon';
import simulant from 'simulant'
import { mount } from 'enzyme'

// Tested component
import IdleTimer from '../index'

const simulateEvent = (event, element, pageX, pageY) => {
 const evt = document.createEvent("MouseEvents")
 evt.initMouseEvent("click", true, true, window, 0, pageX, pageY, pageX, pageY, false, false, false, false, 0, null)
 [element].dispatchEvent(evt)
}

describe('IdleTimer', () => {
  let props
  let mounted
  let children

  // Create an idle timer instance
  const idleTimer = () => {
    if (!mounted) {
      mounted = mount(
        <IdleTimer {...props}>{children}</IdleTimer>
      )
    }
    return mounted
  }

  // Reset the tests
  beforeEach(() => {
    props = {
      timeout: undefined,
      element: undefined,
      events: undefined,
      onIdle: undefined,
      onActive: undefined,
      startOnMount: undefined,
      capture: undefined,
      passive: undefined
    }
    mounted = undefined
    children = undefined
  })

  describe('lifecycle', () => {
    it('Should mount its children', () => {
      children = <div>test</div>
      const divs = idleTimer().find('div')
      expect(divs.first().html()).toBe('<div>test</div>')
    })

    it('Should unmount the component', () => {
      const timer = idleTimer()
      expect(Object.keys(timer.props()).length).toBeGreaterThan(0)
      timer.unmount()
      expect(Object.keys(timer.props()).length).toBe(0)
    })
  })

  describe('properties', () => {
    it('Should not start when startOnMount is set', () => {
      props.startOnMount = false
      props.onActive = sinon.spy()
      const timer = idleTimer()
      expect(props.onActive.callCount).toBe(0)
    })

    it('Should set capture property', () => {
      props.capture = false
      const timer = idleTimer()
      expect(timer.props().capture).toBe(false)
    })

    it('Should set passive property', () => {
      props.passive = false
      const timer = idleTimer()
      expect(timer.props().passive).toBe(false)
    })

    it('Should set custom element', (done) => {
      props.element = window
      props.timeout = 200
      props.onActive = sinon.spy()
      const timer = idleTimer()
      expect(timer.props().element).toBe(props.element)
      setTimeout(() => {
        simulant.fire(props.element, 'mousedown')
        expect(props.onActive.callCount).toBe(1)
        done()
      }, 500)
    })

    describe('events', () => {

      it('Should set custom events', (done) => {
        props.onActive = sinon.spy()
        props.events = ['mousedown']
        props.timeout = 200
        const timer = idleTimer()
        setTimeout(() => {
          simulant.fire(document, 'mousedown')
          expect(props.onActive.callCount).toBe(1)
          done()
        }, 500)

      })

      // TODO: This test doesnt fully work yet because pageX and pageY
      // are not set on the event handler. See issue https://github.com/Rich-Harris/simulant/issues/19
      it('Should reject when mouse has not moved', () => {
        const timer = idleTimer()
        const tId = timer.instance().tId
        simulant.fire(document, 'mousemove', {
          pageX: 0,
          pageY: 0
        })
        expect(timer.instance().tId).toBe(tId)
      })

      // TODO: This test doesnt fully work yet because pageX and pageY
      // are not set on the event handler. See issue https://github.com/Rich-Harris/simulant/issues/19
      it('Should reject when input data is undefined', () => {
        const timer = idleTimer()
        const tId = timer.instance().tId
        simulant.fire(document, 'mousemove', {
          pageX: undefined,
          pageY: undefined
        })
        expect(timer.instance().tId).toBe(tId)
      })

      // TODO: This test doesnt fully work yet because pageX and pageY
      // are not set on the event handler. See issue https://github.com/Rich-Harris/simulant/issues/19
      it('Should reject when event occurs within 200ms of start', () => {
        const timer = idleTimer()
        const tId = timer.instance().tId
        simulant.fire(document, 'mousemove', {
          pageX: 1,
          pageY: 1
        })
        expect(timer.instance().tId).toBe(tId)
      })
    })
  })

  describe('event handlers', () => {
    it('Should call onIdle on user idle', done => {
      props.onIdle = sinon.spy()
      props.timeout = 400
      const timer = idleTimer()
      setTimeout(() => {
        expect(props.onIdle.callCount).toBe(1)
        done()
      }, 500)
    })

    it('Should call onActive on user input', done => {
      props.onActive = sinon.spy()
      props.timeout = 400
      const timer = idleTimer()
      setTimeout(() => {
        simulant.fire(document, 'mousedown')
        expect(props.onActive.callCount).toBe(1)
        done()
      }, 500)
    })
  })

  describe('methods', () => {

    describe('reset', () => {
      it('Should start timer when reset is called', () => {
        props.startOnMount = false
        const timer = idleTimer()
        timer.instance().reset()
        expect(timer.instance().tId).toBeGreaterThan(0)
      })
    })

    describe('pause', () => {
      it('Should pause the idleTimer instance', () => {
        const timer = idleTimer()
        timer.instance().pause()
        expect(timer.instance().tId).toBe(null)
      })

      it('Should not pause a paused idleTimer instance', () => {
        const timer = idleTimer()
        timer.instance().pause()
        timer.instance().pause()
        expect(timer.instance().tId).toBe(null)
        expect(timer.state().remaining).toBeDefined()
      })
    })

    describe('resume', () => {
      it('Should resume a paused idleTimer instance', () => {
        const timer = idleTimer()
        timer.instance().pause()
        expect(timer.instance().tId).toBe(null)
        timer.instance().resume()
        expect(timer.instance().tId).toBeGreaterThan(0)
      })

      it('Should not resume a running idleTimer instance', () => {
        const timer = idleTimer()
        const tId = timer.instance().tId
        timer.instance().resume()
        expect(timer.instance().tId).toBe(tId)
      })
    })

    describe('getRemainingTime', () => {
      it('Should return 0 for remaining time while idle', (done) => {
        props.timeout = 200
        const timer = idleTimer()
        setTimeout(() => {
          expect(timer.instance().getRemainingTime()).toBe(0)
          done()
        }, 500)
      })

      it('Should return remaining time while paused', () => {
        const timer = idleTimer()
        timer.instance().pause()
        expect(timer.instance().getRemainingTime()).toBe(timer.state().remaining)
      })

      it('Should never return a negative number for remaining time', () => {
        props.timeout = -1
        const timer = idleTimer()
        expect(timer.instance().getRemainingTime()).toBe(0)
      })
    })

    describe('getElapsedTime', () => {
      it('Should get the elapsed time', (done) => {
        const timer = idleTimer()
        const oldDate = timer.state().oldDate
        setTimeout(() => {
          // Accurate within 10ms
          expect(timer.instance().getElapsedTime()).toBeGreaterThanOrEqual(500)
          expect(timer.instance().getElapsedTime()).toBeLessThanOrEqual(510)
          done()
        }, 500)
      })
    })

    describe('getLastActiveTime', () => {
      it('Should get the last active time', done => {
        props.timeout = 200
        const timer = idleTimer()
        const lastActive = timer.state().lastActive
        setTimeout(() => {
          expect(timer.instance().getLastActiveTime()).toBe(lastActive)
          done()
        }, 500)
      })
    })

    describe('isIdle', () => {
      it('Should get the idle state', (done) => {
        props.timeout = 200
        const timer = idleTimer()
        expect(timer.instance().isIdle()).toBe(false)
        setTimeout(() => {
          expect(timer.instance().isIdle()).toBe(true)
          done()
        }, 500)
      })
    })
  })
})
