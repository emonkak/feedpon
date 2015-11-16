import eventTypes from '../constants/eventTypes'
import { Action, IActionHandler } from '../actionDispatchers/interfaces'
import { IEventDispatcher } from '../eventDispatchers/interfaces'
import { IUnreadCountRepository } from '../repositories/interfaces'
import { Inject } from '../di/annotations'

type GetUnreadCountsCacheAction = Action<string>

@Inject
export default class GetUnreadCountsCacheHandler implements IActionHandler<GetUnreadCountsCacheAction, void> {
    constructor(private unreadCountRepository: IUnreadCountRepository) {
    }

    async handle(action: GetUnreadCountsCacheAction, eventDispatcher: IEventDispatcher): Promise<void> {
        const unreadCounts = await this.unreadCountRepository.getAll()
        if (unreadCounts) {
            eventDispatcher.dispatch({
                eventType: eventTypes.UNREAD_COUNTS_RECEIVED,
                unreadCounts
            })
        }
    }
}
