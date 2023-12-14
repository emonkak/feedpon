export interface Store<TState, TEvent> {
  getState(): TState;
  replaceState(state: TState): void;
  dispatch(event: TEvent): TEvent;
  subscribe(subscriber: Subscriber<TState>): () => void;
}

export type Middleware<TState, TEvent> = (
  store: Store<TState, TEvent>,
) => Handler<TEvent>;

export type Handler<TEvent> = (event: TEvent, next: Dispatcher<TEvent>) => any;

export type Dispatcher<TEvent> = (event: TEvent) => any;

export type Reducer<TState, TEvent> = (state: TState, event: TEvent) => TState;

export type Subscriber<TState> = (state: TState) => void;
