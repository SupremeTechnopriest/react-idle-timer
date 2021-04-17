/* eslint-env jest */
import simulant from 'simulant'
import {
  MessageChannel,
  createLeaderElection,
  beLeader
} from '../../MessageChannel'

import { randomToken, sleep, waitUntil } from '../../utils'

function runTest (channelOptions, leaderOptions) {
  describe(`LeaderElection (${JSON.stringify(channelOptions)})`, () => {
    let channels = []
    function createMessageChannel(name, opts) {
      if (!name) name = randomToken()
      if (!opts) opts = channelOptions
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

    describe('.create()', () => {
      it('Should create an elector', () => {
        const channel = createMessageChannel()
        const elector = createLeaderElection(channel, leaderOptions)
        expect(elector).toBeDefined()
      })

      it('Should only allow one leader elector per message channel', () => {
        const channel = createMessageChannel()
        createLeaderElection(channel, leaderOptions)
        expect(() => createLeaderElection(channel, leaderOptions)).toThrow()
      })
    })

    describe('unload', () => {
      it('Should fire deregister on unload', async () => {
        let done = false
        const channelName = randomToken()
        const channel = createMessageChannel(channelName)
        const channel2 = createMessageChannel(channelName)
        
        const elector = createLeaderElection(channel, leaderOptions)
        elector.onBeforeDie = async () => {
          await channel.postMessage('deregister')
        }

        channel2.addEventListener('message', msg => {
          if (msg === 'deregister') done = true
        })

        await elector.applyOnce()
        await waitUntil(() => elector.isLeader === true)
    
        simulant.fire(window, 'beforeunload')
        simulant.fire(window, 'unload')

        await waitUntil(() => done === true)
        expect(done).toBe(true)
      })
    })

    describe('election', () => {
      it('Should elect single elector as leader', async () => {
        const channel = createMessageChannel()
        const elector = createLeaderElection(channel, leaderOptions)

        await elector.applyOnce()
        expect(elector.isLeader).toBe(true)
      })

      it('From two electors, only one should become leader', async () => {
        const channelName = randomToken()
        const channel = createMessageChannel(channelName)
        const channel2 = createMessageChannel(channelName)
        const elector = createLeaderElection(channel, leaderOptions)
        const elector2 = createLeaderElection(channel2, leaderOptions)

        await Promise.all([
          elector.applyOnce(),
          elector2.applyOnce()
        ])

        await waitUntil(() => elector.isLeader || elector2.isLeader)
        await sleep(200)

        expect(elector.isLeader).not.toBe(elector2.isLeader)
      })

      it('From many electors, only one should become leader', async () => {
        const channelName = randomToken()
        const clients = new Array(20).fill(0).map(() => {
          const channel = createMessageChannel(channelName)
          const elector = createLeaderElection(channel, leaderOptions)
          return {
            channel,
            elector
          }
        })

        await Promise.all(clients.map(c => c.elector.applyOnce()))
        await waitUntil(() => clients.find(c => c.elector.isLeader))
        await sleep(200)

        const leaderCount = clients.filter(c => c.elector.isLeader).length
        expect(leaderCount).toBe(1)
      })
    })

    describe('.die()', () => {
      it('If leader dies, other should be able to become leader', async () => {
        const channelName = randomToken()
        const channel = createMessageChannel(channelName)
        const channel2 = createMessageChannel(channelName)
        const elector = createLeaderElection(channel, leaderOptions)
        const elector2 = createLeaderElection(channel2, leaderOptions)

        await elector.applyOnce()

        await elector.die()
        await sleep(200)

        await elector2.applyOnce()
        expect(elector2.isLeader).toBe(true)
      })

      it('If channel is closed, leader should die', async () => {
        const channelName = randomToken()
        const channel = createMessageChannel(channelName)
        const channel2 = createMessageChannel(channelName)
        const elector = createLeaderElection(channel, leaderOptions)
        const elector2 = createLeaderElection(channel2, leaderOptions)

        await elector.applyOnce()
        await channel.close()
        expect(elector.isDead).toBe(true)
        await sleep(200)

        await elector2.applyOnce()
        expect(elector2.isLeader).toBe(true)
      })
    })

    describe('.awaitLeadership()', () => {
      it('Should resolve when elector becomes leader', async () => {
        const channel = createMessageChannel()
        const elector = createLeaderElection(channel, leaderOptions)

        expect(async () => await elector.awaitLeadership()).not.toThrow()
      })

      it('Should resolve when other leader dies', async () => {
        const channelName = randomToken()
        const channel = createMessageChannel(channelName)
        const channel2 = createMessageChannel(channelName)
        const elector = createLeaderElection(channel, leaderOptions)
        const elector2 = createLeaderElection(channel2, leaderOptions)

        await elector.awaitLeadership()

        let resolved = false
        elector2.awaitLeadership().then(() => resolved = true)

        elector.die()

        await waitUntil(() => resolved === true)
        expect(resolved).toBe(true)
      })

      it('Should resolve when other leader no longers responds', async () => {
        const channelName = randomToken()
        const channel = createMessageChannel(channelName)
        const channel2 = createMessageChannel(channelName)
        const elector = createLeaderElection(channel, leaderOptions)
        const elector2 = createLeaderElection(channel2, leaderOptions)

        await elector.awaitLeadership()

        let resolved = false
        elector2.awaitLeadership().then(() => resolved = true)

        // Overwrite postInternal to simulate non-responding leader
        channel.postInternal = () => Promise.resolve()

        await waitUntil(() => resolved === true)
        expect(resolved).toBe(true)
      })

      it('Should resolve when leader-process exits', async () => {
        await sleep(150)
        const channelName = randomToken()
        const channel = createMessageChannel(channelName)
        const channel2 = createMessageChannel(channelName)
        const elector = createLeaderElection(channel, leaderOptions)
        const elector2 = createLeaderElection(channel2, leaderOptions)

        await elector.awaitLeadership()

        let resolved = false
        elector2.awaitLeadership().then(() => resolved = true)

        await channel.close()
        
        await waitUntil(() => resolved === true)
        expect(resolved).toBe(true)
      })
    })

    describe('.onDuplicate', () => {
      it('Should fire when duplicate leaders', async () => {
        const channelName = randomToken()
        const channel = createMessageChannel(channelName)
        const channel2 = createMessageChannel(channelName)
        const elector = createLeaderElection(channel, leaderOptions)
        const elector2 = createLeaderElection(channel2, leaderOptions)

        const emitted = []
        elector.onDuplicate = () => {
          emitted.push(1)
        }
        elector2.onDuplicate = () => {
          emitted.push(2)
        }

        beLeader(elector)
        beLeader(elector2)

        await waitUntil(() => emitted.length === 2)

        expect(emitted.includes(1)).toBe(true)
        expect(emitted.includes(2)).toBe(true)
      })

      it('should NOT fire when no duplicated', async () => {
        const channelName = randomToken()
        const channel = createMessageChannel(channelName)
        const channel2 = createMessageChannel(channelName)
        const elector = createLeaderElection(channel, leaderOptions)
        const elector2 = createLeaderElection(channel2, leaderOptions)

        const emitted = []
        elector.onDuplicate = () => emitted.push(true)
        elector2.onDuplicate = () => emitted.push(true)

        await Promise.race([
          elector.awaitLeadership(),
          elector2.awaitLeadership()
        ])

        await sleep(150)
        expect(emitted.length).toBe(0)
      })
    })
  })
}

const leaderOptions = {
  fallbackInterval: 2000
}

const channelOptions = [
  { type: 'simulate' }, 
  // { type: 'localStorage' },
  // { type: 'broadcastChannel' }
]

channelOptions.forEach(o => runTest(o, leaderOptions))