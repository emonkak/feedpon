/// <reference path="../../typings/localForage.d.ts" />

import * as storageKeys from '../../constants/storageKeys'
import { Credential, ICredentialRepository } from './interfaces'
import { Inject, Named } from '../../di/annotations'

@Inject
export default class LocalForageCredentialRepository implements ICredentialRepository {
    constructor(@Named('LocalForage') private localForage: LocalForage) {
    }

    get(): Promise<Credential> {
        return this.localForage.getItem(storageKeys.CREDENTIAL)
    }

    put(credential: Credential): Promise<void> {
        return this.localForage.setItem(storageKeys.CREDENTIAL, credential as any)
    }

    delete(): Promise<void> {
        return this.localForage.removeItem(storageKeys.CREDENTIAL)
    }
}
