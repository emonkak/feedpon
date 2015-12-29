import Authenticator from '../services/feedly/Authenticator'
import Gateway from '../services/feedly/Gateway'
import { IActionHandler } from './interfaces'
import { GetUnreadCounts } from '../constants/actionTypes'
import { IEventDispatcher } from '../eventDispatchers/interfaces'
import { IUnreadCountRepository } from '../services/feedly/interfaces'
import { Inject } from '../di/annotations'
import { UnreadCountsReceived } from '../constants/eventTypes'

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

        eventDispatcher.dispatch<UnreadCountsReceived>({
            eventType: UnreadCountsReceived,
            unreadCounts: unreadcounts
        })
    }
}
