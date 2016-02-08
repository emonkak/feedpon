import * as storageKeys from '../../constants/storageKeys'
import { Inject, Named } from '../../shared/di/annotations'
import { WedataItem, IWedataRepository } from './interfaces'

@Inject
export default class LocalForageWedataRepository implements IWedataRepository {
    constructor(@Named('LocalForage') private _localForage: LocalForage) {
    }

    getAll<T>(resourceUrl: string): Promise<WedataItem<T>[]> {
        return this._localForage.getItem(storageKeys.WEDATA(resourceUrl))
    }

    putAll<T>(resourceUrl: string, items: WedataItem<T>[]): Promise<void> {
        return this._localForage.setItem(storageKeys.WEDATA(resourceUrl), items as any)
    }

    deleteAll<T>(resourceUrl: string): Promise<void> {
        return this._localForage.removeItem(storageKeys.WEDATA(resourceUrl))
    }
}
