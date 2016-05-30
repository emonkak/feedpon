import * as storageKeys from '../../constants/storageKeys';
import Inject from '../../shared/di/annotation/Inject';
import Named from '../../shared/di/annotation/Named';
import { Category, ICategoryRepository } from './interfaces';

@Inject
export default class LocalForageCategoryRepository implements ICategoryRepository {
    constructor(@Named('LocalForage') private _localForage: LocalForage) {
    }

    getAll(): Promise<Category[]> {
        return this._localForage.getItem(storageKeys.CATEGORIES);
    }

    putAll(categories: Category[]): Promise<void> {
        return this._localForage.setItem(storageKeys.CATEGORIES, categories as any);
    }

    deleteAll(): Promise<void> {
        return this._localForage.removeItem(storageKeys.CATEGORIES);
    }
}
