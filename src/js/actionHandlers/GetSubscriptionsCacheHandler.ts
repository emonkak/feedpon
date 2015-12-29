import { IActionHandler } from './interfaces'
import { GetSubscriptionsCache } from '../constants/actionTypes'
import { IEventDispatcher } from '../eventDispatchers/interfaces'
import { ISubscriptionRepository } from '../services/feedly/interfaces'
import { Inject } from '../di/annotations'
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
