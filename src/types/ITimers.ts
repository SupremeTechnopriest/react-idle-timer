export interface ITimers {
  setTimeout(fn: () => void, delay: number): number
  clearTimeout(id: number): void
  setInterval(fn: () => void, delay: number): number
  clearInterval(id: number): void
}
