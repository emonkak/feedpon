/// <reference path="../../typings/localForage.d.ts" />

import * as storageKeys from '../../constants/storageKeys'
import { Category, ICategoryRepository } from './interfaces'
import { Inject, Named } from '../../di/annotations'

@Inject
export default class LocalForageCategoryRepository implements ICategoryRepository {
    constructor(@Named('LocalForage') private localForage: LocalForage) {
    }

    getAll(): Promise<Category[]> {
        return this.localForage.getItem(storageKeys.CATEGORIES)
    }

    putAll(categories: Category[]): Promise<void> {
        return this.localForage.setItem(storageKeys.CATEGORIES, categories as any)
    }

    deleteAll(): Promise<void> {
        return this.localForage.removeItem(storageKeys.CATEGORIES)
    }
}
