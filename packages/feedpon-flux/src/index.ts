export interface Store<TState, TEvent> {
  getState(): TState;
  replaceState(state: TState): void;
  dispatch(event: TEvent): TEvent;
  subscribe(subscriber: Subscriber<TState>): () => void;
}

export type Middleware<TState, TEvent> = (
  store: Store<TState, TEvent>,
) => Handler<TEvent>;

export type Handler<TEvent> = (event: TEvent, next: Dispatch<TEvent>) => any;

export type Dispatch<TEvent> = (event: TEvent) => any;

export type Reducer<TState, TEvent> = (state: TState, event: TEvent) => TState;

export type Subscriber<TState> = (state: TState) => void;

export function applyMiddlewares<TState, TEvent>(
  store: Store<TState, TEvent>,
  middlewares: Middleware<TState, TEvent>[],
): Store<TState, TEvent> {
  const enhancedStore = { ...store };

  enhancedStore.dispatch = middlewares.reverse().reduce((acc, middleware) => {
    const handler = middleware(enhancedStore);
    return (event: TEvent) => handler(event, acc);
  }, store.dispatch);

  return enhancedStore;
}

type Action<TEvent> = (...args: any) => TEvent;

type Actions<TEvent> = { [key: string]: Action<TEvent> };

type BoundActions<TEvent, TAction extends Actions<TEvent>> = {
  [Property in keyof TAction]: (
    ...args: Parameters<TAction[Property]>
  ) => TEvent;
};

export function bindActions<TEvent, TActions extends Actions<TEvent>>(
  actions: TActions,
): (dispatch: Dispatch<TEvent>) => BoundActions<TEvent, TActions> {
  return (dispatch) => {
    const boundActions = {} as BoundActions<TEvent, TActions>;

    for (const key of Object.keys(actions) as (keyof TActions)[]) {
      const action = actions[key]!;

      boundActions[key] = function bindedAction(...args: any[]) {
        const event = action(...args);
        dispatch(event);
        return event;
      };
    }

    return boundActions;
  };
}

export function combineReducers<TState, TEvent>(
  reducers: {
    [P in keyof TState]: (state: TState[P], event: TEvent) => TState[P];
  },
): (state: TState, event: TEvent) => TState {
  return (state, event) => {
    const nextState: Partial<TState> = {};
    let hasChanged = false;

    for (const key of Object.keys(reducers) as (keyof TState)[]) {
      const reducer = reducers[key];
      const prevStateForKey = state[key];
      const nextStateForKey = reducer(state[key], event);

      nextState[key] = nextStateForKey;

      if (prevStateForKey !== nextStateForKey) {
        hasChanged = true;
      }
    }

    return hasChanged ? (nextState as TState) : state;
  };
}

export function createStore<TState, TEvent>(
  reducer: Reducer<TState, TEvent>,
  state: TState,
): Store<TState, TEvent> {
  const subscribers = new Set<Subscriber<TState>>();

  function getState(): TState {
    return state;
  }

  function replaceState(nextState: TState): void {
    if (state !== nextState) {
      state = nextState;
      subscribers.forEach((subscriber) => {
        subscriber(nextState);
      });
    }
  }

  function dispatch(event: TEvent): TEvent {
    const nextState = reducer(state, event);
    replaceState(nextState);
    return event;
  }

  function subscribe(subscriber: (state: TState) => void): () => void {
    subscribers.add(subscriber);

    let closed = false;

    return function unsubscribe() {
      if (!closed) {
        closed = true;
        subscribers.delete(subscriber);
      }
    };
  }

  return {
    getState,
    replaceState,
    dispatch,
    subscribe,
  };
}
