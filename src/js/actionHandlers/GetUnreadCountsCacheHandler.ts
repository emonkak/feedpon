import { GetUnreadCountsCache } from '../constants/actionTypes'
import { IActionHandler, IEventDispatcher } from '../shared/interfaces'
import { IUnreadCountRepository } from '../services/feedly/interfaces'
import { Inject } from '../shared/di/annotations'
import { UnreadCountsReceived } from '../constants/eventTypes'

@Inject
export default class GetUnreadCountsCacheHandler implements IActionHandler<GetUnreadCountsCache, void> {
    constructor(private unreadCountRepository: IUnreadCountRepository) {
    }

    async handle(action: GetUnreadCountsCache, eventDispatcher: IEventDispatcher): Promise<void> {
        const unreadCounts = await this.unreadCountRepository.getAll()
        if (unreadCounts) {
            eventDispatcher.dispatch<UnreadCountsReceived>({
                eventType: UnreadCountsReceived,
                unreadCounts
            })
        }
    }
}
