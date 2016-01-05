import { GetSubscriptionsCache } from '../constants/actionTypes'
import { IEventDispatcher, IActionHandler } from '../shared/interfaces'
import { ISubscriptionRepository } from '../services/feedly/interfaces'
import { Inject } from '../shared/di/annotations'
import { SubscriptionsReceived } from '../constants/eventTypes'

@Inject
export default class GetSubscriptionsHandler implements IActionHandler<GetSubscriptionsCache, void> {
    constructor(private subscriptionsRepository: ISubscriptionRepository) {
    }

    async handle(action: GetSubscriptionsCache, eventDispatcher: IEventDispatcher): Promise<void> {
        const subscriptions = await this.subscriptionsRepository.getAll()
        if (subscriptions) {
            eventDispatcher.dispatch<SubscriptionsReceived>({
                eventType: SubscriptionsReceived,
                subscriptions
            })
        }
    }
}
