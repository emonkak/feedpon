export interface EventStore<TState, TEvent> {
  saveEvents(events: IdentifiedEvent<TEvent>[]): Promise<void>;
  saveSnapshot(snapshot: Snapshot<TState>): Promise<void>;
  restoreUnappliedEvents(version: number): Promise<IdentifiedEvent<TEvent>[]>;
  restoreLatestSnapshot(): Promise<Snapshot<TState> | null>;
}

export interface Snapshot<TState> {
  state: TState;
  version: number;
}

export interface IdentifiedEvent<TEvent> {
  id: number;
  payload: TEvent;
}
