/* eslint-env jest */
import { MessageChannel } from '../../MessageChannel'
import { randomToken, sleep, waitUntil } from '../../utils'

function runTest(options) {
  describe(`MessageChannel (${JSON.stringify(options)})`, () => {
    let channels = []
    function createMessageChannel (name, opts) {
      if (!name) name = randomToken()
      if (!opts) opts = options
      const channel = new MessageChannel(name, opts)
      channels.push(channel)
      return channel
    }

    afterEach(async () => {
      for (const channel of channels) {
        await channel.close()
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
        expect(async () => await channel.postMessage('foobar')).not.toThrow()
      })

      it('Should throw if channel is already closed', async () => {
        const channel = createMessageChannel()
        await channel.close()
        expect(() => channel.postMessage('foobar')).toThrow()
      })
    })

    describe('.close()', () => {
      it('Should have resolved all processed message promises when close() resolves', async () => {
        const channel = createMessageChannel()

        channel.postMessage({})
        channel.postMessage({})
        channel.postMessage({})

        await channel.close()
        expect(channel.closed).toBe(true)
        expect(channel._unSendMessagePromises.size).toBe(0)
      })
    })

    describe('.onmessage', () => {
      it('Should NOT receive the message on own', async () => {
        const channel = createMessageChannel()

        const emitted = []
        channel.onmessage = msg => emitted.push(msg)
        await channel.postMessage({ foo: 'bar' })

        await sleep(100)
        expect(emitted.length).toBe(0)
        channel.close()
      })

      it('Should receive the message on other channel', async () => {
        const name = randomToken()
        const channel = createMessageChannel(name)
        const otherChannel = createMessageChannel(name)

        const emitted = []
        otherChannel.onmessage = msg => emitted.push(msg)
        await channel.postMessage({ foo: 'bar' })

        await waitUntil(() => emitted.length === 1)
        expect(emitted[0].foo).toBe('bar')
      })

      it('Should work with strange channelName', async () => {
        const name = '  meow  / ' + randomToken()
        const channel = createMessageChannel(name)
        const otherChannel = createMessageChannel(name)

        const emitted = []
        otherChannel.onmessage = msg => emitted.push(msg)
        await channel.postMessage({ foo: 'bar' })

        await waitUntil(() => emitted.length === 1)
        expect(emitted[0].foo).toBe('bar')
      })

      it('Should have the same message-data', async () => {
        const name = randomToken()
        const channel1 = createMessageChannel(name)
        const channel2 = createMessageChannel(name)

        const emitted = []
        channel2.onmessage = msg => emitted.push(msg)

        const msgJson = { foo: 'bar' }
        await channel1.postMessage(msgJson)
        
        await waitUntil(() => emitted.length === 1)
        expect(emitted[0]).toEqual(msgJson)
      })

      it('Should work with big message-data', async () => {
        const name = randomToken()
        const channel1 = createMessageChannel(name)
        const channel2 = createMessageChannel(name)

        const emitted = []
        channel2.onmessage = msg => emitted.push(msg)

        const msgJson = {
          one: randomToken(),
          two: randomToken(),
          three: randomToken()
        }
        await channel1.postMessage(msgJson)

        await waitUntil(() => emitted.length === 1)
        expect(emitted[0]).toEqual(msgJson)
      })

      it('Should not loose the message if _prepare() takes a while', async () => {
        const name = randomToken()
        const slowerOptions = Object.assign({}, options)
        slowerOptions.prepareDelay = 300

        const channel1 = createMessageChannel(name)
        const channel2 = createMessageChannel(name, slowerOptions)

        const emitted = []
        channel2.onmessage = msg => emitted.push(msg)

        const msgJson = { foo: 'bar' }
        await channel1.postMessage(msgJson)

        await waitUntil(() => emitted.length === 1)
        expect(emitted[0]).toEqual(msgJson)
      })

      it('Should NOT emit all events if subscribed directly after postMessage', async () => {
        const name = randomToken()
        const channel1 = createMessageChannel(name)
        const channel2 = createMessageChannel(name)

        channel1.postMessage('foo1')
        channel1.postMessage('foo2')

        const emitted = []
        channel2.onmessage = msg => emitted.push(msg)

        channel1.postMessage('foo3')

        await waitUntil(() => emitted.length === 1)
        expect(emitted.length).toBe(1)
      })

      it('Should not emit messages, send before onmessage was set, when one tick was done', async () => {
        const name = randomToken()
        const channel1 = createMessageChannel(name)
        const channel2 = createMessageChannel(name)

        channel1.postMessage('foo1')
        channel1.postMessage('foo2')

        await sleep(50)

        const emitted = []
        channel2.onmessage = msg => emitted.push(msg)

        const msgJson = { foo: 'bar' }
        channel1.postMessage(msgJson)

        await waitUntil(() => emitted.length === 1)
        expect(emitted.length).toBe(1)
        expect(emitted[0]).toEqual(msgJson)
      })

      it('Should not confuse messages between different channels', async () => {
        const channel = createMessageChannel()
        const otherChannel = createMessageChannel()

        const emitted = []
        otherChannel.onmessage = msg => emitted.push(msg)
        await channel.postMessage({ foo: 'bar' })
        
        await sleep(100)
        expect(emitted.length).toBe(0)
      })

      it('Should not read messages created before the channel was created', async () => {
        await sleep(100)

        const name = randomToken()
        const channel = createMessageChannel(name)

        await channel.postMessage('foo1')
        await sleep(50)

        const otherChannel = createMessageChannel(name)
        const emittedOther = []
        otherChannel.onmessage = msg => emittedOther.push(msg)

        await channel.postMessage('foo2')
        await channel.postMessage('foo3')

        await waitUntil(() => emittedOther.length >= 2)
        await sleep(100)

        expect(emittedOther.length).toBe(2)
      })

      it('Should only run the last onmessage-callback', async () => {
        const name = randomToken()
        const channel = createMessageChannel(name)
        const channel2 = createMessageChannel(name)

        const emitted1 = []
        const emitted2 = []

        channel2.onmessage = msg => {
          emitted1.push(msg)
        }
        channel2.onmessage = msg => {
          emitted2.push(msg)
        }

        await channel.postMessage('foobar')

        await waitUntil(() => emitted2.length >= 1)
        await sleep(100)

        expect(emitted1.length).toBe(0)
        expect(emitted2.length).toBe(1)
      })
    })

    describe('.addEventListener()', () => {
      it('Should emit events to all subscribers', async () => {
        const name = randomToken()
        const channel = createMessageChannel(name)
        const otherChannel = createMessageChannel(name)

        const emitted1 = []
        const emitted2 = []

        otherChannel.addEventListener('message', msg => emitted1.push(msg))
        otherChannel.addEventListener('message', msg => emitted2.push(msg))

        const msg = { foo: 'bar' }
        await channel.postMessage(msg)

        await waitUntil(() => emitted1.length === 1)
        await waitUntil(() => emitted2.length === 1)

        expect(msg).toEqual(emitted1[0])
        expect(msg).toEqual(emitted2[0])
      })
    })

    describe('.removeEventListener()', () => {
      it('Should no longer emit the message', async () => {
        const name = randomToken()
        const channel = createMessageChannel(name)
        const otherChannel = createMessageChannel(name)

        const emitted = []
        const fn = msg => emitted.push(msg)
        otherChannel.addEventListener('message', fn)

        const msg = { foo: 'bar' }
        await channel.postMessage(msg)

        await waitUntil(() => emitted.length === 1)

        otherChannel.removeEventListener('message', fn)

        await channel.postMessage(msg)
        await sleep(100)

        expect(emitted.length).toBe(1)
      })
    })
    
    describe('.isClosed()', () => {
      it('Should return closed state', async () => {
        const channel = createMessageChannel()
        expect(channel.isClosed()).toBe(false)
        await channel.close()
        expect(channel.isClosed()).toBe(true)
      })
    })

    describe('.type', () => {
      it('Should get a type', () => {
        const channel = createMessageChannel()
        const type = channel.type
        expect(typeof type).toBe('string')
        expect(channel.type).toBe(options.type)
      })
    })

    describe('Emit integrity', () => {
      it('Should always emit in the correct order', async () => {
        const name = randomToken()
        const channel = createMessageChannel(name)
        const otherChannel = createMessageChannel(name)

        const emitted = []
        otherChannel.onmessage = msg => emitted.push(msg)

        const amount = 300
        let index = 0
        new Array(amount).fill(0).forEach(() => {
          channel.postMessage({
            index,
            long: randomToken()
          })
          index++
        })

        await waitUntil(() => emitted.length === amount)

        let checkIndex = 0
        emitted.forEach(msg => {
          expect(checkIndex).toEqual(msg.index)
          checkIndex++
        })

        channel.close()
        otherChannel.close()
      })
    })
  })
}

const useOptions = [
  { type: 'simulate' },
  { type: 'localStorage' },
  { type: 'broadcastChannel'}
]

useOptions.forEach(o => runTest(o))