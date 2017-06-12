export default function restoreState<TState extends Record<keyof TState, { version: number }>>(
    initialState: TState,
    restore: (key: string) => any
): TState {
    const keys = Object.keys(initialState) as (keyof TState)[];

    return keys.reduce<TState>((state, key) => {
        const data = restore(key);
        const { version } = initialState[key];

        if (data != null && data.version === version) {
            state[key] = data;
        }

        return state;
    }, initialState);
}
