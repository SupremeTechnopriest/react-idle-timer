import React, { ComponentType, forwardRef } from 'react'
import { IIdleTimer, IIdleTimerProps, useIdleTimer } from '.'

/**
 * Higher Order Component (HOC) for adding IdleTimer.
 *
 * @param props  IdleTimer configuration.
 * @returns Component wrapped with IdleTimer.
 */
export function withIdleTimer<T extends IIdleTimer> (Component: ComponentType<T>) {
  type WithIdleTimerProps = Omit<T, keyof IIdleTimer> & IIdleTimerProps
  return forwardRef<IIdleTimer, WithIdleTimerProps>(function IdleTimer (props, ref) {
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

    if (typeof ref === 'function') {
      ref(idleTimer)
    } else if (ref) {
      ref.current = idleTimer
    }

    return <Component {...(props as unknown as T)} {...idleTimer} />
  })
}
