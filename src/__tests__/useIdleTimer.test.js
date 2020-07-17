/* eslint-env jest */

// Test utilities
import React from 'react'
import { act } from 'react-dom/test-utils'
import { mount } from 'enzyme'
import simulant from 'simulant'
import sinon from 'sinon'

// Tested component
import { useIdleTimer } from '../index'

// Test Suite
describe('useIdleTimer', () => {
  let props
  let mounted

  // Create an idle timer instance
  const idleTimer = () => {
    const values = {}
    const Parent = () => {
      Object.assign(values, useIdleTimer(props))
      return null
    }

    if (!mounted) {
      mounted = mount(<Parent {...props} />)
    }
    return values
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
  })

  describe('useIdleTimer', () => {
    describe('properties', () => {
      it('Should not start when startOnMount is set', () => {
        props.startOnMount = false
        const timer = idleTimer()
        expect(timer.isIdle).toBe(true)
      })

      xit('Should start on first event when startOnMount is set', () => {
        props.startOnMount = false
        props.onActive = sinon.spy()
        const timer = idleTimer()
        expect(props.onActive.callCount).toBe(0)
        expect(timer.isIdle).toBe(true)
        act(() => {
          simulant.fire(document, 'mousedown')
        })
        expect(props.onActive.callCount).toBe(1)
      })
    })
  })
})
