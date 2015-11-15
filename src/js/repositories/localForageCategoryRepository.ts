/// <reference path="../typings/localForage.d.ts" />

import * as feedly from '../services/feedly/interfaces'
import storageKeys from '../constants/storageKeys'
import { ICategoryRepository } from './interfaces'
import { Inject, Named } from '../di/annotations'

@Inject
export default class LocalForageCategoryRepository implements ICategoryRepository {
    constructor(@Named('LocalForage') private localForage: LocalForage) {
    }

    getAll(): Promise<feedly.Category[]> {
        return this.localForage.getItem(storageKeys.CATEGORIES)
    }

    putAll(categories: feedly.Category[]): Promise<void> {
        return this.localForage.setItem(storageKeys.CATEGORIES, categories as any)
    }

    deleteAll(): Promise<void> {
        return this.localForage.removeItem(storageKeys.CATEGORIES)
    }
}

