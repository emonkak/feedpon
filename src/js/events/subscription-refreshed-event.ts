import Event from './event';
import {Subscription} from 'services/feedly/feedly-interfaces';

export default class SubscriptionRefreshedEvent extends Event<Subscription[]> {}
