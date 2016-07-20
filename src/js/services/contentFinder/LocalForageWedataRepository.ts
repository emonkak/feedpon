import * as storageKeys from '../../constants/storageKeys';
import Inject from '../../shared/di/annotations/Inject';
import Named from '../../shared/di/annotations/Named';
import { WedataItem, IWedataRepository } from './interfaces';

@Inject
export default class LocalForageWedataRepository implements IWedataRepository {
    constructor(@Named('LocalForage') private _localForage: LocalForage) {
    }

    getAll<T>(resourceUrl: string): Promise<WedataItem<T>[]> {
        return this._localForage.getItem(storageKeys.WEDATA(resourceUrl));
    }

    putAll<T>(resourceUrl: string, items: WedataItem<T>[]): Promise<void> {
        return this._localForage.setItem(storageKeys.WEDATA(resourceUrl), items as any);
    }

    deleteAll(resourceUrl: string): Promise<void> {
        return this._localForage.removeItem(storageKeys.WEDATA(resourceUrl));
    }
}
