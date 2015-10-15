export class StorageBackend {}

export interface IStorageBackend {
    get(key: string): Promise<any>;
    getAll(keys: string[]): Promise<{[key: string]: any}>;

    set(key: string, item: any): Promise<void>;
    setAll(items: {[key: string]: any}): Promise<void>;

    remove(key: string): Promise<void>;
    removeAll(keys: string[]): Promise<void>;
}
