import { useEffect, useRef, useCallback, useMemo } from 'react'

import { TabManager } from './TabManager'

import { DEFAULT_ELEMENT, DEFAULT_EVENTS } from './utils/defaults'
import { IS_BROWSER } from './utils/isBrowser'
import { useRefEffect } from './utils/useRefEffect'
import { debounceFn } from './utils/debounce'
import { throttleFn } from './utils/throttle'
import { setTimers, timers as timer } from './utils/timers'
import { now } from './utils/now'

import { EventType } from './types/EventType'
import { IEventHandler } from './types/IEventHandler'
import { IIdleTimer } from './types/IIdleTimer'
import { IIdleTimerProps } from './types/IIdleTimerProps'
import { EventsType } from './types/EventsType'
import { MessageType } from './types/MessageType'

/**
 * Creates an IdleTimer instance.
 *
 * @param props Configuration options
 * @returns IdleTimer
 */
export function useIdleTimer ({
  timeout = 1000 * 60 * 20,
  promptTimeout = 0,
  element = DEFAULT_ELEMENT,
  events = DEFAULT_EVENTS,
  timers = undefined,
  immediateEvents = [],
  onPrompt = () => {},
  onIdle = () => {},
  onActive = () => {},
  onAction = () => {},
  onMessage = () => {},
  debounce = 0,
  throttle = 0,
  eventsThrottle = 200,
  startOnMount = true,
  startManually = false,
  stopOnIdle = false,
  crossTab = false,
  name = 'idle-timer',
  syncTimers = 0,
  leaderElection = false
}: IIdleTimerProps = {}): IIdleTimer {
  // Time References
  const startTime = useRef<number>(now())
  const lastReset = useRef<number>(now())
  const lastIdle = useRef<number>(null)
  const lastActive = useRef<number>(null)
  const idleTime = useRef<number>(0)
  const totalIdleTime = useRef<number>(0)
  const promptTime = useRef<number>(0)
  const remaining = useRef<number>(0)

  // State References
  const idle = useRef<boolean>(false)
  const prompted = useRef<boolean>(false)
  const paused = useRef<boolean>(false)
  const firstLoad = useRef<boolean>(true)
  const eventsBound = useRef<boolean>(false)
  const tId = useRef<number>(null)

  // Tab manager
  const manager = useRef(null)

  // Prop references
  const timeoutRef = useRefEffect<number>(timeout)
  const promptTimeoutRef = useRefEffect<number>(promptTimeout)
  const stopOnIdleRef = useRefEffect<boolean>(stopOnIdle)

  // Events and element references
  const immediateEventsRef = useRef<EventsType[]>(immediateEvents)
  const elementRef = useRef<Node>(element)
  const eventsRef = useRef<EventsType[]>(
    [...new Set([...events, ...immediateEvents]).values()]
  )

  // On Prompt Emitter
  const emitOnPrompt = useRef<IEventHandler>(onPrompt)
  useEffect(() => {
    emitOnPrompt.current = onPrompt
  }, [onPrompt])

  // On Idle Emitter
  const emitOnIdle = useRef<IEventHandler>(onIdle)
  useEffect(() => {
    emitOnIdle.current = onIdle
  }, [onIdle])

  // On Active Emitter
  const emitOnActive = useRef<IEventHandler>(onActive)
  useEffect(() => {
    emitOnActive.current = onActive
  }, [onActive])

  // On Action Emitter
  const emitOnAction = useRef<IEventHandler>(onAction)
  useEffect(() => {
    emitOnAction.current = onAction
  }, [onAction])

  // On Message Emitter
  const emitOnMessage = useRef<(data: string | number | object) => void>(onMessage)
  useEffect(() => {
    emitOnMessage.current = onMessage
  }, [onMessage])

  const callOnAction = useMemo<IEventHandler>(() => {
    const call: IEventHandler = (event: EventType) => emitOnAction.current(event)

    // Create debounced action if applicable
    if (debounce > 0) {
      return debounceFn(call, debounce)

      // Create throttled action if applicable
    } else if (throttle > 0) {
      return throttleFn(call, throttle)

      // No throttle or debounce
    } else {
      return call
    }
  }, [throttle, debounce])

  // Sync timers event
  const sendSyncEvent = useRef<() => void>()
  useEffect(() => {
    if (crossTab && syncTimers) {
      sendSyncEvent.current = throttleFn(() => {
        manager.current.active()
      }, syncTimers)
    }
  }, [crossTab, syncTimers])

  /**
   * Destroy the current running timeout.
   */
  const destroyTimeout = (): void => {
    if (tId.current !== null) {
      timer.clearTimeout(tId.current)
      tId.current = null
    }
  }

  /**
   * Create a timeout.
   *
   * @param time Time remaining in timeout
   */
  const createTimeout = (time?: number, setLastActive: boolean = true): void => {
    destroyTimeout()
    tId.current = timer.setTimeout(toggleIdleState, time || timeoutRef.current)
    if (setLastActive) lastActive.current = now()
  }

  /**
   * Create a prompt timeout.
   * @private
   */
  const togglePrompted = (event?: EventType): void => {
    if (!prompted.current && !idle.current) {
      emitOnPrompt.current(event)
    }
    remaining.current = 0
    promptTime.current = now()
    prompted.current = true
    createTimeout(promptTimeoutRef.current, false)
  }

  /**
   * Toggles to Idle State
   * @private
   */
  const toggleIdle = () => {
    destroyTimeout()
    if (!idle.current) {
      emitOnIdle.current()
    }

    // Flip idle
    idle.current = true
    lastIdle.current = now()

    // Handle idle event
    if (stopOnIdleRef.current) {
      unbindEvents()
    } else if (prompted.current) {
      promptTime.current = 0
      prompted.current = false
    }
  }

  /**
   * Toggles to active state.
   * @param event Event
   * @private
   */
  const toggleActive = (event?: EventType) => {
    destroyTimeout()
    if (idle.current) {
      emitOnActive.current(event)
    }
    prompted.current = false
    promptTime.current = 0
    idle.current = false
    idleTime.current += now() - lastIdle.current
    totalIdleTime.current += now() - lastIdle.current
    bindEvents()
    createTimeout()
  }

  /**
   * Toggles the idle state and calls the correct action function.
   *
   * @private
   */
  const toggleIdleState = (event?: EventType): void => {
    const nextIdle = !idle.current

    // Handle idle
    if (nextIdle) {
      // Cancel onAction callbacks
      if (callOnAction.cancel) callOnAction.cancel()

      // Handle prompt
      if (promptTimeoutRef.current > 0 && !prompted.current) {
        if (manager.current) {
          manager.current.prompt()
        } else {
          togglePrompted(event)
        }
        return
      }

      // Handle idle
      if (manager.current) {
        manager.current.idle()
      } else {
        toggleIdle()
      }

      return
    }

    // Handle Active
    if (manager.current) {
      manager.current.active()
    } else {
      toggleActive(event)
    }
  }

  /**
   * Event handler.
   *
   * @param event Dom Event
   * @private
   */
  const eventHandler = (event: EventType): void => {
    if (!startOnMount && !lastActive.current) {
      lastActive.current = now()
      emitOnActive.current()
    }

    // Fire onAction event
    callOnAction(event)

    // If the prompt is open, only emit onAction
    if (prompted.current) return

    // Clear any existing timeout
    destroyTimeout()

    // Handle events that immediately trigger idle
    if (
      !idle.current &&
      immediateEventsRef.current.includes(event.type as EventsType)
    ) {
      toggleIdleState(event)
      return
    }

    // Determine last time User was active, as can't rely on setTimeout ticking at the correct interval
    const elapsedTimeSinceLastActive = now() - lastActive.current

    // If the user is idle or last active time is more than timeout, flip the idle state
    if (
      (idle.current && !stopOnIdle) ||
      (!idle.current && elapsedTimeSinceLastActive >= timeoutRef.current)
    ) {
      toggleIdleState(event)
      return
    }

    // Disable paused
    paused.current = false

    // Reset remaining
    remaining.current = 0

    // Reset promptTime
    promptTime.current = 0

    // If the user is active, set a new timeout
    createTimeout()

    // Send sync event
    if (crossTab && syncTimers) sendSyncEvent.current()
  }

  /**
   * Wrapped event handler function.
   * This ref function gets passed to the event listeners.
   *
   * @private
   */
  const handleEvent = useRef<IEventHandler>(eventHandler)
  useEffect(() => {
    const eventsWereBound = eventsBound.current
    if (eventsWereBound) unbindEvents()
    if (eventsThrottle > 0) {
      handleEvent.current = throttleFn(eventHandler, eventsThrottle)
    } else {
      handleEvent.current = eventHandler
    }
    if (eventsWereBound) bindEvents()
  }, [eventsThrottle, throttle, debounce, emitOnAction, crossTab, syncTimers])

  /**
  * Binds the specified events.
  *
  * @private
  */
  const bindEvents = (): void => {
    // Don't bind events if
    // we are not in a browser
    if (!IS_BROWSER) return
    // Otherwise we bind all the events
    // to the supplied element
    if (!eventsBound.current) {
      eventsRef.current.forEach(e => {
        elementRef.current.addEventListener(e, handleEvent.current, {
          capture: true,
          passive: true
        })
      })
      eventsBound.current = true
    }
  }

  /**
   * Unbinds all the bound events.
   *
   * @private
   */
  const unbindEvents = (force: boolean = false): void => {
    // If we are not in a browser
    // we don't need to unbind events
    if (!IS_BROWSER) return
    // Unbind all events
    if (eventsBound.current || force) {
      eventsRef.current.forEach(e => {
        elementRef.current.removeEventListener(e, handleEvent.current, {
          capture: true
        })
      })
      eventsBound.current = false
    }
  }

  /**
   * Set initial state and start timer.
   */
  const start = useCallback<(remote?: boolean) => void>((remote?: boolean): void => {
    // Clear timeout
    destroyTimeout()

    // console.log('here')

    // Bind the events
    bindEvents()

    // Set state
    idle.current = false
    prompted.current = false
    paused.current = false
    remaining.current = 0
    promptTime.current = 0

    if (manager.current && !remote) {
      manager.current.start()
    }

    // Set new timeout
    createTimeout()
  }, [tId, idle, timeoutRef, manager])

  /**
  * Restore initial state and restart timer, calling onActive
  */
  const reset = useCallback<(remote?: boolean) => void>((remote?: boolean): void => {
    // Clear timeout
    destroyTimeout()

    // Bind the events
    bindEvents()

    // Reset state
    lastReset.current = now()
    idleTime.current += now() - lastIdle.current
    totalIdleTime.current += now() - lastIdle.current
    idleTime.current = 0
    idle.current = false
    prompted.current = false
    paused.current = false
    remaining.current = 0
    promptTime.current = 0

    if (manager.current && !remote) {
      manager.current.reset()
    }

    // Set new timeout
    if (!startManually) {
      createTimeout()
    }
  }, [tId, idle, timeoutRef, startManually, manager])

  /**
   * Manually trigger an activation event.
   */
  const activate = useCallback<(remote?: boolean) => void>((remote?: boolean): void => {
    // Clear timeout
    destroyTimeout()

    // Bind the events
    bindEvents()

    // Emit active
    if (idle.current || prompted.current) {
      toggleActive()
    }

    // Reset state
    idle.current = false
    prompted.current = false
    paused.current = false
    remaining.current = 0
    promptTime.current = 0
    lastReset.current = now()

    if (manager.current && !remote) {
      manager.current.activate()
    }

    // Set new timeout
    createTimeout()
  }, [tId, idle, prompted, timeoutRef, manager])

  /**
   * Pause a running timer.
   *
   */
  const pause = useCallback<(remote?: boolean) => boolean>((remote: boolean = false): boolean => {
    // Timer is already paused
    if (paused.current) return false

    // Set remaining
    remaining.current = getRemainingTime()

    // Set Paused
    paused.current = true

    // Unbind events
    unbindEvents()

    // Clear existing timeout
    destroyTimeout()

    if (manager.current && !remote) {
      manager.current.pause()
    }

    return true
  }, [tId, manager])

  /**
   * Resumes a paused timer.
   */
  const resume = useCallback<(remote?: boolean) => boolean>((remote: boolean = false): boolean => {
    // Timer is not paused
    if (!paused.current) return false
    paused.current = false

    // Bind events
    if (!prompted.current) {
      bindEvents()
    }

    // Create a new timer if not idle
    if (!idle.current) {
      createTimeout(remaining.current)
    }

    // If prompt time is set, reset to now
    if (promptTime.current) {
      promptTime.current = now()
    }

    // Replicate to manager
    if (manager.current && !remote) {
      manager.current.resume()
    }

    return true
  }, [tId, timeoutRef, remaining, manager])

  /**
   * Sends a message to all tabs.
   */
  const message = useCallback<(data: MessageType, emitOnSelf?: boolean) => void>((data: MessageType, emitOnSelf?: boolean): void => {
    if (manager.current) {
      if (emitOnSelf) emitOnMessage.current(data)
      manager.current.message(data)
    } else if (emitOnSelf) {
      emitOnMessage.current(data)
    }
  }, [onMessage])

  /**
   * Returns whether or not the user is idle.
   *
   * @return Idle state
   */
  const isIdle = useCallback<() => boolean>((): boolean => {
    return idle.current
  }, [idle])

  /**
   * Return whether or not the prompt is active.
   *
   * @returns Prompt state
   */
  const isPrompted = useCallback<() => boolean>((): boolean => {
    return prompted.current
  }, [prompted])

  /**
   * Returns whether or not this is the leader tab.
   */
  const isLeader = useCallback<() => boolean>((): boolean => {
    if (!manager.current) {
      throw new Error('❌ Cross Tab feature is not enabled. To enable it set the "crossTab" property to true.')
    }
    return manager.current.isLeader
  }, [manager])

  /**
   * Returns whether or not this is the last active tab.
   */
  const isLastActiveTab = useCallback<() => boolean>((): boolean => {
    if (!manager.current) {
      throw new Error('❌ Cross Tab feature is not enabled. To enable it set the "crossTab" property to true.')
    }
    return manager.current.isLastActive
  }, [manager])

  /**
   * Returns the current tabs id
   */
  const getTabId = useCallback<() => string>((): string => {
    if (!manager.current) {
      throw new Error('❌ Cross Tab feature is not enabled. To enable it set the "crossTab" property to true.')
    }
    return manager.current.token
  }, [manager])

  /**
   * Time remaining before idle
   *
   * @return Milliseconds remaining
   */
  const getRemainingTime = useCallback<() => number>((): number => {
    // If paused, return the current remaining time
    if (paused.current) return remaining.current

    // Get how long the timer was set for
    const timeoutTotal = remaining.current
      ? remaining.current
      : promptTimeoutRef.current + timeoutRef.current

    // Time since last active
    const timeSinceLastActive = lastActive.current
      ? now() - lastActive.current
      : 0

    const timeLeft = Math.floor(timeoutTotal - timeSinceLastActive)
    return timeLeft < 0 ? 0 : Math.abs(timeLeft)
  }, [timeoutRef, promptTimeoutRef, prompted, remaining, lastActive])

  /**
   * Get how much time has elapsed in milliseconds.
   *
   * @return Milliseconds elapsed
   */
  const getElapsedTime = useCallback<() => number>((): number => {
    return Math.round(now() - lastReset.current)
  }, [lastReset])

  /**
   * Get the total time that has elapsed in milliseconds
   * since the hook was mounted.
   *
   * @return Milliseconds elapsed
   */
  const getTotalElapsedTime = useCallback<() => number>((): number => {
    return Math.round(now() - startTime.current)
  }, [startTime])

  /**
   * Last time the user was idle.
   *
   * @return Timestamp
   */
  const getLastIdleTime = useCallback<() => Date | null>((): Date | null => {
    if (!lastIdle.current) return null
    return new Date(lastIdle.current)
  }, [lastIdle])

  /**
   * Last time the user was active.
   *
   * @return Timestamp
   */
  const getLastActiveTime = useCallback<() => Date | null>((): Date | null => {
    if (!lastActive.current) return null
    return new Date(lastActive.current)
  }, [lastActive])

  /**
   * Get the total time user is idle in milliseconds since the last reset.
   *
   * @return Milliseconds idle.
   */
  const getIdleTime = useCallback<() => number>((): number => {
    if (idle.current) {
      return Math.round((now() - lastIdle.current) + idleTime.current)
    }
    return Math.round(idleTime.current)
  }, [lastIdle, idleTime])

  /**
   * Get the total time user is idle in milliseconds since the hook mounted.
   *
   * @return Milliseconds idle.
   */
  const getTotalIdleTime = useCallback<() => number>((): number => {
    if (idle.current) {
      return Math.round((now() - lastIdle.current) + totalIdleTime.current)
    }
    return Math.round(totalIdleTime.current)
  }, [lastIdle, totalIdleTime])

  /**
   * Get the total time user is active in milliseconds since the last reset.
   *
   * @return Milliseconds active
   */
  const getActiveTime = useCallback<() => number>((): number => {
    const total = Math.round(getElapsedTime() - getIdleTime())
    return total >= 0 ? total : 0
  }, [lastIdle, idleTime])

  /**
   * Get the total time user is active in milliseconds since the hook mounted.
   *
   * @return Milliseconds active
   */
  const getTotalActiveTime = useCallback<() => number>((): number => {
    const total = Math.round(getTotalElapsedTime() - getTotalIdleTime())
    return total >= 0 ? total : 0
  }, [lastIdle, idleTime])

  // On Mount
  useEffect(() => {
    // Debounce and throttle can't both be set
    if (debounce > 0 && throttle > 0) {
      throw new Error('❌ onAction can either be throttled or debounced, not both.')
    }

    // Create mock timers if nativeTimers is set
    if (timers) setTimers(timers)

    // Add beforeunload listener
    const beforeunload = () => {
      if (manager.current) manager.current.close()
      if (callOnAction.cancel) callOnAction.cancel()
      destroyTimeout()
      unbindEvents(true)
    }

    if (IS_BROWSER) {
      window.addEventListener('beforeunload', beforeunload)
    }

    // Clear and unbind on unmount
    return () => {
      if (IS_BROWSER) window.removeEventListener('beforeunload', beforeunload)
      if (manager.current) manager.current.close()
      if (callOnAction.cancel) callOnAction.cancel()
      destroyTimeout()
      unbindEvents(true)
    }
  }, [])

  // Cross Tab Manager
  useEffect(() => {
    // Close any existing manager
    if (manager.current) {
      manager.current.close()
    }

    // Set up cross tab
    if (crossTab) {
      manager.current = new TabManager({
        channelName: name,
        leaderElection,
        onPrompt: () => {
          togglePrompted()
        },
        onIdle: () => {
          toggleIdle()
        },
        onActive: () => {
          toggleActive()
        },
        onMessage: emitOnMessage.current,
        start,
        reset,
        activate,
        pause,
        resume
      })
    } else {
      manager.current = null
    }
  }, [
    crossTab,
    name,
    leaderElection,
    emitOnPrompt,
    emitOnIdle,
    emitOnActive,
    emitOnMessage,
    start,
    reset,
    pause,
    resume
  ])

  // Dynamic Start
  useEffect(() => {
    if (!firstLoad.current) {
      destroyTimeout()
      unbindEvents(true)
    }
    if (startManually) return
    if (startOnMount) {
      start()
    } else {
      bindEvents()
    }
  }, [startManually, startOnMount, firstLoad])

  // Dynamic events and element
  useEffect(() => {
    if (!firstLoad.current) {
      const newEvents = [
        ...new Set([...events, ...immediateEvents]).values()
      ]
      unbindEvents()
      eventsRef.current = newEvents
      elementRef.current = element
      immediateEventsRef.current = immediateEvents
      if (startManually) return
      if (startOnMount) {
        start()
      } else {
        bindEvents()
      }
    }
  }, [
    element,
    JSON.stringify(events),
    JSON.stringify(immediateEvents),
    firstLoad,
    startManually,
    startOnMount
  ])

  // Dynamic timeout
  useEffect(() => {
    if (!firstLoad.current) {
      timeoutRef.current = timeout
      if (startManually) return
      if (idle.current) {
        emitOnActive.current()
        if (manager.current) {
          manager.current.active()
        }
      }
      start()
    }
  }, [timeout, manager, startManually, firstLoad, idle])

  useEffect(() => {
    if (firstLoad.current) firstLoad.current = false
  }, [firstLoad])

  // Return API
  return {
    message,
    start,
    reset,
    activate,
    pause,
    resume,
    isIdle,
    isPrompted,
    isLeader,
    isLastActiveTab,
    getTabId,
    getRemainingTime,
    getElapsedTime,
    getTotalElapsedTime,
    getLastIdleTime,
    getLastActiveTime,
    getIdleTime,
    getTotalIdleTime,
    getActiveTime,
    getTotalActiveTime,
    // @ts-ignore
    setOnPrompt: (fn: IEventHandler) => {
      onPrompt = fn
      emitOnPrompt.current = fn
    },
    setOnIdle: (fn: IEventHandler) => {
      onIdle = fn
      emitOnIdle.current = fn
    },
    setOnActive: (fn: IEventHandler) => {
      onActive = fn
      emitOnActive.current = fn
    },
    setOnAction: (fn: IEventHandler) => {
      onAction = fn
      emitOnAction.current = fn
    },
    setOnMessage: (fn: IEventHandler) => {
      onMessage = fn
      emitOnMessage.current = fn
    }
  }
}
