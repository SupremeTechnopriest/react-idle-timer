import type { EventType } from './EventType'
import type { IIdleTimer } from './IIdleTimer'

export interface IEventHandler {
  (event?: EventType, idleTimer?: IIdleTimer): void
  cancel?: () => void
}
