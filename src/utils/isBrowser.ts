/**
 * Determine if we are in a browser or a server environment.
 *
 * @private
 */
export const IS_BROWSER: boolean =
  (typeof window === 'undefined' ? 'undefined' : typeof window) === 'object'
