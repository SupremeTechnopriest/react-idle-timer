import type { PresenceType } from './PresenceType'
import type { IIdleTimer } from './IIdleTimer'

export interface IPresenceChangeHandler {
  (presence: PresenceType, idleTimer: IIdleTimer): void
}
