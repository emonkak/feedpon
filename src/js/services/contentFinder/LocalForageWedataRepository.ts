/// <reference path="../../typings/localForage.d.ts" />

import * as storageKeys from '../../constants/storageKeys'
import { Inject, Named } from '../../di/annotations'
import { WedataItem, IWedataRepository } from './interfaces'

@Inject
export default class LocalForageWedataRepository implements IWedataRepository {
    constructor(@Named('LocalForage') private localForage: LocalForage) {
    }

    getAll<T>(resourceUrl: string): Promise<WedataItem<T>[]> {
        return this.localForage.getItem(storageKeys.WEDATA + '.' + resourceUrl)
    }

    putAll<T>(resourceUrl: string, items: WedataItem<T>[]): Promise<void> {
        return this.localForage.setItem(storageKeys.WEDATA + '.' + resourceUrl, items as any)
    }

    deleteAll<T>(resourceUrl: string): Promise<void> {
        return this.localForage.removeItem(storageKeys.WEDATA + '.' + resourceUrl)
    }
}
