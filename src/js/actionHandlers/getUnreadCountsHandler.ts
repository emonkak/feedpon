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

    async handle(action: GetUnreadCounts, eventDispatcher: IEventDispatcher): Promise<void> {
        const { access_token } = await this.authenticator.getCredential()
        const { unreadcounts } = await this.gateway.allUnreadCounts(access_token)

        await this.unreadCountRepository.putAll(unreadcounts)

        eventDispatcher.dispatch({
            eventType: eventTypes.UNREAD_COUNTS_RECEIVED,
            unreadCounts: unreadcounts
        })
    }
}
