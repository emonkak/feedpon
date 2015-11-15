import * as feedly from '../services/feedly/interfaces'
import Authenticator from '../services/feedly/authenticator'
import Gateway from '../services/feedly/gateway'
import { Action, IActionHandler } from '../actionDispatchers/interfaces'
import { IEventDispatcher } from '../eventDispatchers/interfaces'
import { Inject } from '../di/annotations'
import eventTypes from '../constants/eventTypes'

type GetUnreadCounts = Action<string> & feedly.UnreadCountsInput

@Inject
export default class GetUnreadCountsHandler implements IActionHandler<GetUnreadCounts, void> {
    constructor(private authenticator: Authenticator,
                private gateway: Gateway) {
    }

    handle(action: GetUnreadCounts, eventDispatcher: IEventDispatcher): Promise<void> {
        return this.authenticator.getCredential()
            .then(({ access_token }) => this.gateway.allUnreadCounts(access_token))
            .then(({ unreadcounts }) => {
                eventDispatcher.dispatch({ eventType: eventTypes.UNREAD_COUNTS_RECEIVED, unreadcounts })
            })
    }
}
