import {Inject} from 'di':
import {Subscription} from 'services/feedly/feedly-interfaces';
import FeedlyGateway from 'services/feedly/feedly-gateway';
import SubscriptionRepository from './subscription-repository';

@Inject(FeedlyGateway, SubscriptionRepository)
export default class SubscriptionService {
    constructor(private feedlyGateway: FeedlyGateway,
                private subscriptionRepository: SubscriptionRepository) {
    }

    refreshAll(): Promise<Subscription[]> {
        return this.feedlyGateway.allSubscriptions().then((subscriptions) => {
            return this.subscriptionRepository.putSubscriptions(subscriptions)
                .then(() => subscriptions);
        });
    }
}
