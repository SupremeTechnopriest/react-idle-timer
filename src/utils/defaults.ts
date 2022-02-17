import { IS_BROWSER } from './isBrowser'
import { EventsType } from '../types/EventsType'

/**
 * Default element to listen for events on.
 *
 * @private
 */
export const DEFAULT_ELEMENT: Node = IS_BROWSER ? document : null

/**
 * The default events to determine activity.
 *
 * @private
 */
export const DEFAULT_EVENTS: EventsType[] = [
  'mousemove',
  'keydown',
  'wheel',
  'DOMMouseScroll',
  'mousewheel',
  'mousedown',
  'touchstart',
  'touchmove',
  'MSPointerDown',
  'MSPointerMove',
  'visibilitychange'
]
