import { Component, ReactNode } from 'react'
import { render, fireEvent, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import { IIdleTimer, withIdleTimer } from '../src'
import { sleep } from './test.utils'

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
    expect(screen.getByTestId('isIdle')).toHaveTextContent('true')
    fireEvent.mouseDown(document)
    rerender(<Instance required />)
    expect(screen.getByTestId('isIdle')).toHaveTextContent('false')
  })

  it('Should accept wrapped instance methods for callbacks', async () => {
    const onPrompt = jest.fn()
    const onIdle = jest.fn()
    const onAction = jest.fn()
    const onActive = jest.fn()

    class Root extends Component<IProps, {}> {
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
    await sleep(200)
    expect(onIdle).toHaveBeenCalledTimes(1)
    fireEvent.mouseDown(document)
    expect(onActive).toHaveBeenCalledTimes(1)
    expect(onAction).toHaveBeenCalledTimes(1)
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
})
