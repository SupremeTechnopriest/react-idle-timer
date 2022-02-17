import { BroadcastChannel } from '../src/TabManager/BroadcastChannel'
import { createToken } from '../src/utils/token'
import { waitFor, sleep } from './test.utils'

let channels = []

function createMessageChannel (name?: string) {
  if (!name) name = 'idle-timer'
  const channel = new BroadcastChannel(name)
  channels.push(channel)
  return channel
}

describe('BroadcastChannel', () => {
  afterEach(() => {
    for (const channel of channels) {
      channel.close()
    }
    channels = []
  })

  describe('.constructor()', () => {
    it('Should create a channel', async () => {
      const channel = createMessageChannel()
      expect(channel).toBeDefined()
    })
  })

  describe('.postMessage()', () => {
    it('Should post a message', async () => {
      const channel = createMessageChannel()
      expect(() => channel.postMessage('foobar')).not.toThrow()
    })

    it('Should throw if channel is already closed', async () => {
      const channel = createMessageChannel()
      channel.close()
      expect(() => channel.postMessage('foobar')).toThrow()
    })
  })

  describe('.close()', () => {
    it('Should throw when trying to send on closed channel', () => {
      const channel = createMessageChannel()

      expect(() => channel.postMessage({})).not.toThrow()
      expect(() => channel.postMessage({})).not.toThrow()
      expect(() => channel.postMessage({})).not.toThrow()

      channel.close()
      expect(() => channel.postMessage({})).toThrow()
    })
  })

  describe('.onmessage()', () => {
    it('Should NOT receive the message on own', async () => {
      const channel = createMessageChannel(createToken())

      const emitted = []
      channel.onmessage = ({ data }) => emitted.push(data)
      channel.postMessage({ foo: 'bar' })

      await sleep(100)
      expect(emitted).toHaveLength(0)
      channel.close()
    })

    it('Should receive the message on other channel', async () => {
      const channel = createMessageChannel()
      const otherChannel = createMessageChannel()

      const emitted = []
      otherChannel.onmessage = ({ data }) => emitted.push(data)
      channel.postMessage({ foo: 'bar' })

      await waitFor(() => emitted.length === 1)
      expect(emitted[0].foo).toBe('bar')
    })

    it('Should work with strange channelName', async () => {
      const name = '  meow  / ' + Math.random()
      const channel = createMessageChannel(name)
      const otherChannel = createMessageChannel(name)

      const emitted = []
      otherChannel.onmessage = ({ data }) => emitted.push(data)
      channel.postMessage({ foo: 'bar' })

      await waitFor(() => emitted.length === 1)
      expect(emitted[0].foo).toBe('bar')
    })

    it('Should have the same message data', async () => {
      const name = createToken()
      const channel1 = createMessageChannel(name)
      const channel2 = createMessageChannel(name)

      const emitted = []
      channel2.onmessage = ({ data }) => emitted.push(data)

      const msgJson = { foo: 'bar' }
      channel1.postMessage(msgJson)

      await waitFor(() => emitted.length === 1)
      expect(emitted[0]).toEqual(msgJson)
    })

    it('Should work with big message-data', async () => {
      const name = createToken()
      const channel1 = createMessageChannel(name)
      const channel2 = createMessageChannel(name)

      const emitted = []
      channel2.onmessage = ({ data }) => emitted.push(data)

      const msgJson = {
        one: createToken(),
        two: createToken(),
        three: createToken()
      }
      channel1.postMessage(msgJson)

      await waitFor(() => emitted.length === 1)
      expect(emitted[0]).toEqual(msgJson)
    })

    it('Should not emit all events if subscribed directly after postMessage', async () => {
      const name = createToken()
      const channel1 = createMessageChannel(name)
      const channel2 = createMessageChannel(name)

      channel1.postMessage('foo')
      channel1.postMessage('bar')

      await sleep(100)

      const emitted = []
      channel2.onmessage = ({ data }) => emitted.push(data)

      channel1.postMessage({ foo: 'baz' })
      await sleep(100)

      expect(emitted).toHaveLength(1)
    })

    it('Should not emit messages, send before onmessage was set, when one tick was done', async () => {
      const name = createToken()
      const channel1 = createMessageChannel(name)
      const channel2 = createMessageChannel(name)

      channel1.postMessage('foo1')
      channel1.postMessage('foo2')

      await sleep(50)

      const emitted = []
      channel2.onmessage = ({ data }) => emitted.push(data)

      const msgJson = { foo: 'bar' }
      channel1.postMessage(msgJson)

      await waitFor(() => emitted.length === 1)
      expect(emitted).toHaveLength(1)
      expect(emitted[0]).toEqual(msgJson)
    })

    it('Should not send messages between different channels', async () => {
      const channel = createMessageChannel('channel1')
      const otherChannel = createMessageChannel('otherChannel')

      const emitted = []
      otherChannel.onmessage = ({ data }) => emitted.push(data)
      channel.postMessage({ foo: 'bar' })

      await sleep(100)
      expect(emitted).toHaveLength(0)
    })

    it('Should not read messages created before the channel was created', async () => {
      await sleep(100)

      const name = createToken()
      const channel = createMessageChannel(name)

      channel.postMessage('foo1')
      await sleep(50)

      const otherChannel = createMessageChannel(name)
      const emittedOther = []
      otherChannel.onmessage = msg => emittedOther.push(msg)

      channel.postMessage('foo2')
      channel.postMessage('foo3')

      await waitFor(() => emittedOther.length >= 2)
      await sleep(100)

      expect(emittedOther).toHaveLength(2)
    })

    it('Should only run the last onmessage callback', async () => {
      const name = createToken()
      const channel = createMessageChannel(name)
      const channel2 = createMessageChannel(name)

      const emitted1 = []
      const emitted2 = []

      channel2.onmessage = ({ data }) => {
        emitted1.push(data)
      }
      channel2.onmessage = ({ data }) => {
        emitted2.push(data)
      }

      channel.postMessage('foobar')

      await waitFor(() => emitted2.length >= 1)
      await sleep(100)

      expect(emitted1).toHaveLength(0)
      expect(emitted2).toHaveLength(1)
    })

    it('Should get onmessage', () => {
      const name = createToken()
      const channel = createMessageChannel(name)
      const handler = jest.fn()
      channel.onmessage = handler

      expect(channel.onmessage).toBe(handler)
    })
  })

  describe('.onmessageerror()', () => {
    it('Should set/get onmessageerror', () => {
      const name = createToken()
      const channel = createMessageChannel(name)
      const handler = jest.fn()
      channel.onmessageerror = handler

      expect(channel.onmessageerror).toBe(handler)
    })
  })

  describe('.addEventListener()', () => {
    it('Should fire event to added event listeners', async () => {
      const name = createToken()
      const channel = createMessageChannel(name)
      const channel2 = createMessageChannel(name)

      const listener = jest.fn()
      channel2.addEventListener('message', listener)
      channel.postMessage({ foo: 'bar' })

      await sleep(100)
      expect(listener).toHaveBeenCalledTimes(1)
    })
  })

  describe('.removeEventListener()', () => {
    it('Should remove bound event listeners', async () => {
      const name = createToken()
      const channel = createMessageChannel(name)
      const channel2 = createMessageChannel(name)

      const listener = jest.fn()
      channel2.addEventListener('message', listener)
      channel.postMessage({ foo: 'bar' })

      await sleep(100)
      expect(listener).toHaveBeenCalledTimes(1)

      channel2.removeEventListener('message', listener)
      channel.postMessage({ bar: 'baz' })

      await sleep(100)
      expect(listener).toHaveBeenCalledTimes(1)
    })
  })

  describe('.onStorage', () => {
    it('Should emit on storage events', async () => {
      const name = createToken()
      const channel = createMessageChannel(name)
      const channel2 = createMessageChannel(name)

      const handler = jest.fn()
      channel.onmessage = handler
      channel2.onmessage = handler

      const event = new StorageEvent('storage', {
        storageArea: window.localStorage,
        newValue: '{ "foo": "bar" }',
        key: name
      })
      window.dispatchEvent(event)

      await sleep(100)

      expect(handler).toHaveBeenCalledTimes(2)
    })

    it('Should not emit when storageArea is not localStorage', async () => {
      const name = createToken()
      const channel = createMessageChannel(name)
      const channel2 = createMessageChannel(name)

      const handler = jest.fn()
      channel.onmessage = handler
      channel2.onmessage = handler

      const event = new StorageEvent('storage', {
        storageArea: null,
        newValue: '{ "foo": "bar" }',
        key: name
      })
      window.dispatchEvent(event)

      await sleep(100)

      expect(handler).toHaveBeenCalledTimes(0)
    })

    it('Should reject when newValue is null', async () => {
      const name = createToken()
      const channel = createMessageChannel(name)
      const channel2 = createMessageChannel(name)

      const handler = jest.fn()
      channel.onmessage = handler
      channel2.onmessage = handler

      const event = new StorageEvent('storage', {
        storageArea: window.localStorage,
        newValue: null,
        key: name
      })
      window.dispatchEvent(event)

      await sleep(100)

      expect(handler).toHaveBeenCalledTimes(0)
    })

    it('Should reject when key is not channel name', async () => {
      const name = createToken()
      const channel = createMessageChannel(name)
      const channel2 = createMessageChannel(name)

      const handler = jest.fn()
      channel.onmessage = handler
      channel2.onmessage = handler

      const event = new StorageEvent('storage', {
        storageArea: window.localStorage,
        newValue: '{ "foo": "bar" }',
        key: 'wrong-key'
      })
      window.dispatchEvent(event)

      await sleep(100)

      expect(handler).toHaveBeenCalledTimes(0)
    })
  })
})
