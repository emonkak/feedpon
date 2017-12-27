const DB_NAME = 'feedpon';
const DB_VERSION = 1;
const STORE_NAME = 'state';

export async function save(state: any): Promise<void> {
    const store = await openStore('readwrite');
    const requests = [];

    for (const key in state) {
        const request = store.put({ key, value: state[key] });
        requests.push(requestToPromise(request));
    }

    await Promise.all(requests);
}

export async function restore(keys: string[]): Promise<any> {
    const store = await openStore('readonly');
    const requests = [];

    for (const key of keys) {
        const request = store.get(key);
        requests.push(requestToPromise(request));
    }

    const items = await Promise.all(requests);

    return items.reduce((state, item) => {
        if (item != null) {
            state[item.key] = item.value;
        }
        return state;
    }, {});
}

async function openStore(mode: IDBTransactionMode): Promise<IDBObjectStore> {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
        const db = request.result as IDBDatabase;
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
    };

    const db: IDBDatabase = await requestToPromise(request);
    const transaction = db.transaction(STORE_NAME, mode);

    return transaction.objectStore(STORE_NAME);
}

function requestToPromise(request: IDBRequest): Promise<any> {
    return new Promise((resolve, reject) => {
        if (request.readyState === 'done') {
            resolve(request.result);
        } else {
            request.addEventListener('error', (event) => {
                reject(request.error);
            });
            request.addEventListener('success', (event) => {
                resolve(request.result);
            });
        }
    });
}
