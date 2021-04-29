/* eslint-env jest */
import { TabManager } from '../TabManager'
import { sleep, waitUntil } from '../utils'

describe('TabManager', () => {

  let managers = []

  const createTabManager = (props = {}) => {
    props = Object.assign({
      type: 'simulate',
      channelName: 'idle-timer',
      fallbackInterval: 2000,
      responseTime: 100,
      emitOnAllTabs: false,
      callbacks: {
        onIdle: () => { },
        onActive: () => { }
      },
      start: () => { },
      reset: () => { },
      pause: () => { },
      resume: () => { },
    }, props)
    const manager = TabManager(props)
    managers.push(manager)
    return manager
  }

  afterEach(async () => {
    for (const manager of managers) {
      await manager.close()
    }
    managers = []
  })

  it('Should create a TabManager', () => {
    const manager = createTabManager()
    expect(manager).toBeDefined()
  })

  it('Should become the leader', async () => {
    const manager = createTabManager()
    await waitUntil(() => manager.isLeader() === true)
    expect(manager.isLeader()).toBe(true)
  })

  it('Should set all idle', async () => {
    const manager = createTabManager()
    manager.setAllIdle(false)
    expect(manager.isAllIdle()).toBe(false)
    manager.setAllIdle(true)
    expect(manager.isAllIdle()).toBe(true)
  })

  it('Should close the TabManager', async () => {
    const manager = createTabManager()
    expect(async () => await manager.close()).not.toThrow()
  })

  it('Should call onIdle when all tabs are idle', async () => {
    const callbacks = {
      onIdle: jest.fn(),
      onActive: jest.fn()
    }
    const manager = createTabManager({ callbacks })
    manager.setAllIdle(false)
    await waitUntil(() => manager.isLeader() === true)

    const manager2 = createTabManager()
    manager2.idle()
    manager.idle()

    await waitUntil(() => callbacks.onIdle.mock.calls.length === 1)

    expect(callbacks.onIdle.mock.calls.length).toBe(1)
  })

  it('Should call onActive when one tab becomes active', async () => {
    const callbacks = {
      onIdle: jest.fn(),
      onActive: jest.fn()
    }
    const manager = createTabManager({ callbacks })
    manager.setAllIdle(true)
    await waitUntil(() => manager.isLeader() === true)

    const manager2 = createTabManager()
    manager2.active()
    manager.active()

    await waitUntil(() => callbacks.onActive.mock.calls.length === 1)

    expect(callbacks.onActive.mock.calls.length).toBe(1)
  })

  it('Should deregister when tab closes', async () => {
    const callbacks = {
      onIdle: jest.fn(),
      onActive: jest.fn()
    }
    const manager = createTabManager({ callbacks })
    await waitUntil(() => manager.isLeader() === true)

    const manager2 = createTabManager()
    await sleep(200)
    manager2.active()

    await manager2.close()
    manager.idle()

    await waitUntil(() => callbacks.onIdle.mock.calls.length === 1)
    expect(callbacks.onIdle.mock.calls.length).toBe(1)
  })

  it('Should emit events on all tabs', async () => {
    const callbacks = {
      onIdle: jest.fn(),
      onActive: jest.fn()
    }
    const options = {
      callbacks,
      emitOnAllTabs: true 
    }

    const manager = createTabManager(options)
    await waitUntil(() => manager.isLeader() === true)

    const manager2 = createTabManager(options)
    await sleep(200)
    
    manager2.active()
    await waitUntil(() => callbacks.onActive.mock.calls.length === 2)
    
    manager.idle()
    manager2.idle()
    await waitUntil(() => callbacks.onIdle.mock.calls.length === 2)

    expect(callbacks.onActive.mock.calls.length).toBe(2)
    expect(callbacks.onIdle.mock.calls.length).toBe(2)
  })

  it('Should emit the start event', async () => {
    const start = jest.fn()
    const options = { start }

    const manager = createTabManager(options)
    await waitUntil(() => manager.isLeader() === true)

    const manager2 = createTabManager()
    manager2.send('start')

    await waitUntil(() => start.mock.calls.length === 1)
    expect(start.mock.calls.length).toBe(1)
  })

  it('Should emit the reset event', async () => {
    const reset = jest.fn()
    const options = { reset }

    const manager = createTabManager(options)
    await waitUntil(() => manager.isLeader() === true)

    const manager2 = createTabManager()
    manager2.send('reset')

    await waitUntil(() => reset.mock.calls.length === 1)
    expect(reset.mock.calls.length).toBe(1)
  })

  it('Should emit the pause event', async () => {
    const pause = jest.fn()
    const options = { pause }

    const manager = createTabManager(options)
    await waitUntil(() => manager.isLeader() === true)

    const manager2 = createTabManager()
    manager2.send('pause')

    await waitUntil(() => pause.mock.calls.length === 1)
    expect(pause.mock.calls.length).toBe(1)
  })

  it('Should emit the resume event', async () => {
    const resume = jest.fn()
    const options = { resume }

    const manager = createTabManager(options)
    await waitUntil(() => manager.isLeader() === true)

    const manager2 = createTabManager()
    manager2.send('resume')

    await waitUntil(() => resume.mock.calls.length === 1)
    expect(resume.mock.calls.length).toBe(1)
  })
})