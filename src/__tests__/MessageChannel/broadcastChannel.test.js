/* eslint-env jest */
import BroadcastChannelMethod from '../../MessageChannel/methods/broadcastChannel'
import { randomToken, waitUntil } from '../../utils'

describe('BroadcastChannelMethod', () => {
  describe('.create()', () => {
    it('create an instance', async () => {
      const channelName = randomToken()
      const state = BroadcastChannelMethod.create(channelName)
      expect(state.bc).toBeDefined()
      BroadcastChannelMethod.close(state)
    })
  })

  describe('.onMessage()', () => {
    it('should emit to the other channel', async () => {
      const channelName = randomToken()
      const channelState1 = BroadcastChannelMethod.create(channelName)
      const channelState2 = BroadcastChannelMethod.create(channelName)

      const emitted = []
      BroadcastChannelMethod.onMessage(
        channelState2,
        msg => {
          emitted.push(msg)
        },
        new Date().getTime()
      )

      const json = { foo: 'bar' }
      BroadcastChannelMethod.postMessage(channelState1, json)

      await waitUntil(() => emitted.length === 1)

      expect(emitted[0]).toEqual(json)

      BroadcastChannelMethod.close(channelState1)
      BroadcastChannelMethod.close(channelState2)
    })
  })

  describe('.canBeUsed()', () => {
    expect(BroadcastChannelMethod.canBeUsed()).toBe(true)
  })

  describe('.averageResponseTime()', () => {
    expect(BroadcastChannelMethod.averageResponseTime()).toBe(150)
  })
})