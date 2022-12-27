import type { ReactNode } from 'react'
import type { IIdleTimer } from '../src'

import { Component, createRef } from 'react'
import { render, fireEvent, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import { IdleTimerComponent, withIdleTimer } from '../src'
import { sleep, waitFor } from './test.utils'

interface IProps extends IIdleTimer {
  required: boolean
  optional?: string
}

describe('withIdleTimer', () => {
  it('Should pass API as props with higher order component', () => {
    class Root extends Component<IProps, {}> {
      render () {
        return (
          <>
            <div data-testid='remaining'>{String(this.props.getRemainingTime())}</div>
            <div data-testid='isIdle'>{String(this.props.isIdle())}</div>
          </>
        )
      }
    }

    const Instance = withIdleTimer<IProps>(Root)
    const { rerender } = render(<Instance timeout={1000} required />)
    expect(screen.getByTestId('remaining')).toHaveTextContent('1000')
    expect(screen.getByTestId('isIdle')).toHaveTextContent('false')
    fireEvent.mouseDown(document)
    rerender(<Instance required />)
    expect(screen.getByTestId('isIdle')).toHaveTextContent('false')
  })

  it('Should accept wrapped instance methods for callbacks', async () => {
    const onPrompt = jest.fn()
    const onIdle = jest.fn()
    const onAction = jest.fn()
    const onActive = jest.fn()
    const onMessage = jest.fn()

    class Root extends IdleTimerComponent<IProps, {}> {
      onPrompt () {
        onPrompt()
      }

      onIdle () {
        onIdle()
      }

      onActive (event: Event) {
        onActive(event)
      }

      onAction (event: Event) {
        onAction(event)
      }

      onMessage (data: any) {
        onMessage(data)
      }

      componentDidMount () {
        this.props.message('foo', true)
      }

      render (): ReactNode {
        return (
          <></>
        )
      }
    }

    const Instance = withIdleTimer<IProps>(Root)
    const { rerender } = render(
      <Instance
        timeout={200}
        promptTimeout={200}
        required
      />
    )

    await sleep(200)
    expect(onPrompt).toHaveBeenCalledTimes(1)
    expect(onIdle).toHaveBeenCalledTimes(0)
    expect(onAction).toHaveBeenCalledTimes(0)
    expect(onActive).toHaveBeenCalledTimes(0)
    await sleep(200)
    expect(onIdle).toHaveBeenCalledTimes(1)
    expect(onAction).toHaveBeenCalledTimes(0)
    expect(onActive).toHaveBeenCalledTimes(0)
    fireEvent.mouseDown(document)
    expect(onActive).toHaveBeenCalledTimes(1)
    expect(onAction).toHaveBeenCalledTimes(1)
    expect(onMessage).toHaveBeenCalledTimes(1)
    expect(onMessage).toHaveBeenCalledWith('foo')
    rerender(<Instance required />)
  })

  it('Should accept passed prop methods for callbacks', async () => {
    const onPrompt = jest.fn()
    const onIdle = jest.fn()
    const onAction = jest.fn()
    const onActive = jest.fn()

    class Root extends Component<IProps, {}> {
      render () {
        return (
          <></>
        )
      }
    }

    const Instance = withIdleTimer<IProps>(Root)
    const { rerender } = render(
      <Instance
        timeout={200}
        promptTimeout={200}
        onPrompt={onPrompt}
        onIdle={onIdle}
        onActive={onActive}
        onAction={onAction}
        required
      />
    )

    await sleep(200)
    expect(onPrompt).toHaveBeenCalledTimes(1)
    await sleep(200)
    expect(onIdle).toHaveBeenCalledTimes(1)
    fireEvent.mouseDown(document)
    expect(onActive).toHaveBeenCalledTimes(1)
    expect(onAction).toHaveBeenCalledTimes(1)
    rerender(<Instance required />)
  })

  it('Should forward ref to IIdleTimer instance', async () => {
    class Root extends Component<IProps, {}> {
      render () {
        return (
          <></>
        )
      }
    }

    const idleTimerRef = createRef<IIdleTimer>()
    const Instance = withIdleTimer<IProps>(Root)

    const { rerender } = render(
      <Instance
        ref={idleTimerRef}
        timeout={200}
        required
      />
    )

    expect(idleTimerRef.current).not.toBeNull()
    await sleep(200)
    expect(idleTimerRef.current.isIdle()).toBe(true)
    rerender(<Instance required />)
  })

  it('Should forward ref as a function', async () => {
    class Root extends Component<IProps, {}> {
      render () {
        return (
          <></>
        )
      }
    }

    let idleTimerRef: IIdleTimer = null
    const Instance = withIdleTimer<IProps>(Root)

    const { rerender } = render(
      <Instance
        ref={(ref: IIdleTimer) => { idleTimerRef = ref }}
        timeout={200}
        required
      />
    )

    expect(idleTimerRef).not.toBeNull()
    await sleep(200)
    expect(idleTimerRef.isIdle()).toBe(true)
    rerender(<Instance required />)
  })

  it('Should should start manually on mount lifecycle', async () => {
    class Root extends Component<IProps, {}> {
      componentDidMount () {
        this.props.start()
      }

      render () {
        return null
      }
    }

    let idleTimerRef: IIdleTimer = null
    const Instance = withIdleTimer<IProps>(Root)

    render(
      <Instance
        ref={(ref: IIdleTimer) => { idleTimerRef = ref }}
        timeout={200}
        startManually
        required
      />
    )

    expect(idleTimerRef).not.toBeNull()
    await waitFor(() => idleTimerRef.isIdle())
    expect(idleTimerRef.isIdle()).toBe(true)
  })
})
