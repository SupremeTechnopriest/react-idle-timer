/* eslint-disable no-unused-vars */
export {}
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeAround (value: number, diff: number): R
    }
  }
}
