/// <reference path="../typings/localForage.d.ts" />

import * as feedly from '../services/feedly/interfaces'
import storageKeys from '../constants/storageKeys'
import { ISubscriptionRepository } from './interfaces'
import { Inject, Named } from '../di/annotations'

@Inject
export default class LocalForageSubscriptionRepository implements ISubscriptionRepository {
    constructor(@Named('LocalForage') private localForage: LocalForage) {
    }

    getAll(): Promise<feedly.Subscription[]> {
        return this.localForage.getItem(storageKeys.SUBSCRIPTIONS)
    }

    putAll(subscriptions: feedly.Subscription[]): Promise<void> {
        return this.localForage.setItem(storageKeys.SUBSCRIPTIONS, subscriptions as any)
    }

    deleteAll(): Promise<void> {
        return this.localForage.removeItem(storageKeys.SUBSCRIPTIONS)
    }
}
