import React, { ComponentType } from 'react'
import { Subtract } from 'utility-types'

import { IIdleTimer, IIdleTimerProps, useIdleTimer } from '.'

/**
 * Higher Order Component (HOC) for adding IdleTimer.
 *
 * @param props  IdleTimer configuration.
 * @returns Component wrapped with IdleTimer.
 */
export function withIdleTimer<T extends IIdleTimer> (Component: ComponentType<T>) {
  return function IdleTimer (props?: Subtract<T, IIdleTimer> & IIdleTimerProps) {
    const options = { ...props }

    if (!options.onPrompt && Component.prototype.onPrompt) {
      options.onPrompt = () => {
        Component.prototype.onPrompt()
      }
    }

    if (!options.onIdle && Component.prototype.onIdle) {
      options.onIdle = () => {
        Component.prototype.onIdle()
      }
    }

    if (!options.onActive && Component.prototype.onActive) {
      options.onActive = (event?: Event) => {
        Component.prototype.onActive(event)
      }
    }

    if (!options.onAction && Component.prototype.onAction) {
      options.onAction = (event?: Event) => {
        Component.prototype.onAction(event)
      }
    }

    const idleTimer = useIdleTimer(options)
    return <Component {...(props as unknown as T)} {...idleTimer} />
  }
}
