/// <reference path="../../typings/localForage.d.ts" />

import storageKeys from '../../constants/storageKeys'
import { Inject, Named } from '../../di/annotations'
import { Subscription, ISubscriptionRepository } from './interfaces'

@Inject
export default class LocalForageSubscriptionRepository implements ISubscriptionRepository {
    constructor(@Named('LocalForage') private localForage: LocalForage) {
    }

    getAll(): Promise<Subscription[]> {
        return this.localForage.getItem(storageKeys.SUBSCRIPTIONS)
    }

    putAll(subscriptions: Subscription[]): Promise<void> {
        return this.localForage.setItem(storageKeys.SUBSCRIPTIONS, subscriptions as any)
    }

    deleteAll(): Promise<void> {
        return this.localForage.removeItem(storageKeys.SUBSCRIPTIONS)
    }
}
