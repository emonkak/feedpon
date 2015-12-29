import Authenticator from '../services/feedly/Authenticator'
import Gateway from '../services/feedly/Gateway'
import { IActionHandler } from './interfaces'
import { GetSubscriptions } from '../constants/actionTypes'
import { IEventDispatcher } from '../eventDispatchers/interfaces'
import { ISubscriptionRepository } from '../services/feedly/interfaces'
import { Inject } from '../di/annotations'
import { SubscriptionsReceived } from '../constants/eventTypes'

@Inject
export default class GetSubscriptionsHandler implements IActionHandler<GetSubscriptions, void> {
    constructor(private authenticator: Authenticator,
                private gateway: Gateway,
                private subscriptionRepository: ISubscriptionRepository) {
    }

    async handle(action: GetSubscriptions, eventDispatcher: IEventDispatcher): Promise<void> {
        const { access_token } = await this.authenticator.getCredential()
        const subscriptions = await this.gateway.allSubscriptions(access_token)

        await this.subscriptionRepository.putAll(subscriptions)

        eventDispatcher.dispatch<SubscriptionsReceived>({
            eventType: SubscriptionsReceived,
            subscriptions
        })
    }
}
