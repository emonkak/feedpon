import { Middleware } from 'feedpon-utils/flux/types';
import { EventStore, Snapshot, IdentifiedEvent } from './types';

export default function eventSourcingMiddlewareFactory<TState, TEvent>(
  eventStore: EventStore<TState, TEvent>,
  initialVersion: number,
  snapshotPerEvents: number,
): Middleware<TState, TEvent> {
  let version = initialVersion;
  let reservedSnapshot: Snapshot<TState> | null = null;
  let reservedEvents: IdentifiedEvent<TEvent>[] = [];

  function persistIfRequired() {
    if (reservedEvents.length > 0) {
      const savingEvents = reservedEvents;

      reservedEvents = [];

      eventStore.saveEvents(savingEvents).catch((error) => {
        reservedEvents = savingEvents.concat(reservedEvents);

        return Promise.reject(error);
      });
    }

    if (reservedSnapshot !== null) {
      const savingSnapshot = reservedSnapshot;

      reservedSnapshot = null;

      eventStore.saveSnapshot(savingSnapshot).catch((error) => {
        if (!reservedSnapshot) {
          reservedSnapshot = savingSnapshot;
        }

        return Promise.reject(error);
      });
    }
  }

  const shedule =
    window.requestIdleCallback || ((func) => window.setTimeout(func, 0));

  return ({ getState }) =>
    (event, next) => {
      const result = next(event);

      version++;

      if (version % snapshotPerEvents === 0) {
        const state = getState();
        reservedSnapshot = {
          state,
          version,
        };
      }

      reservedEvents.push({
        id: version,
        payload: event,
      });

      shedule(persistIfRequired);

      return result;
    };
}
