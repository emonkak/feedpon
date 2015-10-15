import {Inject} from 'di';
import {StorageBackend, IStorageBackend} from './storage-backend-interface';
import * from 'services/feedly/feedly-interfaces';

const CREDENTIAL_KEY = 'credential';

@Inject(StorageBackend)
export default class CredentialRepository {
    constructor(private storage: IStorageBackend) {
    }

    get(): Promise<Credential> {
        return this.storage.get(CREDENTIAL_KEY);
    }

    put(credential: Credential): Promise<void> {
        return this.storage.set(CREDENTIAL_KEY, credential);
    }

    delete(): Promise<void> {
        return this.storage.remove(CREDENTIAL_KEY);
    }
}
