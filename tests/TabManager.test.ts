import { MessageAction, TabManager } from '../src/TabManager'
import { waitFor, sleep } from './test.utils'

let managers = []
const createTabManager = ({
  channelName = 'idle-timer',
  fallbackInterval = 2000,
  responseTime = 100,
  emitOnAllTabs = false,
  onIdle = () => {},
  onActive = () => {},
  onMessage = () => {},
  start = () => {},
  reset = () => {},
  pause = () => {},
  resume = () => {}
} = {}) => {
  const manager = new TabManager({
    channelName,
    fallbackInterval,
    responseTime,
    emitOnAllTabs,
    onIdle,
    onActive,
    onMessage,
    start,
    reset,
    pause,
    resume
  })
  managers.push(manager)
  return manager
}

const t3s = { timeout: 3000 }

describe('TabManager', () => {
  afterEach(() => {
    for (const manager of managers) {
      manager.close()
    }
    managers = []
  })

  it('Should create a TabManager', () => {
    const manager = createTabManager()
    expect(manager).toBeDefined()
  })

  it('Should become the leader', async () => {
    const manager = createTabManager()
    await waitFor(() => manager.isLeader === true, t3s)
    expect(manager.isLeader).toBe(true)
  })

  it('Should close the TabManager', async () => {
    const manager = createTabManager()
    expect(() => manager.close()).not.toThrow()
  })

  it('Should call onIdle when all tabs are idle', async () => {
    const options = {
      onIdle: jest.fn(),
      onActive: jest.fn()
    }
    const manager = createTabManager(options)
    manager.allIdle = false
    await waitFor(() => manager.isLeader === true, t3s)

    const manager2 = createTabManager()
    manager2.idle()
    manager.idle()

    await waitFor(() => options.onIdle.mock.calls.length === 1)
    expect(options.onIdle).toBeCalledTimes(1)
  })

  it('Should call onActive when one tab becomes active', async () => {
    const options = {
      onIdle: jest.fn(),
      onActive: jest.fn()
    }
    const manager = createTabManager(options)
    manager.allIdle = true
    await waitFor(() => manager.isLeader === true, t3s)

    const manager2 = createTabManager()
    manager2.allIdle = true
    manager2.active()

    await waitFor(() => options.onActive.mock.calls.length === 1)

    expect(options.onActive).toHaveBeenCalledTimes(1)
  })

  it('Should deregister when tab closes', async () => {
    const options = {
      onIdle: jest.fn(),
      onActive: jest.fn()
    }
    const manager = createTabManager(options)
    await waitFor(() => manager.isLeader === true, t3s)

    const manager2 = createTabManager()
    await sleep(200)
    manager2.active()

    manager2.close()
    manager.idle()

    await waitFor(() => options.onIdle.mock.calls.length === 1)
    expect(options.onIdle).toHaveBeenCalledTimes(1)
  })

  it('Should emit events on all tabs', async () => {
    const options = {
      onIdle: jest.fn(),
      onActive: jest.fn(),
      emitOnAllTabs: true
    }

    const manager = createTabManager(options)
    await waitFor(() => manager.isLeader === true, t3s)

    const manager2 = createTabManager(options)
    await sleep(200)

    manager2.idle()
    await waitFor(() => options.onIdle.mock.calls.length === 2)

    manager.active()
    await waitFor(() => options.onActive.mock.calls.length === 2)

    expect(options.onActive).toHaveBeenCalledTimes(2)
    expect(options.onIdle).toHaveBeenCalledTimes(2)
  })

  it('Should emit the start event', async () => {
    const options = {
      start: jest.fn()
    }

    const manager = createTabManager(options)
    await waitFor(() => manager.isLeader === true, t3s)

    const manager2 = createTabManager()
    manager2.send(MessageAction.START)

    await waitFor(() => options.start.mock.calls.length === 1)
    expect(options.start).toHaveBeenCalledTimes(1)
  })

  it('Should emit the start  on sync', async () => {
    const options = {
      reset: jest.fn()
    }

    const manager = createTabManager(options)
    await waitFor(() => manager.isLeader === true, t3s)

    const manager2 = createTabManager()
    manager2.sync()

    await waitFor(() => options.reset.mock.calls.length === 1)
    expect(options.reset).toHaveBeenCalledTimes(1)
  })

  it('Should emit the reset event', async () => {
    const options = {
      reset: jest.fn()
    }

    const manager = createTabManager(options)
    await waitFor(() => manager.isLeader === true, t3s)

    const manager2 = createTabManager()
    manager2.send(MessageAction.RESET)

    await waitFor(() => options.reset.mock.calls.length === 1)
    expect(options.reset).toHaveBeenCalledTimes(1)
  })

  it('Should emit the pause event', async () => {
    const options = {
      pause: jest.fn()
    }

    const manager = createTabManager(options)
    await waitFor(() => manager.isLeader === true, t3s)

    const manager2 = createTabManager()
    manager2.send(MessageAction.PAUSE)

    await waitFor(() => options.pause.mock.calls.length === 1)
    expect(options.pause).toHaveBeenCalledTimes(1)
  })

  it('Should emit the resume event', async () => {
    const options = {
      resume: jest.fn()
    }

    const manager = createTabManager(options)
    await waitFor(() => manager.isLeader === true, t3s)

    const manager2 = createTabManager()
    manager2.send(MessageAction.RESUME)

    await waitFor(() => options.resume.mock.calls.length === 1)
    expect(options.resume).toHaveBeenCalledTimes(1)
  })

  it('Should emit the message event', async () => {
    const options = {
      onMessage: jest.fn()
    }

    const manager = createTabManager(options)
    await waitFor(() => manager.isLeader === true, t3s)

    const data = 'foo'
    const manager2 = createTabManager()
    manager2.message(data)

    await waitFor(() => options.onMessage.mock.calls.length === 1)
    expect(options.onMessage).toHaveBeenCalledTimes(1)
    expect(options.onMessage).toHaveBeenCalledWith(data)
  })
})
