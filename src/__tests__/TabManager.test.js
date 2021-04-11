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
      onIdle: () => { },
      onActive: () => { }
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
    const onIdle = jest.fn()
    const manager = createTabManager({ onIdle })
    manager.setAllIdle(false)
    await waitUntil(() => manager.isLeader() === true)

    const manager2 = createTabManager()
    manager2.send('register')
    await sleep(200)

    manager2.idle()
    manager.idle()

    await waitUntil(() => onIdle.mock.calls.length === 1)

    expect(onIdle.mock.calls.length).toBe(1)
  })

  it('Should call onActive when one tab becomes active', async () => {
    const onActive = jest.fn()
    const manager = createTabManager({ onActive })
    manager.setAllIdle(true)
    await waitUntil(() => manager.isLeader() === true)

    const manager2 = createTabManager()
    manager2.active()
    manager.active()

    await waitUntil(() => onActive.mock.calls.length === 1)

    expect(onActive.mock.calls.length).toBe(1)
  })

  it('Should unregister when tab closes', async () => {
    const onIdle = jest.fn()
    const manager = createTabManager({ onIdle })
    await waitUntil(() => manager.isLeader() === true)

    const manager2 = createTabManager()
    await sleep(200)
    manager2.active()

    await manager2.close()
    manager.idle()

    await waitUntil(() => onIdle.mock.calls.length === 1)
    expect(onIdle.mock.calls.length).toBe(1)
  })

  it('Should emit events on all tabs', async () => {
    const onIdle = jest.fn()
    const onActive = jest.fn()
    const options = {
      onIdle, 
      onActive, 
      emitOnAllTabs: true 
    }

    const manager = createTabManager(options)
    await waitUntil(() => manager.isLeader() === true)

    const manager2 = createTabManager(options)
    await sleep(200)
    
    manager2.active()
    await waitUntil(() => onActive.mock.calls.length === 2)
    
    manager.idle()
    manager2.idle()
    await waitUntil(() => onIdle.mock.calls.length === 2)

    expect(onActive.mock.calls.length).toBe(2)
    expect(onIdle.mock.calls.length).toBe(2)
  })
})