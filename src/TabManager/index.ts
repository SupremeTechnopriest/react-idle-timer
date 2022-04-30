import { BroadcastChannel } from './BroadcastChannel'
import { LeaderElector } from './LeaderElector'
import { createToken } from '../utils/token'
import { MessageActionType } from '../types/MessageActionType'

interface ITabManagerOptions {
  channelName: string
  leaderElection: boolean
  onPrompt: (event?: Event) => void
  onIdle: (event?: Event) => void
  onActive: (event?: Event) => void
  onMessage: (data: any) => void
  start: (remote?: boolean) => void
  reset: (remote?: boolean) => void
  pause: (remote?: boolean) => void
  resume: (remote?: boolean) => void
}

enum RegistryState {
  PROMPTED,
  ACTIVE,
  IDLE
}

interface IMessage {
  action: MessageActionType
  token: string
  data?: any
}

export class TabManager {
  private channel: BroadcastChannel
  private options: ITabManagerOptions
  private elector: LeaderElector

  private token: string = createToken()
  public registry: Map<string, RegistryState> = new Map()
  public allIdle: boolean = false

  constructor (options: ITabManagerOptions) {
    const { channelName } = options
    this.options = options

    this.channel = new BroadcastChannel(channelName)

    this.registry.set(this.token, RegistryState.ACTIVE)

    if (options.leaderElection) {
      const electorOptions = {
        fallbackInterval: 2000,
        responseTime: 100
      }
      this.elector = new LeaderElector(this.channel, electorOptions)
      this.elector.waitForLeadership()
    }

    this.channel.addEventListener('message', (message: MessageEvent<IMessage>) => {
      const { action, token, data } = message.data

      switch (action) {
        case MessageActionType.REGISTER:
          this.registry.set(token, RegistryState.ACTIVE)
          break
        case MessageActionType.DEREGISTER:
          this.registry.delete(token)
          break
        case MessageActionType.IDLE:
          this.idle(token)
          break
        case MessageActionType.ACTIVE:
          this.active(token)
          break
        case MessageActionType.PROMPT:
          this.prompt(token)
          break
        case MessageActionType.MESSAGE:
          this.options.onMessage(data)
          break
        case MessageActionType.START:
          this.options.start(true)
          break
        case MessageActionType.RESET:
          this.options.reset(true)
          break
        case MessageActionType.PAUSE:
          this.options.pause(true)
          break
        case MessageActionType.RESUME:
          this.options.resume(true)
          break
      }
    })

    this.send(MessageActionType.REGISTER)
  }

  get isLeader () {
    if (!this.elector) throw new Error('❌ Leader election is not enabled. To Enable it set the "leaderElection" property to true.')
    return this.elector.isLeader
  }

  prompt (token: string = this.token) {
    this.registry.set(token, RegistryState.PROMPTED)
    const isPrompted = [...this.registry.values()].every(v => v === RegistryState.PROMPTED)

    if (token === this.token) {
      this.send(MessageActionType.PROMPT)
    }

    if (isPrompted) {
      this.options.onPrompt()
    }
  }

  idle (token: string = this.token) {
    this.registry.set(token, RegistryState.IDLE)
    const isIdle = [...this.registry.values()].every(v => v === RegistryState.IDLE)

    if (token === this.token) {
      this.send(MessageActionType.IDLE)
    }

    if (!this.allIdle && isIdle) {
      this.allIdle = true
      this.options.onIdle()
    }
  }

  active (token: string = this.token) {
    this.registry.set(token, RegistryState.ACTIVE)
    const isActive = [...this.registry.values()].some(v => v === RegistryState.ACTIVE)

    if (token === this.token) {
      this.send(MessageActionType.ACTIVE)
    }

    if (this.allIdle && isActive) {
      this.allIdle = false
      this.options.onActive()
    }
  }

  sync () {
    try {
      this.channel.postMessage({
        action: MessageActionType.RESET,
        token: this.token
      })
    } catch {}
  }

  message (data: any) {
    try {
      this.channel.postMessage({
        action: MessageActionType.MESSAGE,
        token: this.token,
        data
      })
    } catch {}
  }

  send (action: MessageActionType) {
    try {
      this.channel.postMessage({ action, token: this.token })
    } catch {}
  }

  close () {
    if (this.options.leaderElection) {
      this.elector.close()
    }
    this.send(MessageActionType.DEREGISTER)
    this.channel.close()
  }
}
