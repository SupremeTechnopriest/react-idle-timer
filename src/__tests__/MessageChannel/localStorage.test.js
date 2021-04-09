/* eslint-env jest */
import LocalStorageMethod, { 
  storageKey,
  getLocalStorage,
  addStorageEventListener, 
  removeStorageEventListener 
} from '../../MessageChannel/methods/localStorage'

import { randomToken, waitUntil } from '../../utils'

describe('LocalStorageMethod', () => {
  describe('.getLocalStorage()', () => {
    it('should always get a object', () => {
      const ls = getLocalStorage()
      expect(ls).toBeDefined()
      expect(typeof ls.setItem).toBe('function')
    })
  })

  describe('.postMessage()', () => {
    it('Should set the message', async () => {
      const channelState = {
        channelName: randomToken(),
        uuid: randomToken()
      }

      const json = { foo: 'bar' }

      await LocalStorageMethod.postMessage(
        channelState,
        json
      )
      const ls = getLocalStorage()
      const key = storageKey(channelState.channelName)
      const value = JSON.parse(ls.getItem(key))
      expect(value.data.foo).toBe('bar')
    })

    it('Should fire an event', async () => {
      const channelState = {
        channelName: randomToken(),
        uuid: randomToken()
      }
      const json = { foo: 'bar' }

      const emitted = []
      const listener = addStorageEventListener(
        channelState.channelName,
        event => {
          emitted.push(event)
        }
      )

      LocalStorageMethod.postMessage(
        channelState,
        json
      )

      await waitUntil(() => emitted.length === 1)
      expect(emitted[0].data.foo).toBe('bar')

      removeStorageEventListener(listener)
    })
  })

  describe('.create()', () => {
    it('create an instance', async () => {
      const channelName = randomToken()
      const state = LocalStorageMethod.create(channelName)
      expect(state.uuid).toBeDefined()
      LocalStorageMethod.close(state)
    })
  })

  describe('.onMessage()', () => {
    it('should emit to the other channel', async () => {
      const channelName = randomToken()
      const channelState1 = LocalStorageMethod.create(channelName)
      const channelState2 = LocalStorageMethod.create(channelName)

      const emitted = []
      LocalStorageMethod.onMessage(
        channelState2,
        msg => {
          emitted.push(msg)
        },
        new Date().getTime()
      )

      const json = { foo: 'bar' }
      LocalStorageMethod.postMessage(channelState1, json)

      await waitUntil(() => emitted.length === 1)

      expect(emitted[0]).toEqual(json)

      LocalStorageMethod.close(channelState1)
      LocalStorageMethod.close(channelState2)
    })
  })
})