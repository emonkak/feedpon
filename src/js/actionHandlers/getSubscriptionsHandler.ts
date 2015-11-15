import * as feedly from '../services/feedly/interfaces'
import Authenticator from '../services/feedly/authenticator'
import Gateway from '../services/feedly/gateway'
import { Action, IActionHandler } from '../actionDispatchers/interfaces'
import { IEventDispatcher } from '../eventDispatchers/interfaces'
import { Inject } from '../di/annotations'
import eventTypes from '../constants/eventTypes'

type GetSubscriptionsAction = Action<string>

@Inject
export default class GetSubscriptionsHandler implements IActionHandler<GetSubscriptionsAction, void> {
    constructor(private authenticator: Authenticator,
                private gateway: Gateway) {
    }

    handle(action: GetSubscriptionsAction, eventDispatcher: IEventDispatcher): Promise<void> {
        return this.authenticator.getCredential()
            .then(({ access_token }) => this.gateway.allSubscriptions(access_token))
            .then(subscriptions => {
                eventDispatcher.dispatch({ eventType: eventTypes.SUBSCRIPTIONS_RECEIVED, subscriptions })
            })
    }
}
