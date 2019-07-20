/* eslint-env jest */

// Test utilities
import React from 'react'
import sinon from 'sinon'
import simulant from 'simulant'
import { mount } from 'enzyme'

// Tested component
import IdleTimer from '../index'

// Parent component
class Parent extends React.Component {
  constructor (props) {
    super(props)
    this.state = { test: true }
    this.onIdle = this._onIdle.bind(this)
  }

  render () {
    return (
      <div>
        {this.state.test ? (
          <IdleTimer
            onIdle={this.onIdle}
            ref={ref => { this.idleTimer = ref }}
            {...this.props}
          />
        ) : <div />}
      </div>
    )
  }

  _onIdle () {
    this.setState({ test: false })
  }
}

// Test Suite
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
      onAction: undefined,
      debounce: undefined,
      throttle: undefined,
      startOnMount: undefined,
      stopOnIdle: undefined,
      capture: undefined,
      passive: undefined
    }
    mounted = undefined
    children = undefined
  })

  describe('lifecycle', () => {
    it('Should render its children', () => {
      children = <div>test</div>
      const divs = idleTimer().find('div')
      expect(divs.first().html()).toBe('<div>test</div>')
    })

    it('Should unmount the component', () => {
      const timer = idleTimer()
      expect(Object.keys(timer.props()).length).toBeGreaterThan(0)
      timer.unmount()
      expect(timer.exists()).toBe(false)
    })

    it('Should allow parent component to setState() inside onIdle()', done => {
      const parent = mount(<Parent timeout={400} />)
      expect(parent.state('test')).toBe(true)
      setTimeout(() => {
        expect(parent.state('test')).toBe(false)
        expect(parent.instance().onIdle).not.toThrow()
        done()
      }, 500)
    })
  })

  describe('properties', () => {
    it('Should not start when startOnMount is set', () => {
      props.startOnMount = false
      const timer = idleTimer()
      expect(timer.state().idle).toBe(true)
    })

    it('Should start on first event when startOnMount is set', () => {
      props.startOnMount = false
      props.onActive = sinon.spy()
      const timer = idleTimer()
      expect(props.onActive.callCount).toBe(0)
      expect(timer.state().idle).toBe(true)
      simulant.fire(document, 'mousedown')
      expect(props.onActive.callCount).toBe(1)
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

    it('Should set custom element', done => {
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

    it('Should pause on idle when stopOnIdle is set', (done) => {
      props.onIdle = sinon.spy()
      props.onActive = sinon.spy()
      props.timeout = 400
      props.stopOnIdle = true
      const timer = idleTimer()
      setTimeout(() => {
        simulant.fire(document, 'mousedown')
        expect(props.onIdle.callCount).toBe(1)
        expect(props.onActive.callCount).toBe(0)
        expect(timer.state('idle')).toBe(true)
        expect(timer.instance().tId).toBe(null)
        done()
      }, 500)
    })

    it('Should start on reset() when stopOnIdle is set', (done) => {
      props.onIdle = sinon.spy()
      props.onActive = sinon.spy()
      props.timeout = 400
      props.stopOnIdle = true
      const timer = idleTimer()
      setTimeout(() => {
        simulant.fire(document, 'mousedown')
        expect(props.onIdle.callCount).toBe(1)
        expect(props.onActive.callCount).toBe(0)
        expect(timer.state('idle')).toBe(true)
        expect(timer.instance().tId).toBe(null)
        timer.instance().reset()
        expect(timer.state('idle')).toBe(false)
        expect(timer.instance().tId).toBeGreaterThan(0)
        done()
      }, 500)
    })

    it('Should go idle after reset() and user input when stopOnIdle is set', (done) => {
      props.onIdle = sinon.spy()
      props.onActive = sinon.spy()
      props.timeout = 400
      props.stopOnIdle = true
      const timer = idleTimer()
      setTimeout(() => {
        simulant.fire(document, 'mousedown')
        expect(props.onIdle.callCount).toBe(1)
        expect(props.onActive.callCount).toBe(0)
        expect(timer.state('idle')).toBe(true)
        expect(timer.instance().tId).toBe(null)
        timer.instance().reset()
        expect(timer.state('idle')).toBe(false)
        expect(timer.instance().tId).toBeGreaterThan(0)
        expect(timer.instance().getRemainingTime()).toBeAround(props.timeout, 3)
        simulant.fire(document, 'mousedown')

        setTimeout(() => {
          expect(props.onIdle.callCount).toBe(2)
          done()
        }, 500)
      }, 500)
    })

    describe('events', () => {
      it('Should set custom events', (done) => {
        props.onActive = sinon.spy()
        props.events = ['mousedown']
        props.timeout = 200
        idleTimer()
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
      idleTimer()
      setTimeout(() => {
        expect(props.onIdle.callCount).toBe(1)
        done()
      }, 500)
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
      props.timeout = 400
      props.debounce = 200
      props.throttle = 200
      try {
        idleTimer()
      } catch (err) {
        expect(err.message).toBe('onAction can either be throttled or debounced (not both)')
        done()
      }
    })

    it('Should unbind all events on idle when stopOnIdle is set', done => {
      props.onAction = sinon.spy()
      props.stopOnIdle = true
      props.timeout = 400
      const timer = idleTimer()
      setTimeout(() => {
        simulant.fire(document, 'mousedown')
        expect(props.onAction.callCount).toBe(0)
        expect(timer.state('eventsBound')).toBe(false)
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

    it('Should update throttle prop', done => {
      props.onAction = sinon.spy()
      props.timeout = 400
      props.throttle = 200
      const timer = idleTimer()
      timer.setProps({ throttle: 1000 })
      simulant.fire(document, 'mousedown')
      simulant.fire(document, 'mousedown')
      simulant.fire(document, 'mousedown')
      simulant.fire(document, 'mousedown')
      setTimeout(() => {
        expect(timer.props().throttle).toBe(1000)
        expect(props.onAction.callCount).toBe(1)
        done()
      }, 200)
    })

    it('Should update debounce prop', done => {
      props.onAction = sinon.spy()
      props.timeout = 400
      props.debounce = 200
      const timer = idleTimer()
      timer.setProps({ debounce: 1000 })
      simulant.fire(document, 'mousedown')
      simulant.fire(document, 'mousedown')
      simulant.fire(document, 'mousedown')
      simulant.fire(document, 'mousedown')
      setTimeout(() => {
        simulant.fire(document, 'mousedown')
        expect(timer.props().debounce).toBe(1000)
        expect(props.onAction.callCount).toBe(0)
        done()
      }, 200)
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

      it('Should bind all events on reset()', done => {
        props.onAction = sinon.spy()
        props.stopOnIdle = true
        props.timeout = 400
        const timer = idleTimer()
        setTimeout(() => {
          simulant.fire(document, 'mousedown')
          expect(props.onAction.callCount).toBe(0)
          expect(timer.state('eventsBound')).toBe(false)
          timer.instance().reset()
          simulant.fire(document, 'mousedown')
          expect(props.onAction.callCount).toBe(1)
          expect(timer.state('eventsBound')).toBe(true)
          done()
        }, 500)
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

      it('Should unbind all events on pause()', done => {
        props.onAction = sinon.spy()
        props.stopOnIdle = true
        props.timeout = 400
        const timer = idleTimer()
        timer.instance().pause()
        simulant.fire(document, 'mousedown')
        expect(props.onAction.callCount).toBe(0)
        expect(timer.state('eventsBound')).toBe(false)
        done()
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

      it('Should bind all events on resume()', done => {
        props.onAction = sinon.spy()
        props.stopOnIdle = true
        props.timeout = 400
        const timer = idleTimer()
        timer.instance().pause()
        simulant.fire(document, 'mousedown')
        expect(props.onAction.callCount).toBe(0)
        expect(timer.state('eventsBound')).toBe(false)
        timer.instance().resume()
        simulant.fire(document, 'mousedown')
        expect(props.onAction.callCount).toBe(1)
        expect(timer.state('eventsBound')).toBe(true)
        done()
      })

      it('Should resume from paused time', done => {
        const timer = idleTimer()
        timer.instance().pause()
        props.timeout = 3000
        const time = timer.instance().getRemainingTime()
        expect(timer.instance().tId).toBe(null)
        setTimeout(() => {
          timer.instance().resume()
          expect(timer.instance().getRemainingTime()).toBeAround(time, 5)
          expect(timer.instance().tId).toBeGreaterThan(0)
          done()
        }, 2000)
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
        expect(timer.instance().getRemainingTime()).toBeAround(timer.state().remaining, 5)
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
