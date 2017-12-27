export function save(state: any): Promise<void> {
    for (const key in state) {
        localStorage.setItem(key, JSON.stringify(state[key]));
    }

    return Promise.resolve();
}

export function restore(keys: string[]): Promise<any> {
    let state: { [key: string]: any } = {};

    for (const key of keys) {
        const jsonString = localStorage.getItem(key);

        if (typeof jsonString === 'string' && jsonString !== '') {
            try {
                state[key] = JSON.parse(jsonString);
            } catch (_error) {
            }
        }
    }

    return Promise.resolve(state);
}
