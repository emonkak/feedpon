export interface Store<TState, TEvent> {
    getState(): TState;
    replaceState(nextState: TState): void;
    dispatch(event: TEvent): TEvent;
    subscribe(subscriber: Subscriber<TState>): () => void;
}

export type Middleware<TState, TEvent> = (store: Store<TState, TEvent>) => Handler<TState, TEvent>;

export type Delegate<TEvent> = (event: TEvent) => any;

export type Handler<TState, TEvent> = (event: TEvent, next: Delegate<TEvent>) => any;

export type Reducer<TState, TEvent> = (state: TState, event: TEvent) => TState;

export type Subscriber<TState> = (state: TState) => void;
