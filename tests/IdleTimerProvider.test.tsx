import { Component, ContextType } from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import {
  IIdleTimerContext,
  IdleTimerContext,
  IdleTimerProvider,
  IdleTimerConsumer,
  useIdleTimerContext
} from '../src'

describe('IdleTimerProvider', () => {
  it('Should expose the API to nested class components', () => {
    class Child extends Component<{}, {}> {
      static contextType = IdleTimerContext
      declare context: ContextType<IIdleTimerContext>

      render () {
        return (
          <>
            <div data-testid='remaining'>{String(this.context.getRemainingTime())}</div>
            <div data-testid='isIdle'>{String(this.context.isIdle())}</div>
          </>
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

  it('Should expose the API to nested class components via consumer', () => {
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

  it('Should expose the API via useIdleTimerContext hook', () => {
    function Child () {
      const { getRemainingTime, isIdle } = useIdleTimerContext()
      return (
        <>
          <div data-testid='remaining'>{String(getRemainingTime())}</div>
          <div data-testid='isIdle'>{String(isIdle())}</div>
        </>
      )
    }

    function Root () {
      return (
        <IdleTimerProvider timeout={1000} startOnMount={false}>
          <Child />
        </IdleTimerProvider>
      )
    }

    render(<Root />)
    expect(screen.getByTestId('remaining')).toHaveTextContent('1000')
    expect(screen.getByTestId('isIdle')).toHaveTextContent('true')
  })
})
