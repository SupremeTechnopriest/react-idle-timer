import React from 'react'
import { mount } from 'enzyme'
import IdleTimer from '../index'

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
      idleAction: undefined,
      activeAction: undefined,
      startOnMount: undefined
    }
    mounted = undefined
    children = undefined
  })

  it('Should mount its children', () => {
    children = <div>test</div>
    const divs = idleTimer().find('div')
    expect(divs.first().html()).toBe('<div>test</div>')
  })
})
