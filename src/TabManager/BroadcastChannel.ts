import * as workerTimers from 'worker-timers'

/**
 * Collection of channels
 */
const channels = {}

/**
 * Polyfill for BroadcastChannel.
 */
class Polyfill {
  /**
   * Name of the channel
   */
  public readonly name: string

  /**
   * Wether or not this channel is closed
   */
  public closed: boolean = false

  /**
   * Internal message channel.
   */
  private readonly mc: MessageChannel = new MessageChannel()

  constructor (name: string) {
    this.name = name
    channels[name] = channels[name] || []
    channels[name].push(this)

    // Initialize message channel
    this.mc.port1.start()
    this.mc.port2.start()

    // Add event listeners
    this.onStorage = this.onStorage.bind(this)
    window.addEventListener('storage', this.onStorage)
  }

  private onStorage (event: StorageEvent) {
    if (event.storageArea !== window.localStorage) return
    if (event.key.substring(0, this.name.length) !== this.name) return
    if (event.newValue === null) return
    const data = JSON.parse(event.newValue)
    this.mc.port2.postMessage(data)
  }

  public postMessage (message: any) {
    if (this.closed) throw new Error('InvalidStateError')
    const value = JSON.stringify(message)
    const key = `${this.name}:${String(Date.now())}${String(Math.random())}`

    // Broadcast to remote contexts via storage events
    window.localStorage.setItem(key, value)
    workerTimers.setTimeout(() => {
      window.localStorage.removeItem(key)
    }, 500)

    // Broadcast to current context via ports
    channels[this.name].forEach((bc: Polyfill) => {
      if (bc === this) return
      bc.mc.port2.postMessage(JSON.parse(value))
    })
  }

  public close () {
    if (this.closed) return
    this.closed = true
    this.mc.port1.close()
    this.mc.port2.close()

    window.removeEventListener('storage', this.onStorage)

    const index = channels[this.name].indexOf(this)
    channels[this.name].splice(index, 1)
  }

  get onmessage () {
    return this.mc.port1.onmessage
  }

  set onmessage (value: (event: MessageEvent<any>) => void) {
    this.mc.port1.onmessage = value
  }

  get onmessageerror () {
    return this.mc.port1.onmessageerror
  }

  set onmessageerror (value: (event: MessageEvent<any>) => void) {
    this.mc.port1.onmessageerror = value
  }

  public addEventListener (event: string, listener: (event: MessageEvent<any>) => void) {
    return this.mc.port1.addEventListener(event, listener)
  }

  public removeEventListener (event: string, listener: (event: MessageEvent<any>) => void) {
    return this.mc.port1.removeEventListener(event, listener)
  }

  /**
   * istanbul ignore next
   *
   * This block can be ignored from coverage.
   * The code is not used, its just here to complete
   * the BroadcastChannel interface and testing it throws
   * errors because of the node.js MessageChannel shim.
   */
  public dispatchEvent (event: Event): boolean {
    /* istanbul ignore next */
    return this.mc.port1.dispatchEvent(event)
  }
}

/**
 * istanbul ignore next
 *
 * This block can be ignored because we are not testing
 * the built in window BroadcastChannel, only this polyfill.
 */
export const BroadcastChannel = typeof window === 'undefined'
  ? null
  : typeof window.BroadcastChannel === 'function'
    ? window.BroadcastChannel
    : Polyfill
