import {StorageBackend, IStorageBackend} from './storage-backend-interface';
import {Provide} from 'di';

@Provide(StorageBackend)
export default class WebStorageBackend implements IStorageBackend {
    constructor(private storage: Storage) {
    }

    get(key: string): Promise<any> {
        return this.$q.when(JSON.parse(this.storage.getItem(key)));
    }

    getAll(keys: string[]): Promise<{[key: string]: any}> {
        var result: {[key: string]: any} = {};

        keys.forEach((key) => result[key] = JSON.parse(this.storage.getItem(key)));

        return Promise.resolve(result);
    }

    set(key: string, item: any): Promise<void> {
        this.storage.setItem(key, JSON.stringify(item));
        return Promise.resolve();
    }

    setAll(items: {[key: string]: any}): Promise<void> {
        for (var key in items) {
            if (items.hasOwnProperty(key)) {
                this.storage.setItem(key, JSON.stringify(items[key]));
            }
        }

        return Promise.resolve();
    }

    remove(key: string): Promise<void> {
        this.storage.removeItem(key);
        return Promise.resolve();
    }

    removeAll(keys: string[]): Promise<void> {
        keys.forEach((key) => this.storage.removeItem(key));
        return Promise.resolve();
    }
}
