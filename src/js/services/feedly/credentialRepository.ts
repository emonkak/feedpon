/// <reference path="../../typings/localForage.d.ts" />

import * as feedly from './interfaces'
import storageKeys from '../../constants/storageKeys'
import { Inject, Named } from '../../di/annotations'

@Inject
export default class CredentialRepository {
    constructor(@Named('LocalForage') private localForage: LocalForage) {
    }

    get(): Promise<feedly.Credential> {
        return this.localForage.getItem(storageKeys.CREDENTIAL)
    }

    put(credential: feedly.Credential): Promise<feedly.Credential> {
        return this.localForage.setItem(storageKeys.CREDENTIAL, credential)
    }

    delete(): Promise<void> {
        return this.localForage.removeItem(storageKeys.CREDENTIAL)
    }
}
