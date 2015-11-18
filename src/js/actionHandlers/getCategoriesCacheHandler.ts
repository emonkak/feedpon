import eventTypes from '../constants/eventTypes'
import { Action, IActionHandler } from '../actionDispatchers/interfaces'
import { ICategoryRepository } from '../services/feedly/interfaces'
import { IEventDispatcher } from '../eventDispatchers/interfaces'
import { Inject } from '../di/annotations'

type GetCategoriesCacheAction = Action<string>

@Inject
export default class GetCategoriesCacheHandler implements IActionHandler<GetCategoriesCacheAction, void> {
    constructor(private categoryRepository: ICategoryRepository) {
    }

    async handle(action: GetCategoriesCacheAction, eventDispatcher: IEventDispatcher): Promise<void> {
        const categories = await this.categoryRepository.getAll()
        if (categories) {
            eventDispatcher.dispatch({
                eventType: eventTypes.CATEGORIES_RECEIVED,
                categories
            })
        }
    }
}
