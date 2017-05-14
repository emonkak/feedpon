export interface Store<TState, TEvent> {
    getState(): TState;
    replaceState(nextState: TState): void;
    dispatch(event: TEvent): void;
    subscribe(subscriber: Subscriber<TState>): () => void;
}

export type Delegate<TEvent> = (event: TEvent) => void;

export type Middleware<TState, TEvent> = (event: TEvent, next: Delegate<TEvent>, context: Store<TState, TEvent>) => void;

export type Reducer<TState, TEvent> = (state: TState, event: TEvent) => TState;

export type Subscriber<TState> = (state: TState) => void;
