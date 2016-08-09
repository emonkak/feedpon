import Inject from '../shared/di/annotations/Inject';
import { IEventDispatcher, IActionHandler } from '../shared/interfaces';
import { GetSubscriptionsCache } from '../constants/actionTypes';
import { ISubscriptionRepository } from '../services/feedly/interfaces';
import { SubscriptionsReceived } from '../constants/eventTypes';

@Inject
export default class GetSubscriptionsHandler implements IActionHandler<GetSubscriptionsCache> {
    static subscribedActionTypes = [GetSubscriptionsCache];

    constructor(private subscriptionsRepository: ISubscriptionRepository) {
    }

    async handle(action: GetSubscriptionsCache, dispatch: IEventDispatcher): Promise<void> {
        const subscriptions = await this.subscriptionsRepository.getAll();
        if (subscriptions) {
            dispatch({
                eventType: SubscriptionsReceived,
                subscriptions
            } as SubscriptionsReceived);
        }
    }
}
