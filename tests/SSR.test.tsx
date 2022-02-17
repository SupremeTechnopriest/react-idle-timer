/**
 * @jest-environment node
 */

import { renderToString } from 'react-dom/server'
import { IS_BROWSER } from '../src/utils/isBrowser'
import { now } from '../src/utils/now'
import { DEFAULT_ELEMENT } from '../src/utils/defaults'
import { useIdleTimer } from '../src/useIdleTimer'

describe('Server Side Rendering', () => {
  it('Should return that environment is not a browser', () => {
    expect(IS_BROWSER).toBe(false)
  })

  it('Should return a null default element', () => {
    expect(DEFAULT_ELEMENT).toBe(null)
  })

  it('Should return now', () => {
    expect(now()).toBeDefined()
  })

  it('Should not bind events', () => {
    const App = () => {
      const idleTimer = useIdleTimer()
      idleTimer.start()
      idleTimer.pause()
      return (
        <div>{idleTimer.isIdle()}</div>
      )
    }

    expect(() => renderToString(<App />)).not.toThrow()
  })
})
