/// <reference path="../typings/localForage.d.ts" />

import * as feedly from '../services/feedly/interfaces'
import storageKeys from '../constants/storageKeys'
import { IUnreadCountRepository } from './interfaces'
import { Inject, Named } from '../di/annotations'

@Inject
export default class LocalForageUnreadCountRepository implements IUnreadCountRepository {
    constructor(@Named('LocalForage') private localForage: LocalForage) {
    }

    getAll(): Promise<feedly.UnreadCount[]> {
        return this.localForage.getItem(storageKeys.UNREADCOUNTS)
    }

    putAll(unreadcounts: feedly.UnreadCount[]): Promise<void> {
        return this.localForage.setItem(storageKeys.UNREADCOUNTS, unreadcounts as any)
    }

    deleteAll(): Promise<void> {
        return this.localForage.removeItem(storageKeys.UNREADCOUNTS)
    }
}
