/* eslint-env jest */
import expect from 'expect'
import { configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

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
