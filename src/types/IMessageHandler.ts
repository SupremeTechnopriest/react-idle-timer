import type { IIdleTimer } from './IIdleTimer'

export interface IMessageHandler {
  (data: any, idleTimer: IIdleTimer): void
}
