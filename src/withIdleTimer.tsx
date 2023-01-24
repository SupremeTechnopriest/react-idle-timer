import type { ComponentType } from 'react'
import type { IIdleTimer, IIdleTimerProps } from '.'
import type { IEventHandler } from './types/IEventHandler'
import type { PresenceType } from './types/PresenceType'

import React, { Component, forwardRef } from 'react'
import { useIdleTimer } from '.'

/**
 * Higher Order Component (HOC) for adding IdleTimer.
 *
 * @param props IdleTimer configuration.
 * @returns Component wrapped with IdleTimer.
 */
export function withIdleTimer<T extends IIdleTimer> (Component: ComponentType<T>) {
  type WithIdleTimerProps = Omit<T, keyof IIdleTimer> & IIdleTimerProps
  return forwardRef<IIdleTimer, WithIdleTimerProps>(function IdleTimer (props, ref) {
    const options = { ...props }
    const idleTimer = useIdleTimer(options)

    if (typeof ref === 'function') {
      ref(idleTimer)
    } else if (ref) {
      ref.current = idleTimer
    }

    return <Component {...(props as unknown as T)} {...idleTimer} />
  })
}

interface IIdleTimerComponentProps extends IIdleTimerProps {
  setOnPresenceChange?: (fn: (presence: PresenceType) => void) => void
  setOnPrompt?: (fn: IEventHandler) => void
  setOnIdle?: (fn: IEventHandler) => void
  setOnActive?: (fn: IEventHandler) => void
  setOnAction?: (fn: IEventHandler) => void
  setOnMessage?: (fn: IEventHandler) => void
}

abstract class IIdleTimerComponent<P, S> extends Component<P, S> {
  /**
   * Function to call when the users presence state changes.
   */
  onPresenceChange? (presence: PresenceType): void
  /**
   * When promptTimeout is set, this function is called after the user becomes
   * idle. This is useful for displaying a confirm prompt. If the prompt timeout
   * is reached, onIdle is then called.
   */
  onPrompt? (): void
  /**
   * Function to call when user is idle.
   */
  onIdle? (): void
  /**
   * Function to call when user becomes active.
   */
  onActive? (event: Event): void
  /**
   * Function to call on user activity. Can be throttled or debounced using the
   * `throttle` and `debounce` props.
   */
  onAction? (event: Event): void
  /**
   * Function to call when message is has been emitted.
   */
  onMessage? (data: any): void
}

export class IdleTimerComponent<P, S> extends IIdleTimerComponent<P, S> {
  constructor (props: P & IIdleTimerComponentProps) {
    super(props)
    if (this.onPresenceChange) props.setOnPresenceChange(this.onPresenceChange.bind(this))
    if (this.onPrompt) props.setOnPrompt(this.onPrompt.bind(this))
    if (this.onIdle) props.setOnIdle(this.onIdle.bind(this))
    if (this.onActive) props.setOnActive(this.onActive.bind(this))
    if (this.onAction) props.setOnAction(this.onAction.bind(this))
    if (this.onMessage) props.setOnMessage(this.onMessage.bind(this))
  }
}
