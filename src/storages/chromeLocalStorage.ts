export function save(state: any): Promise<void> {
    return new Promise((resolve) => {
        chrome.storage.local.set(state, resolve);
    });
}

export function restore(keys: string[]): Promise<any> {
    return new Promise((resolve) => {
        chrome.storage.local.get(keys, resolve);
    });
}
