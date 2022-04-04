import { BroadcastChannel } from './BroadcastChannel'
import { LeaderElector } from './LeaderElector'

interface ITabManagerOptions {
  channelName: string
  emitOnAllTabs: boolean
  fallbackInterval: number
  responseTime: number
  onIdle: (event?: Event) => void
  onActive: (event?: Event) => void
  onMessage: (data: any) => void
  start: (remote?: boolean) => void
  reset: (remote?: boolean) => void
  pause: (remote?: boolean) => void
  resume: (remote?: boolean) => void
}

export enum MessageAction {
  REGISTER,
  DEREGISTER,
  IDLE,
  ACTIVE,
  EMIT_IDLE,
  EMIT_ACTIVE,
  EMIT_MESSAGE,
  START,
  RESET,
  PAUSE,
  RESUME,
  MESSAGE
}

interface IMessage {
  action: MessageAction
  token: string
  data?: any
}

export class TabManager {
  private channel: BroadcastChannel
  private elector: LeaderElector
  private options: ITabManagerOptions

  public isLeader: boolean = false
  public allIdle: boolean = false

  private registry: Map<string, boolean> = new Map()

  constructor (options: ITabManagerOptions) {
    const { channelName, fallbackInterval, responseTime } = options
    this.options = options

    this.channel = new BroadcastChannel(channelName)
    this.elector = new LeaderElector(this.channel, { fallbackInterval, responseTime })

    this.elector.waitForLeadership().then(() => {
      this.isLeader = true
    })

    this.channel.addEventListener('message', (message: MessageEvent<IMessage>) => {
      const { action, token, data } = message.data
      switch (action) {
        case MessageAction.REGISTER:
          this.registry.set(token, false)
          break
        case MessageAction.DEREGISTER:
          this.registry.delete(token)
          break
        case MessageAction.IDLE:
          this.idle(token)
          break
        case MessageAction.ACTIVE:
          this.active(token)
          break
        case MessageAction.EMIT_IDLE:
          this.options.onIdle()
          break
        case MessageAction.EMIT_ACTIVE:
          this.options.onActive()
          break
        case MessageAction.EMIT_MESSAGE:
          this.options.onMessage(data)
          break
        case MessageAction.START:
          this.options.start(true)
          break
        case MessageAction.RESET:
          this.options.reset(true)
          break
        case MessageAction.PAUSE:
          this.options.pause(true)
          break
        case MessageAction.RESUME:
          this.options.resume(true)
          break
      }
    })

    this.send(MessageAction.REGISTER)
  }

  idle (token: string = this.elector.token) {
    this.registry.set(token, true)
    const isIdle = [...this.registry.values()].every(v => v)
    if (!this.allIdle && isIdle) {
      this.allIdle = true
      if (this.isLeader) {
        this.options.onIdle()
        if (this.options.emitOnAllTabs) this.send(MessageAction.EMIT_IDLE)
      } else {
        this.send(MessageAction.IDLE)
      }
    }
  }

  active (token: string = this.elector.token) {
    this.registry.set(token, false)
    const isActive = [...this.registry.values()].some(v => !v)
    if (this.allIdle && isActive) {
      this.allIdle = false
      if (this.isLeader) {
        this.options.onActive()
        if (this.options.emitOnAllTabs) this.send(MessageAction.EMIT_ACTIVE)
      } else {
        this.send(MessageAction.ACTIVE)
      }
    }
  }

  sync () {
    try {
      this.channel.postMessage({
        action: MessageAction.START,
        token: this.elector.token
      })
    } catch {}
  }

  message (data: any) {
    try {
      this.channel.postMessage({
        action: MessageAction.EMIT_MESSAGE,
        token: this.elector.token,
        data
      })
    } catch {}
  }

  send (action: MessageAction) {
    try {
      this.channel.postMessage({ action, token: this.elector.token })
    } catch {}
  }

  close () {
    this.send(MessageAction.DEREGISTER)
    this.elector.close()
    this.channel.close()
  }
}
