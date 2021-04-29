/* eslint-env jest */

// Test utilities
import React from 'react'
import simulant from 'simulant'
import { mount } from 'enzyme'

// Tested component
import IdleTimer from '../index'
import { sleep, waitUntil } from '../utils'

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

    it('Should allow parent component to setState() inside onIdle()', async () => {
      const parent = mount(<Parent timeout={400} />)
      expect(parent.state('test')).toBe(true)
      await waitUntil(() => parent.state('test') === false)
      expect(parent.state('test')).toBe(false)
      expect(parent.instance().handleOnIdle).not.toThrow()
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
      props.onActive = jest.fn()
      const timer = idleTimer()
      expect(props.onActive.mock.calls.length).toBe(0)
      expect(timer.state().idle).toBe(true)
      simulant.fire(document, 'mousedown')
      expect(props.onActive.mock.calls.length).toBe(1)
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

    it('Should set custom element', async () => {
      props.element = window
      props.timeout = 200
      props.onActive = jest.fn()
      const timer = idleTimer()
      expect(timer.props().element).toBe(props.element)
      await waitUntil(() => timer.state('idle'))
      simulant.fire(props.element, 'mousedown')
      expect(props.onActive.mock.calls.length).toBe(1)
    })

    it('Should pause on idle when stopOnIdle is set', async () => {
      props.onIdle = jest.fn()
      props.onActive = jest.fn()
      props.timeout = 200
      props.stopOnIdle = true
      const timer = idleTimer()
      await waitUntil(() => timer.state('idle'))
      simulant.fire(document, 'mousedown')
      expect(props.onIdle.mock.calls.length).toBe(1)
      expect(props.onActive.mock.calls.length).toBe(0)
      expect(timer.state('idle')).toBe(true)
      expect(timer.instance().tId).toBe(null)
    })

    it('Should start on reset() when stopOnIdle is set', async () => {
      props.onIdle = jest.fn()
      props.onActive = jest.fn()
      props.timeout = 200
      props.stopOnIdle = true
      const timer = idleTimer()
      await waitUntil(() => timer.state('idle'))
      simulant.fire(document, 'mousedown')
      expect(props.onIdle.mock.calls.length).toBe(1)
      expect(props.onActive.mock.calls.length).toBe(0)
      expect(timer.state('idle')).toBe(true)
      expect(timer.instance().tId).toBe(null)
      timer.instance().reset()
      expect(timer.state('idle')).toBe(false)
      expect(timer.instance().tId).toBeGreaterThan(0)
    })

    it('Should go idle after reset() and user input when stopOnIdle is set', async () => {
      props.onIdle = jest.fn()
      props.onActive = jest.fn()
      props.timeout = 200
      props.stopOnIdle = true
      const timer = idleTimer()
      await waitUntil(() => timer.state('idle'))
      simulant.fire(document, 'mousedown')
      expect(props.onIdle.mock.calls.length).toBe(1)
      expect(props.onActive.mock.calls.length).toBe(0)
      expect(timer.state('idle')).toBe(true)
      expect(timer.instance().tId).toBe(null)
      timer.instance().reset()
      expect(timer.state('idle')).toBe(false)
      expect(timer.instance().tId).toBeGreaterThan(0)
      expect(timer.instance().getRemainingTime()).toBeAround(props.timeout, 5)
      simulant.fire(document, 'mousedown')
      await waitUntil(() => timer.state('idle'))
      expect(props.onIdle.mock.calls.length).toBe(2)
    })

    it('Should allow timeout to be changed dynamically', async () => {
      props.onIdle = jest.fn()
      props.timeout = 400
      const timer = idleTimer()
      await waitUntil(() => timer.state('idle'))
      expect(props.onIdle.mock.calls.length).toBe(1)
      timer.setProps({ timeout: 300 })
      await sleep(300)
      expect(props.onIdle.mock.calls.length).toBe(2)
    })

    it('Should call onActive if timeout changes while idle', async () => {
      props.onIdle = jest.fn()
      props.onActive = jest.fn()
      props.timeout = 200
      const timer = idleTimer()
      await waitUntil(() => timer.state('idle'))
      expect(props.onIdle.mock.calls.length).toBe(1)
      timer.setProps({ timeout: 300 })
      await waitUntil(() => timer.state('idle'))
      expect(props.onActive.mock.calls.length).toBe(1)
      expect(props.onIdle.mock.calls.length).toBe(2)
    })

    it('Should require manual call to start when startManually is set', async () => {
      props.startManually = true
      props.onIdle = jest.fn()
      props.onActive = jest.fn()
      props.timeout = 200
      const timer = idleTimer()
      expect(timer.state('idle')).toBe(true)
      simulant.fire(document, 'mousedown')
      expect(timer.state('idle')).toBe(true)
      timer.instance().start()
      expect(timer.state('idle')).toBe(false)
      await waitUntil(() => timer.state('idle'))
      expect(props.onIdle.mock.calls.length).toBe(1)
      expect(props.onActive.mock.calls.length).toBe(0)
      expect(timer.state('idle')).toBe(true)
      simulant.fire(document, 'mousedown')
      expect(props.onActive.mock.calls.length).toBe(1)
    })
  })

  describe('events', () => {
    it('Should set custom events', async () => {
      props.onActive = jest.fn()
      props.events = ['mousedown']
      props.timeout = 200
      const timer = idleTimer()
      await waitUntil(() => timer.state('idle'))
      simulant.fire(document, 'mousedown')
      simulant.fire(document, 'keypress')
      expect(props.onActive.mock.calls.length).toBe(1)
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
    it('Should call onIdle on user idle', async () => {
      props.onIdle = jest.fn()
      props.timeout = 200
      const timer = idleTimer()
      await waitUntil(() => timer.state('idle'))
      expect(props.onIdle.mock.calls.length).toBe(1)
    })

    it('Should not call onIdle on larger timeouts', async () => {
      props.onIdle = jest.fn()
      props.timeout = 2147483647
      idleTimer()
      await sleep(100)
      expect(props.onIdle.mock.calls.length).toBe(0)
    })

    it('Should call onActive on user input when user is idle', async () => {
      props.onActive = jest.fn()
      props.timeout = 200
      const timer = idleTimer()
      await waitUntil(() => timer.state('idle'))
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
      const timer = idleTimer()
      await waitUntil(() => timer.state('idle'))
      simulant.fire(document, 'mousedown')
      expect(props.onAction.mock.calls.length).toBe(1)
    })

    it('Should allow dynamic setting of onIdle and onActive on TabManager', async () => {
      props.timeout = 200
      props.startManually = true
      props.crossTab = {
        type: 'simulate'
      }
      const active1 = jest.fn()
      const idle1 = jest.fn()
      const active2 = jest.fn()
      const idle2 = jest.fn()
      props.onActive = active1
      props.onIdle = idle1

      const timer = idleTimer()
      await waitUntil(() => timer.instance().isLeader())

      timer.instance().start()
      await waitUntil(() => timer.state('idle'))

      expect(idle1.mock.calls.length).toBe(1)
      simulant.fire(document, 'mousedown')
      expect(active1.mock.calls.length).toBe(1)

      timer.setProps({ onActive: active2, onIdle: idle2 })

      await waitUntil(() => timer.state('idle'))
      expect(idle2.mock.calls.length).toBe(1)
      simulant.fire(document, 'mousedown')
      expect(active2.mock.calls.length).toBe(1)
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

    it('Should unbind all events on idle when stopOnIdle is set', async () => {
      props.onAction = jest.fn()
      props.stopOnIdle = true
      props.timeout = 200
      const timer = idleTimer()
      await waitUntil(() => timer.state('idle'))
      simulant.fire(document, 'mousedown')
      expect(props.onAction.mock.calls.length).toBe(0)
      expect(timer.instance().eventsBound).toBe(false)
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

    it('Should update throttle prop', async () => {
      props.onAction = jest.fn()
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
      expect(props.onAction.mock.calls.length).toBe(1)
    })

    it('Should update debounce prop', async () => {
      props.onAction = jest.fn()
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
      expect(props.onAction.mock.calls.length).toBe(0)
    })

    it('Should remove throttle/debounce prop', async () => {
      props.onAction = jest.fn()
      props.timeout = 400
      props.debounce = 200
      const timer = idleTimer()
      timer.setProps({ debounce: 0 })
      simulant.fire(document, 'mousedown')
      await sleep(200)
      simulant.fire(document, 'mousedown')
      expect(timer.props().debounce).toBe(0)
      expect(props.onAction.mock.calls.length).toBe(2)
    })

    it('Should not throttle events', async () => {
      props.eventsThrottle = 0
      props.timeout = 200
      props.onActive = jest.fn()
      const timer = idleTimer()
      await waitUntil(() => timer.state('idle'))
      simulant.fire(document, 'mousedown')
      await waitUntil(() => timer.state('idle'))
      simulant.fire(document, 'mousedown')
      expect(props.onActive.mock.calls.length).toBe(2)
    })

    it('Should throttle events', async () => {
      props.eventsThrottle = 2000
      props.timeout = 1000
      props.onActive = jest.fn()
      const timer = idleTimer()
      await waitUntil(() => timer.state('idle'))
      simulant.fire(document, 'mousedown')
      await waitUntil(() => timer.state('idle'))
      simulant.fire(document, 'mousedown')
      expect(props.onActive.mock.calls.length).toBe(1)
    })

    it('Should allow eventsThrottle to be changed dynamically', async () => {
      props.eventsThrottle = 1000
      props.timeout = 200
      props.onActive = jest.fn()
      const timer = idleTimer()
      await waitUntil(() => timer.state('idle'))
      simulant.fire(document, 'mousedown')
      await waitUntil(() => timer.state('idle'))
      simulant.fire(document, 'mousedown')
      expect(props.onActive.mock.calls.length).toBe(1)
      timer.setProps({ eventsThrottle: 100 })
      simulant.fire(document, 'mousedown')
      await waitUntil(() => timer.state('idle'))
      simulant.fire(document, 'mousedown')
      await waitUntil(() => timer.state('idle'))
      simulant.fire(document, 'mousedown')
      expect(props.onActive.mock.calls.length).toBe(4)
    })
  })

  describe('methods', () => {
    describe('.reset()', () => {
      it('Should start timer when reset is called', () => {
        props.startOnMount = false
        const timer = idleTimer()
        timer.instance().reset()
        expect(timer.instance().tId).toBeGreaterThan(0)
      })

      it('Should bind all events on reset()', async () => {
        props.onAction = jest.fn()
        props.stopOnIdle = true
        props.timeout = 200
        const timer = idleTimer()
        await waitUntil(() => timer.state('idle'))
        simulant.fire(document, 'mousedown')
        expect(props.onAction.mock.calls.length).toBe(0)
        expect(timer.instance().eventsBound).toBe(false)
        timer.instance().reset()
        simulant.fire(document, 'mousedown')
        expect(props.onAction.mock.calls.length).toBe(1)
        expect(timer.instance().eventsBound).toBe(true)
      })
    })

    describe('.pause()', () => {
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
        props.onAction = jest.fn()
        props.stopOnIdle = true
        props.timeout = 200
        const timer = idleTimer()
        timer.instance().pause()
        simulant.fire(document, 'mousedown')
        expect(props.onAction.mock.calls.length).toBe(0)
        expect(timer.instance().eventsBound).toBe(false)
        done()
      })
    })

    describe('.resume()', () => {
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
        props.onAction = jest.fn()
        props.stopOnIdle = true
        props.timeout = 200
        const timer = idleTimer()
        timer.instance().pause()
        simulant.fire(document, 'mousedown')
        expect(props.onAction.mock.calls.length).toBe(0)
        expect(timer.instance().eventsBound).toBe(false)
        timer.instance().resume()
        simulant.fire(document, 'mousedown')
        expect(props.onAction.mock.calls.length).toBe(1)
        expect(timer.instance().eventsBound).toBe(true)
        done()
      })

      it('Should resume from paused time', async () => {
        props.timeout = 3000
        const timer = idleTimer()
        timer.instance().pause()
        const time = timer.instance().getRemainingTime()
        expect(timer.instance().tId).toBe(null)
        await sleep(500)
        timer.instance().resume()
        expect(timer.instance().getRemainingTime()).toBeAround(time, 5)
        expect(timer.instance().tId).toBeGreaterThan(0)
      })
    })

    describe('.getRemainingTime()', () => {
      it('Should return 0 for remaining time while idle', async () => {
        props.timeout = 200
        const timer = idleTimer()
        await waitUntil(() => timer.state('idle'))
        expect(timer.instance().getRemainingTime()).toBe(0)
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

    describe('.getElapsedTime()', () => {
      it('Should get the elapsed time', async () => {
        const timer = idleTimer()
        await sleep(200)
        expect(timer.instance().getElapsedTime()).toBeAround(200, 30)
      })
    })

    describe('.getLastIdleTime()', () => {
      it('Should get the last idle time', async () => {
        props.timeout = 200
        const timer = idleTimer()
        await waitUntil(() => timer.state('idle'))
        const lastIdle = timer.instance().getLastIdleTime()
        simulant.fire(document, 'mousedown')
        await sleep(100)
        expect(timer.instance().getLastIdleTime()).toBe(lastIdle)
      })
    })

    describe('.getTotalIdleTime()', () => {
      it('Should get the total idle time', async () => {
        props.timeout = 200
        const timer = idleTimer()

        await sleep(300)
        expect(timer.instance().getTotalIdleTime()).toBeAround(300, 30)
        simulant.fire(document, 'mousedown')

        await sleep(100)
        expect(timer.instance().getTotalIdleTime()).toBeAround(300, 30)
        simulant.fire(document, 'mousedown')

        await sleep(300)
        expect(timer.instance().getTotalIdleTime()).toBeAround(700, 30)

      })
    })

    describe('.getLastActiveTime()', () => {
      it('Should get the last active time', async () => {
        props.timeout = 200
        const timer = idleTimer()
        const lastActive = timer.instance().getLastActiveTime()
        await waitUntil(() => timer.state('idle'))
        expect(timer.instance().getLastActiveTime()).toBe(lastActive)
      })
    })

    describe('.getTotalActiveTime()', () => {
      it('Should get the total active time', async () => {
        props.timeout = 300
        const timer = idleTimer()

        // Test during active
        await sleep(100)
        expect(timer.instance().getTotalActiveTime()).toBeAround(100, 30)

        // Test after idle
        await waitUntil(() => timer.state('idle'))
        expect(timer.instance().getTotalActiveTime()).toBeAround(0, 30)

        // Activate
        simulant.fire(document, 'mousedown')
        await sleep(100)

        simulant.fire(document, 'mousedown')
        await sleep(100)

        simulant.fire(document, 'mousedown')
        await sleep(400)

        expect(timer.instance().getTotalActiveTime()).toBeAround(200, 50)
      })
    })

    describe('.isIdle()', () => {
      it('Should get the idle state', async () => {
        props.timeout = 200
        const timer = idleTimer()
        expect(timer.instance().isIdle()).toBe(false)
        await waitUntil(() => timer.state('idle'))
        expect(timer.instance().isIdle()).toBe(true)
      })
    })

    describe('.isLeader()', () => {
      it('Should return true when crossTab is off', async () => {
        props.timeout = 200
        const timer = idleTimer()
        expect(timer.instance().isLeader()).toBe(true)
      })
    })
  })
})
