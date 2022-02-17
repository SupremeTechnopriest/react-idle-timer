import { now } from './now'

/**
 * Generate a random token.
 *
 * @returns {String} Random token.
 * @private
 */
export function createToken (): string {
  return now().toString(36).substring(2)
}
