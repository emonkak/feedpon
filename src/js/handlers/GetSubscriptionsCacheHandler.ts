import Inject from '../shared/di/annotation/Inject';
import { EventDispatcher, IActionHandler } from '../shared/interfaces';
import { GetSubscriptionsCache } from '../constants/actionTypes';
import { ISubscriptionRepository } from '../services/feedly/interfaces';
import { SubscriptionsReceived } from '../constants/eventTypes';

@Inject
export default class GetSubscriptionsHandler implements IActionHandler<GetSubscriptionsCache> {
    constructor(private subscriptionsRepository: ISubscriptionRepository) {
    }

    async handle(action: GetSubscriptionsCache, dispatch: EventDispatcher): Promise<void> {
        const subscriptions = await this.subscriptionsRepository.getAll();
        if (subscriptions) {
            dispatch({
                eventType: SubscriptionsReceived,
                subscriptions
            } as SubscriptionsReceived);
        }
    }
}
