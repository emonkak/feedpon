import * as storageKeys from '../../constants/storageKeys';
import Inject from '../../shared/di/annotations/Inject';
import Named from '../../shared/di/annotations/Named';
import { Credential, ICredentialRepository } from './interfaces';

@Inject
export default class LocalForageCredentialRepository implements ICredentialRepository {
    constructor(@Named('LocalForage') private _localForage: LocalForage) {
    }

    get(): Promise<Credential> {
        return this._localForage.getItem(storageKeys.CREDENTIAL);
    }

    put(credential: Credential): Promise<void> {
        return this._localForage.setItem(storageKeys.CREDENTIAL, credential as any);
    }

    delete(): Promise<void> {
        return this._localForage.removeItem(storageKeys.CREDENTIAL);
    }
}
