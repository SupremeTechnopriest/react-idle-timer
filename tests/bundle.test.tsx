import { Component } from 'react'
import { renderHook } from '@testing-library/react-hooks'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import {
  IdleTimerProvider,
  IdleTimerConsumer,
  useIdleTimer,
  workerTimers
} from '../dist/index.cjs.js'
import { timers, createMocks } from '../src/utils/timers'
import { sleep, waitFor } from './test.utils'

describe('Bundle', () => {
  it('Should mock timers', () => {
    createMocks()
    expect(timers.setTimeout).toEqual(setTimeout)
    expect(timers.clearTimeout).toEqual(clearTimeout)
    expect(timers.setInterval).toEqual(setInterval)
    expect(timers.clearInterval).toEqual(clearInterval)
  })

  it('Should run with mocked timers', async () => {
    const timer = renderHook(() => useIdleTimer({
      timeout: 200
    }))
    timer.result.current.start()
    expect(timer.result.current.isIdle()).toBe(false)
    await waitFor(() => timer.result.current.isIdle())
  })

  it('Should mock MessageChannel', async () => {
    const fn = jest.fn()
    const timer = renderHook(() => useIdleTimer({
      crossTab: true,
      onMessage: fn
    }))

    renderHook(() => useIdleTimer({
      crossTab: true,
      onMessage: fn
    }))

    timer.result.current.message('foo', true)
    await sleep(100)
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('Should render Provider', () => {
    class Child extends Component<{}, {}> {
      render () {
        return (
          <IdleTimerConsumer>
            {({ getRemainingTime, isIdle }) => (
              <>
                <div data-testid='remaining'>{String(getRemainingTime())}</div>
                <div data-testid='isIdle'>{String(isIdle())}</div>
              </>
            )}
          </IdleTimerConsumer>
        )
      }
    }

    class Root extends Component<{}, {}> {
      render () {
        return (
          <IdleTimerProvider timeout={1000} startOnMount={false}>
            <Child />
          </IdleTimerProvider>
        )
      }
    }

    render(<Root />)
    expect(screen.getByTestId('remaining')).toHaveTextContent('1000')
    expect(screen.getByTestId('isIdle')).toHaveTextContent('true')
  })

  it('Should return workerTimers interface', () => {
    expect(workerTimers.setTimeout).toBeDefined()
    expect(workerTimers.clearTimeout).toBeDefined()
    expect(workerTimers.setInterval).toBeDefined()
    expect(workerTimers.setInterval).toBeDefined()
  })
})
