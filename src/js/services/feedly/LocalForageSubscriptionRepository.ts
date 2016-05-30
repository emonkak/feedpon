import * as storageKeys from '../../constants/storageKeys';
import Inject from '../../shared/di/annotation/Inject';
import Named from '../../shared/di/annotation/Named';
import { Subscription, ISubscriptionRepository } from './interfaces';

@Inject
export default class LocalForageSubscriptionRepository implements ISubscriptionRepository {
    constructor(@Named('LocalForage') private _localForage: LocalForage) {
    }

    getAll(): Promise<Subscription[]> {
        return this._localForage.getItem(storageKeys.SUBSCRIPTIONS);
    }

    putAll(subscriptions: Subscription[]): Promise<void> {
        return this._localForage.setItem(storageKeys.SUBSCRIPTIONS, subscriptions as any);
    }

    deleteAll(): Promise<void> {
        return this._localForage.removeItem(storageKeys.SUBSCRIPTIONS);
    }
}
