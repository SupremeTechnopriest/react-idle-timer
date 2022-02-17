import { fireEvent } from '@testing-library/react'
import { MessageAction } from '../src/TabManager'
import { BroadcastChannel } from '../src/TabManager/BroadcastChannel'
import { LeaderElector } from '../src/TabManager/LeaderElector'
import { createToken } from '../src/utils/token'
import { waitFor, sleep } from './test.utils'

const t3s = { timeout: 3000 }

describe('LeaderElector', () => {
  let channels = []
  function createMessageChannel (name?: string) {
    if (!name) name = createToken()
    const channel = new BroadcastChannel(name)
    channels.push(channel)
    return channel
  }

  const leaderOptions = {
    fallbackInterval: 200,
    responseTime: 100
  }

  afterEach(async () => {
    for (const channel of channels) {
      await channel.close()
    }
    channels = []
  })

  describe('.constructor()', () => {
    it('Should create an elector', () => {
      const channel = createMessageChannel()
      const elector = new LeaderElector(channel, leaderOptions)
      expect(elector).toBeDefined()
    })
  })

  describe('unload', () => {
    it('Should fire deregister on unload', async () => {
      let done = false
      const channelName = createToken()
      const channel = createMessageChannel(channelName)
      const channel2 = createMessageChannel(channelName)

      const elector = new LeaderElector(channel, leaderOptions)
      channel2.addEventListener('message', ({ data }) => {
        if (data.action === MessageAction.DEREGISTER) done = true
      })

      await elector.waitForLeadership()
      await waitFor(() => elector.isLeader === true)

      fireEvent(document, new Event('beforeunload'))
      fireEvent(document, new Event('unload'))

      await waitFor(() => done === true)
      expect(done).toBe(true)
    })
  })

  describe('election', () => {
    it('Should elect single elector as leader', async () => {
      const channel = createMessageChannel()
      const elector = new LeaderElector(channel, leaderOptions)

      await elector.waitForLeadership()
      expect(elector.isLeader).toBe(true)
    })

    it('From two electors only one should become leader', async () => {
      const channelName = createToken()
      const channel = createMessageChannel(channelName)
      const channel2 = createMessageChannel(channelName)
      const elector = new LeaderElector(channel, leaderOptions)
      const elector2 = new LeaderElector(channel2, leaderOptions)

      await elector.waitForLeadership()
      elector2.waitForLeadership()

      await sleep(200)
      expect(elector.isLeader).not.toBe(elector2.isLeader)
    })

    it('From many electors only one should become leader', async () => {
      const channelName = createToken()
      const clients = new Array(20).fill(0).map(() => {
        const channel = createMessageChannel(channelName)
        const elector = new LeaderElector(channel, leaderOptions)
        return {
          channel,
          elector
        }
      })

      clients.forEach(c => c.elector.waitForLeadership())
      await waitFor(() => Boolean(clients.find(c => c.elector.isLeader)), t3s)

      const leaderCount = clients.filter(c => c.elector.isLeader).length
      expect(leaderCount).toBe(1)
    })
  })

  describe('.close()', () => {
    it('If leader dies another should be able to become leader', async () => {
      const channelName = createToken()
      const channel = createMessageChannel(channelName)
      const channel2 = createMessageChannel(channelName)
      const elector = new LeaderElector(channel, leaderOptions)
      const elector2 = new LeaderElector(channel2, leaderOptions)

      await elector.waitForLeadership()
      elector2.waitForLeadership()

      elector.close()
      await waitFor(() => elector2.isLeader)

      expect(elector2.isLeader).toBe(true)
    })
  })

  describe('.waitForLeadership()', () => {
    it('Should not apply if dead', async () => {
      const channelName = createToken()
      const channel = createMessageChannel(channelName)
      const elector = new LeaderElector(channel, leaderOptions)
      elector.close()
      // @ts-ignore
      const applied = await elector.apply()
      expect(applied).toBe(false)
    })

    it('Should not apply if already leader', async () => {
      const channelName = createToken()
      const channel = createMessageChannel(channelName)
      const elector = new LeaderElector(channel, leaderOptions)
      await elector.waitForLeadership()
      // @ts-ignore
      const applied = await elector.apply()
      expect(applied).toBe(false)
    })

    it('Should abort apply when another instance is leader', async () => {
      const channelName = createToken()
      const channel = createMessageChannel(channelName)
      const channel2 = createMessageChannel(channelName)
      const elector = new LeaderElector(channel, leaderOptions)
      const elector2 = new LeaderElector(channel2, leaderOptions)

      await elector.waitForLeadership()

      // @ts-ignore
      elector2.apply()
      await sleep(200)

      expect(elector2.isLeader).toBe(false)
    })

    it('Should resolve when elector becomes leader', async () => {
      const channel = createMessageChannel()
      const elector = new LeaderElector(channel, leaderOptions)
      await elector.waitForLeadership()
      expect(elector.isLeader).toBe(true)
    })

    it('Should resolve when other leader dies', async () => {
      const channelName = createToken()
      const channel = createMessageChannel(channelName)
      const channel2 = createMessageChannel(channelName)
      const elector = new LeaderElector(channel, leaderOptions)
      const elector2 = new LeaderElector(channel2, leaderOptions)

      await elector.waitForLeadership()
      elector2.waitForLeadership()

      elector.close()

      await waitFor(() => elector2.isLeader)
      expect(elector2.isLeader).toBe(true)
    })

    it('Should resolve when other leader no longers responds', async () => {
      const channelName = createToken()
      const channel = createMessageChannel(channelName)
      const channel2 = createMessageChannel(channelName)
      const elector = new LeaderElector(channel, leaderOptions)
      const elector2 = new LeaderElector(channel2, leaderOptions)

      await elector.waitForLeadership()
      elector2.waitForLeadership()

      // Overwrite postInternal to simulate non-responding leader
      channel.postMessage = () => {}

      await waitFor(() => elector2.isLeader, t3s)
      expect(elector2.isLeader).toBe(true)
    })

    it('Should resolve when leader process exits', async () => {
      const channelName = createToken()
      const channel = createMessageChannel(channelName)
      const channel2 = createMessageChannel(channelName)
      const elector = new LeaderElector(channel, leaderOptions)
      const elector2 = new LeaderElector(channel2, leaderOptions)

      await elector.waitForLeadership()
      elector2.waitForLeadership()

      elector.close()

      await waitFor(() => elector2.isLeader)
      expect(elector2.isLeader).toBe(true)
    })

    it('Should return existing promise if called twice', async () => {
      const channelName = createToken()
      const channel = createMessageChannel(channelName)
      const elector = new LeaderElector(channel, leaderOptions)

      await elector.waitForLeadership()
      await elector.waitForLeadership()

      expect(async () => await elector.waitForLeadership()).not.toThrow()
    })

    it('Should resolve immediately if already leader', async () => {
      const channelName = createToken()
      const channel = createMessageChannel(channelName)
      const elector = new LeaderElector(channel, leaderOptions)

      elector.isLeader = true
      expect(async () => await elector.waitForLeadership()).not.toThrow()
    })
  })
})
