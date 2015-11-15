import * as feedly from '../services/feedly/interfaces'
import Authenticator from '../services/feedly/authenticator'
import Gateway from '../services/feedly/gateway'
import eventTypes from '../constants/eventTypes'
import { Action, IActionHandler } from '../actionDispatchers/interfaces'
import { IEventDispatcher } from '../eventDispatchers/interfaces'
import { IUnreadCountRepository } from '../repositories/interfaces'
import { Inject } from '../di/annotations'

type GetUnreadCounts = Action<string> & feedly.UnreadCountsInput

@Inject
export default class GetUnreadCountsHandler implements IActionHandler<GetUnreadCounts, void> {
    constructor(private authenticator: Authenticator,
                private gateway: Gateway,
                private unreadCountRepository: IUnreadCountRepository) {
    }

    handle(action: GetUnreadCounts, eventDispatcher: IEventDispatcher): Promise<void> {
        return this.authenticator.getCredential()
            .then(({ access_token }) => this.gateway.allUnreadCounts(access_token))
            .then(({ unreadcounts }) => this.unreadCountRepository.putAll(unreadcounts).then(() => unreadcounts))
            .then(unreadCounts => {
                eventDispatcher.dispatch({ eventType: eventTypes.UNREAD_COUNTS_RECEIVED, unreadCounts })
            })
    }
}
