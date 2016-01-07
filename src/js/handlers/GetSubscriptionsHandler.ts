import Authenticator from '../services/feedly/Authenticator'
import Gateway from '../services/feedly/Gateway'
import { GetSubscriptions } from '../constants/actionTypes'
import { AnyEvent, IActionHandler } from '../shared/interfaces'
import { ISubscriptionRepository } from '../services/feedly/interfaces'
import { Inject } from '../shared/di/annotations'
import { SubscriptionsReceived } from '../constants/eventTypes'

@Inject
export default class GetSubscriptionsHandler implements IActionHandler<GetSubscriptions> {
    constructor(private authenticator: Authenticator,
                private gateway: Gateway,
                private subscriptionRepository: ISubscriptionRepository) {
    }

    async handle(action: GetSubscriptions, dispatch: (event: AnyEvent) => void): Promise<void> {
        const { access_token } = await this.authenticator.getCredential()
        const subscriptions = await this.gateway.allSubscriptions(access_token)

        await this.subscriptionRepository.putAll(subscriptions)

        dispatch({
            eventType: SubscriptionsReceived,
            subscriptions
        } as SubscriptionsReceived)
    }
}
