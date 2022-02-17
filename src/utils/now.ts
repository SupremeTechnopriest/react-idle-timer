import { IS_BROWSER } from './isBrowser'

export const now = (): number => IS_BROWSER ? performance.now() : Date.now()
