import Authenticator from '../services/feedly/Authenticator'
import Gateway from '../services/feedly/Gateway'
import { GetUnreadCounts } from '../constants/actionTypes'
import { AnyEvent, IActionHandler } from '../shared/interfaces'
import { IUnreadCountRepository } from '../services/feedly/interfaces'
import { Inject } from '../shared/di/annotations'
import { UnreadCountsReceived } from '../constants/eventTypes'

@Inject
export default class GetUnreadCountsHandler implements IActionHandler<GetUnreadCounts> {
    constructor(private authenticator: Authenticator,
                private gateway: Gateway,
                private unreadCountRepository: IUnreadCountRepository) {
    }

    async handle(action: GetUnreadCounts, dispatch: (event: AnyEvent) => void): Promise<void> {
        const { access_token } = await this.authenticator.getCredential()
        const { unreadcounts } = await this.gateway.allUnreadCounts(access_token, action.payload)

        await this.unreadCountRepository.putAll(unreadcounts)

        dispatch({
            eventType: UnreadCountsReceived,
            unreadCounts: unreadcounts
        } as UnreadCountsReceived)
    }
}
