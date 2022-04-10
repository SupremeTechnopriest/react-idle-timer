import { BroadcastChannel } from './BroadcastChannel'
import { createToken } from '../utils/token'

interface ITabManagerOptions {
  channelName: string
  onPrompt: (event?: Event) => void
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
  PROMPT,
  START,
  RESET,
  PAUSE,
  RESUME,
  MESSAGE
}

enum RegistryState {
  PROMPTED,
  ACTIVE,
  IDLE
}

interface IMessage {
  action: MessageAction
  token: string
  data?: any
}

export class TabManager {
  private channel: BroadcastChannel
  private options: ITabManagerOptions

  private token: string = createToken()

  public allIdle: boolean = false

  private registry: Map<string, RegistryState> = new Map()

  constructor (options: ITabManagerOptions) {
    const { channelName } = options
    this.options = options

    this.channel = new BroadcastChannel(channelName)

    this.registry.set(this.token, RegistryState.ACTIVE)

    this.channel.addEventListener('message', (message: MessageEvent<IMessage>) => {
      const { action, token, data } = message.data

      switch (action) {
        case MessageAction.REGISTER:
          this.registry.set(token, RegistryState.ACTIVE)
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
        case MessageAction.PROMPT:
          this.prompt(token)
          break
        case MessageAction.MESSAGE:
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

  prompt (token: string = this.token) {
    this.registry.set(token, RegistryState.PROMPTED)
    const isPrompted = [...this.registry.values()].every(v => v === RegistryState.PROMPTED)

    if (token === this.token) {
      this.send(MessageAction.PROMPT)
    }

    if (isPrompted) {
      this.options.onPrompt()
    }
  }

  idle (token: string = this.token) {
    this.registry.set(token, RegistryState.IDLE)
    const isIdle = [...this.registry.values()].every(v => v === RegistryState.IDLE)

    if (token === this.token) {
      this.send(MessageAction.IDLE)
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
      this.send(MessageAction.ACTIVE)
    }

    if (this.allIdle && isActive) {
      this.allIdle = false
      this.options.onActive()
    }
  }

  sync () {
    try {
      this.channel.postMessage({
        action: MessageAction.RESET,
        token: this.token
      })
    } catch {}
  }

  message (data: any) {
    try {
      this.channel.postMessage({
        action: MessageAction.MESSAGE,
        token: this.token,
        data
      })
    } catch {}
  }

  send (action: MessageAction) {
    try {
      this.channel.postMessage({ action, token: this.token })
    } catch {}
  }

  close () {
    this.send(MessageAction.DEREGISTER)
    this.channel.close()
  }
}
