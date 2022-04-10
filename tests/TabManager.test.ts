import { MessageAction, TabManager } from '../src/TabManager'
import { waitFor, sleep } from './test.utils'

let managers = []
const createTabManager = ({
  channelName = 'idle-timer',
  onIdle = () => {},
  onActive = () => {},
  onMessage = () => {},
  onPrompt = () => {},
  start = () => {},
  reset = () => {},
  pause = () => {},
  resume = () => {}
} = {}) => {
  const manager = new TabManager({
    channelName,
    onIdle,
    onActive,
    onMessage,
    onPrompt,
    start,
    reset,
    pause,
    resume
  })
  managers.push(manager)
  return manager
}

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
    const manager2 = createTabManager()
    manager2.active()

    manager2.close()
    manager.idle()

    await waitFor(() => options.onIdle.mock.calls.length === 1)
    expect(options.onIdle).toHaveBeenCalledTimes(1)
  })

  it('Should emit events on all tabs', async () => {
    const options = {
      onIdle: jest.fn(),
      onActive: jest.fn()
    }

    const manager = createTabManager(options)
    const manager2 = createTabManager(options)
    await sleep(200)

    manager.idle()
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

    createTabManager(options)
    const manager2 = createTabManager()
    manager2.send(MessageAction.START)

    await waitFor(() => options.start.mock.calls.length === 1)
    expect(options.start).toHaveBeenCalledTimes(1)
  })

  it('Should emit the start on sync', async () => {
    const options = {
      reset: jest.fn()
    }

    createTabManager(options)
    const manager2 = createTabManager()
    manager2.sync()

    await waitFor(() => options.reset.mock.calls.length === 1)
    expect(options.reset).toHaveBeenCalledTimes(1)
  })

  it('Should emit the reset event', async () => {
    const options = {
      reset: jest.fn()
    }

    createTabManager(options)
    const manager2 = createTabManager()
    manager2.send(MessageAction.RESET)

    await waitFor(() => options.reset.mock.calls.length === 1)
    expect(options.reset).toHaveBeenCalledTimes(1)
  })

  it('Should emit the pause event', async () => {
    const options = {
      pause: jest.fn()
    }

    createTabManager(options)
    const manager2 = createTabManager()
    manager2.send(MessageAction.PAUSE)

    await waitFor(() => options.pause.mock.calls.length === 1)
    expect(options.pause).toHaveBeenCalledTimes(1)
  })

  it('Should emit the resume event', async () => {
    const options = {
      resume: jest.fn()
    }

    createTabManager(options)
    const manager2 = createTabManager()
    manager2.send(MessageAction.RESUME)

    await waitFor(() => options.resume.mock.calls.length === 1)
    expect(options.resume).toHaveBeenCalledTimes(1)
  })

  it('Should emit the message event', async () => {
    const options = {
      onMessage: jest.fn()
    }

    const data = 'foo'

    createTabManager(options)
    const manager2 = createTabManager()
    manager2.message(data)

    await waitFor(() => options.onMessage.mock.calls.length === 1)
    expect(options.onMessage).toHaveBeenCalledTimes(1)
    expect(options.onMessage).toHaveBeenCalledWith(data)
  })
})
