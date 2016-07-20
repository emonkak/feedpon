import Authenticator from '../services/feedly/Authenticator';
import Gateway from '../services/feedly/Gateway';
import Inject from '../shared/di/annotations/Inject';
import { EventDispatcher, IActionHandler } from '../shared/interfaces';
import { FetchSubscriptions } from '../constants/actionTypes';
import { ISubscriptionRepository } from '../services/feedly/interfaces';
import { SubscriptionsReceived } from '../constants/eventTypes';

@Inject
export default class FetchSubscriptionsHandler implements IActionHandler<FetchSubscriptions> {
    constructor(private authenticator: Authenticator,
                private gateway: Gateway,
                private subscriptionRepository: ISubscriptionRepository) {
    }

    async handle(action: FetchSubscriptions, dispatch: EventDispatcher): Promise<void> {
        const { access_token } = await this.authenticator.getCredential();
        const subscriptions = await this.gateway.allSubscriptions(access_token);

        await this.subscriptionRepository.putAll(subscriptions);

        dispatch({
            eventType: SubscriptionsReceived,
            subscriptions
        } as SubscriptionsReceived);
    }
}
