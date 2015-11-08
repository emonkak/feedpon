import * as feedly from '../services/feedly/interfaces'
import AuthService from '../services/feedly/authService'
import Gateway from '../services/feedly/gateway'
import { Action, IActionHandler } from '../actionDispatchers/interfaces'
import { IEventDispatcher } from '../eventDispatchers/interfaces'
import { Inject } from '../di/annotations'
import eventTypes from '../constants/eventTypes'

interface GetSubscriptionsAction extends Action<string> {
}

@Inject
export default class GetSubscriptionsHandler implements IActionHandler<GetSubscriptionsAction, void> {
    constructor(private authService: AuthService,
                private eventDispatcher: IEventDispatcher,
                private gateway: Gateway) {
    }

    handle(action: GetSubscriptionsAction): Promise<void> {
        return this.authService.getCredential()
            .then(({ access_token }) => this.gateway.allSubscriptions(access_token))
            .then(subscriptions => {
                this.eventDispatcher.dispatch({ eventType: eventTypes.SUBSCRIPTIONS_RECEIVED, subscriptions })
            })
    }
}
