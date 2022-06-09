/**
 * Generate a random token.
 *
 * @returns {String} Random token.
 * @private
 */
export function createToken (): string {
  return Math.random().toString(36).substring(2)
}
