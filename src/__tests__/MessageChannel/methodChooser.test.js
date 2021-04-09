/* eslint-env jest */
import { chooseMethod } from '../../MessageChannel/methodChooser'

describe('methodChooser', () => {
  it('Should allow for method choice by config', () => {
    const simulateMethod = chooseMethod({ type: 'simulate' })
    const localStorageMethod = chooseMethod({ type: 'localStorage' })
    const broadcastChannelMethod = chooseMethod({ type: 'broadcastChannel' })
    
    expect(simulateMethod.type).toBe('simulate')
    expect(localStorageMethod.type).toBe('localStorage')
    expect(broadcastChannelMethod.type).toBe('broadcastChannel')
  })
  
  it('Should automatically choose the best method', () => {
    const automaticMethod = chooseMethod()
    expect(automaticMethod.type).toBe('broadcastChannel')
  })

  it('Should throw on undefined method', () => {
    expect(() => chooseMethod({ type: 'unsupported' })).toThrow()
  })
})