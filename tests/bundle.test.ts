import { renderHook } from '@testing-library/react-hooks'
import { useIdleTimer, createMocks } from '../dist/index.cjs.js'
import { timers } from '../src/utils/timers'
import { sleep, waitFor } from './test.utils'

beforeAll(async () => {
  await createMocks()
})

describe('Bundle', () => {
  it('Should mock timers', async () => {
    // await createMocks()
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
      emitOnAllTabs: true,
      onMessage: fn
    }))

    renderHook(() => useIdleTimer({
      crossTab: true,
      emitOnAllTabs: true,
      onMessage: fn
    }))

    timer.result.current.message('foo', true)
    await sleep(100)
    expect(fn).toHaveBeenCalledTimes(2)
  })
})
