import Authenticator from '../services/feedly/authenticator'
import Gateway from '../services/feedly/gateway'
import eventTypes from '../constants/eventTypes'
import { Action, IActionHandler } from '../actionDispatchers/interfaces'
import { IEventDispatcher } from '../eventDispatchers/interfaces'
import { Inject } from '../di/annotations'
import { GetUnreadCountsInput, IUnreadCountRepository } from '../services/feedly/interfaces'

type GetUnreadCounts = Action<string> & UnreadCountsInput

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
