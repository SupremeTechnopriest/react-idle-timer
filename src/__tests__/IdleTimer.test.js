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
    this.handleOnIdle = this.handleOnIdle.bind(this)
  }

  render () {
    return (
      <div>
        {this.state.test ? (
          <IdleTimer
            onIdle={this.handleOnIdle} ref={ref => {
              this.idleTimer = ref
            }} {...this.props}
          />
        ) : <div />}
      </div>
    )
  }

  handleOnIdle () {
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
        <IdleTimer {...props}>
          {children}
        </IdleTimer>
      )
    }
    return mounted
  }

  // Sleep helper
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
    mounted = undefined
    children = undefined
  })

  describe('lifecycle', () => {
    it('Should render its children', () => {
      children = <div>test</div>
      const div = idleTimer().find('div')
      expect(div.first().html()).toBe('<div>test</div>')
    })

    it('Should unmount the component', () => {
      const timer = idleTimer()
      expect(Object.keys(timer.props()).length).toBeGreaterThan(0)
      timer.unmount()
      expect(timer.exists()).toBe(false)
    })

    it('Should allow parent component to setState() inside onIdle()', async done => {
      const parent = mount(<Parent timeout={400} />)
      expect(parent.state('test')).toBe(true)
      await sleep(500)
      expect(parent.state('test')).toBe(false)
      expect(parent.instance().handleOnIdle).not.toThrow()
      done()
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

    it('Should set custom element', async done => {
      props.element = window
      props.timeout = 200
      props.onActive = sinon.spy()
      const timer = idleTimer()
      expect(timer.props().element).toBe(props.element)
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
      const timer = idleTimer()
      await sleep(500)
      simulant.fire(document, 'mousedown')
      expect(props.onIdle.callCount).toBe(1)
      expect(props.onActive.callCount).toBe(0)
      expect(timer.state('idle')).toBe(true)
      expect(timer.instance().tId).toBe(null)
      done()
    })

    it('Should start on reset() when stopOnIdle is set', async done => {
      props.onIdle = sinon.spy()
      props.onActive = sinon.spy()
      props.timeout = 400
      props.stopOnIdle = true
      const timer = idleTimer()
      await sleep(500)
      simulant.fire(document, 'mousedown')
      expect(props.onIdle.callCount).toBe(1)
      expect(props.onActive.callCount).toBe(0)
      expect(timer.state('idle')).toBe(true)
      expect(timer.instance().tId).toBe(null)
      timer.instance().reset()
      expect(timer.state('idle')).toBe(false)
      expect(timer.instance().tId).toBeGreaterThan(0)
      done()
    })

    it('Should go idle after reset() and user input when stopOnIdle is set', async done => {
      props.onIdle = sinon.spy()
      props.onActive = sinon.spy()
      props.timeout = 400
      props.stopOnIdle = true
      const timer = idleTimer()
      await sleep(500)
      simulant.fire(document, 'mousedown')
      expect(props.onIdle.callCount).toBe(1)
      expect(props.onActive.callCount).toBe(0)
      expect(timer.state('idle')).toBe(true)
      expect(timer.instance().tId).toBe(null)
      timer.instance().reset()
      expect(timer.state('idle')).toBe(false)
      expect(timer.instance().tId).toBeGreaterThan(0)
      expect(timer.instance().getRemainingTime()).toBeAround(props.timeout, 5)
      simulant.fire(document, 'mousedown')
      await sleep(500)
      expect(props.onIdle.callCount).toBe(2)
      done()
    })

    it('Should allow timeout to be changed dynamically', async done => {
      props.onIdle = sinon.spy()
      props.timeout = 500
      const timer = idleTimer()
      await sleep(600)
      expect(props.onIdle.callCount).toBe(1)
      timer.setProps({ timeout: 300 })
      await sleep(400)
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

    // TODO: This test doesn't fully work yet because pageX and pageY
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

    // TODO: This test doesn't fully work yet because pageX and pageY
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

    // TODO: This test doesn't fully work yet because pageX and pageY
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
      console.error.mockImplementation(() => {})
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
      const timer = idleTimer()
      await sleep(500)
      simulant.fire(document, 'mousedown')
      expect(props.onAction.callCount).toBe(0)
      expect(timer.instance().eventsBound).toBe(false)
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

    it('Should update throttle prop', async done => {
      props.onAction = sinon.spy()
      props.timeout = 400
      props.throttle = 200
      const timer = idleTimer()
      timer.setProps({ throttle: 1000 })
      simulant.fire(document, 'mousedown')
      simulant.fire(document, 'mousedown')
      simulant.fire(document, 'mousedown')
      simulant.fire(document, 'mousedown')
      await sleep(200)
      expect(timer.props().throttle).toBe(1000)
      expect(props.onAction.callCount).toBe(1)
      done()
    })

    it('Should update debounce prop', async done => {
      props.onAction = sinon.spy()
      props.timeout = 400
      props.debounce = 200
      const timer = idleTimer()
      timer.setProps({ debounce: 1000 })
      simulant.fire(document, 'mousedown')
      simulant.fire(document, 'mousedown')
      simulant.fire(document, 'mousedown')
      simulant.fire(document, 'mousedown')
      await sleep(200)
      simulant.fire(document, 'mousedown')
      expect(timer.props().debounce).toBe(1000)
      expect(props.onAction.callCount).toBe(0)
      done()
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

      it('Should bind all events on reset()', async done => {
        props.onAction = sinon.spy()
        props.stopOnIdle = true
        props.timeout = 400
        const timer = idleTimer()
        await sleep(500)
        simulant.fire(document, 'mousedown')
        expect(props.onAction.callCount).toBe(0)
        expect(timer.instance().eventsBound).toBe(false)
        timer.instance().reset()
        simulant.fire(document, 'mousedown')
        expect(props.onAction.callCount).toBe(1)
        expect(timer.instance().eventsBound).toBe(true)
        done()
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
        expect(timer.instance().eventsBound).toBe(false)
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
        expect(timer.instance().eventsBound).toBe(false)
        timer.instance().resume()
        simulant.fire(document, 'mousedown')
        expect(props.onAction.callCount).toBe(1)
        expect(timer.instance().eventsBound).toBe(true)
        done()
      })

      it('Should resume from paused time', async done => {
        props.timeout = 3000
        const timer = idleTimer()
        timer.instance().pause()
        const time = timer.instance().getRemainingTime()
        expect(timer.instance().tId).toBe(null)
        await sleep(2000)
        timer.instance().resume()
        expect(timer.instance().getRemainingTime()).toBeAround(time, 5)
        expect(timer.instance().tId).toBeGreaterThan(0)
        done()
      })
    })

    describe('getRemainingTime', () => {
      it('Should return 0 for remaining time while idle', async done => {
        props.timeout = 200
        const timer = idleTimer()
        await sleep(500)
        expect(timer.instance().getRemainingTime()).toBe(0)
        done()
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
      it('Should get the elapsed time', async done => {
        const timer = idleTimer()
        await sleep(500)
        expect(timer.instance().getElapsedTime()).toBeAround(500, 20)
        done()
      })
    })

    describe('getLastIdleTime', () => {
      it('Should get the last idle time', async done => {
        props.timeout = 200
        const timer = idleTimer()
        await sleep(300)
        const lastIdle = timer.instance().getLastIdleTime()
        simulant.fire(document, 'mousedown')
        await sleep(100)
        expect(timer.instance().getLastIdleTime()).toBe(lastIdle)
        done()
      })
    })

    describe('getTotalIdleTime', () => {
      it('Should get the total idle time', async done => {
        props.timeout = 200
        const timer = idleTimer()

        await sleep(300)
        expect(timer.instance().getTotalIdleTime()).toBeAround(300, 20)
        simulant.fire(document, 'mousedown')

        await sleep(100)
        expect(timer.instance().getTotalIdleTime()).toBeAround(300, 20)
        simulant.fire(document, 'mousedown')

        await sleep(300)
        expect(timer.instance().getTotalIdleTime()).toBeAround(700, 20)

        done()
      })
    })

    describe('getLastActiveTime', () => {
      it('Should get the last active time', async done => {
        props.timeout = 200
        const timer = idleTimer()
        const lastActive = timer.instance().getLastActiveTime()
        await sleep(300)
        expect(timer.instance().getLastActiveTime()).toBe(lastActive)
        done()
      })
    })

    describe('getTotalActiveTime', () => {
      it('Should get the total active time', async done => {
        props.timeout = 300
        const timer = idleTimer()

        // Test during active
        await sleep(100)
        expect(timer.instance().getTotalActiveTime()).toBeAround(100, 20)

        // Test after idle
        await sleep(400)
        expect(timer.instance().getTotalActiveTime()).toBeAround(0, 20)

        // Activate
        simulant.fire(document, 'mousedown')
        await sleep(100)

        simulant.fire(document, 'mousedown')
        await sleep(100)

        simulant.fire(document, 'mousedown')
        await sleep(400)

        expect(timer.instance().getTotalActiveTime()).toBeAround(200, 50)
        done()
      })
    })

    describe('isIdle', () => {
      it('Should get the idle state', async done => {
        props.timeout = 200
        const timer = idleTimer()
        expect(timer.instance().isIdle()).toBe(false)
        await sleep(500)
        expect(timer.instance().isIdle()).toBe(true)
        done()
      })
    })
  })
})
