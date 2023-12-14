export default function combineReducer<TState, TEvent>(
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
