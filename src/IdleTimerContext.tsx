import React, { PropsWithChildren, createContext, useContext } from 'react'
import { IIdleTimer, IIdleTimerProps, useIdleTimer } from '.'

/**
 * IdleTimer Context.
 */
export const IdleTimerContext = createContext<IIdleTimer>(null)

/**
 * Context interface Type.
 */
export type IIdleTimerContext = typeof IdleTimerContext

/**
 * Provider for adding IdleTimer to Children.
 *
 * @param props  IdleTimer configuration
 * @returns Component wrapped with IdleTimer
 */
export function IdleTimerProvider (props?: PropsWithChildren<IIdleTimerProps>) {
  const idleTimer = useIdleTimer(props)
  return (
    <IdleTimerContext.Provider value={idleTimer}>
      {props.children}
    </IdleTimerContext.Provider>
  )
}

/**
 * Context consumer for using IdleTimer API within jsx.
 *
 * @returns IdleTimer context consumer
 */
export const IdleTimerConsumer = IdleTimerContext.Consumer

/**
 * Context getter for IdleTimer Provider.
 *
 * @returns IdleTimer API
 */
export function useIdleTimerContext (): IIdleTimer {
  return useContext(IdleTimerContext)
}
