/* eslint-env jest */
import 'regenerator-runtime/runtime'
import expect from 'expect'
import { configure } from 'enzyme'
import Adapter from '@wojtekmaj/enzyme-adapter-react-17'

configure({ adapter: new Adapter() })

expect.extend({
  toBeAround (actual, expected, precision = 2) {
    const pass = (actual <= expected + precision && actual >= expected - precision)
    if (pass) {
      return {
        message: () => `expected ${actual} not to be around ${expected}`,
        pass: true
      }
    } else {
      return {
        message: () => `expected ${actual} to be around ${expected}`,
        pass: false
      }
    }
  }
})

// Mock BroadcastChannel
const channels = {}
global.BroadcastChannel = class BroadcastChannel {
  constructor (name) {
    this.name = name
    this.listeners = {
      message: [],
      messageerror: []
    }
    if (!channels[name]) channels[name] = []
    channels[name].push(this)
  }

  postMessage (data) {
    const filtered = channels[this.name].filter(channel => channel !== this)
    for (const channel of filtered) {
      channel.onmessage({ data })
      for (const fn of channel.listeners.message) {
        fn({ data })
      }
    }
  }

  onMessage () {}
  onMessageError () {}

  addEventListener (type, fn) {
    this.listeners[type].push(fn)
  }

  removeEventListener (type, fn) {
    const index = this.listeners[type][fn]
    this.listeners[type].splice(index)
  }

  close () {
    delete channels.name
  }
}
