import Authenticator from '../services/feedly/authenticator'
import Gateway from '../services/feedly/gateway'
import eventTypes from '../constants/eventTypes'
import { Action, IActionHandler } from '../actionDispatchers/interfaces'
import { IEventDispatcher } from '../eventDispatchers/interfaces'
import { ISubscriptionRepository } from '../services/feedly/interfaces'
import { Inject } from '../di/annotations'

type GetSubscriptionsAction = Action<string>

@Inject
export default class GetSubscriptionsHandler implements IActionHandler<GetSubscriptionsAction, void> {
    constructor(private authenticator: Authenticator,
                private gateway: Gateway,
                private subscriptionRepository: ISubscriptionRepository) {
    }

    async handle(action: GetSubscriptionsAction, eventDispatcher: IEventDispatcher): Promise<void> {
        const { access_token } = await this.authenticator.getCredential()
        const subscriptions = await this.gateway.allSubscriptions(access_token)

        await this.subscriptionRepository.putAll(subscriptions)

        eventDispatcher.dispatch({
            eventType: eventTypes.SUBSCRIPTIONS_RECEIVED,
            subscriptions
        })
    }
}
