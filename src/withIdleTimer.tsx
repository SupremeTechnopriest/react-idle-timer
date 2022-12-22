import React, { ComponentType, forwardRef } from 'react'
import { IIdleTimer, IIdleTimerProps, useIdleTimer } from '.'

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
    const component = <Component {...(props as unknown as T)} {...idleTimer} />

    if (!options.onPrompt && Component.prototype.onPrompt) {
      options.onPrompt = Component.prototype.onPrompt.apply(component)
    }

    if (!options.onIdle && Component.prototype.onIdle) {
      options.onIdle = Component.prototype.onIdle.apply(component)
    }

    if (!options.onActive && Component.prototype.onActive) {
      options.onActive = Component.prototype.onActive.apply(component)
    }

    if (!options.onAction && Component.prototype.onAction) {
      options.onAction = Component.prototype.onAction.call(component)
    }

    // Timeout is needed to allow hook to finish setting up.
    const componentDidMount = Component.prototype.componentDidMount
    if (componentDidMount) {
      Component.prototype.componentDidMount = function () {
        setTimeout(() => {
          componentDidMount.call(component)
        })
      }
    }

    if (typeof ref === 'function') {
      ref(idleTimer)
    } else if (ref) {
      ref.current = idleTimer
    }

    return component
  })
}
