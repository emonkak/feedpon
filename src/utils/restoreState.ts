export default function restoreState<TState>(versions: { [P in keyof TState]: number }, restore: (key: string) => any): Partial<TState> {
    return Object.keys(versions).reduce<Partial<TState>>((state, key) => {
        const data = restore(key);
        const version = versions[key];

        if (data != null && data.version && data.version === version) {
            state[key] = data;
        }

        return state;
    }, {});
}
