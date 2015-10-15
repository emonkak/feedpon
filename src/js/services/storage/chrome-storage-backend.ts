import {StorageBackend, IStorageBackend} from './storage-backend-interface';

@Provide(StorageBackend)
export default class ChromeLocalStorageBackend implements IStorageBackend {
    constructor(private storage: chrome.storage.StorageArea) {
    }

    get(key: string): Promise<any> {
        return this.getAll([key]).then((items) => items[key]);
    }

    getAll(keys: string[]): Promise<{[key: string]: any}> {
        return new Promise((resolve, reject) => {
            this.storage.get(keys, (items) => {
                if (chrome.runtime.lastError != null) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(items);
                }
            });
        });
    }

    set(key: string, item: any): Promise<void> {
        return this.setAll({
            [key]: item
        });
    }

    setAll(items: {[key: string]: any}): Promise<void> {
        return new Promise((resolve, reject) => {
            this.storage.set(items, () => {
                if (chrome.runtime.lastError != null) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve();
                }
            });
        });
    }

    remove(key: string): Promise<void> {
        return this.removeAll([key]);
    }

    removeAll(keys: string[]): Promise<void> {
        return new Promise((resolve, reject) => {
            this.storage.remove(keys, () => {
                if (chrome.runtime.lastError != null) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve();
                }
            });
        });
    }
}
