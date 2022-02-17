import { EventType } from './EventType'
export interface IEventHandler {
  (event?: EventType): void
  cancel?: () => void
}
