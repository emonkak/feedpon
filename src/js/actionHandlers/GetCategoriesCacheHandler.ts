import { CategoriesReceived } from '../constants/eventTypes'
import { GetCategories } from '../constants/actionTypes'
import { IActionHandler } from './interfaces'
import { ICategoryRepository } from '../services/feedly/interfaces'
import { IEventDispatcher } from '../eventDispatchers/interfaces'
import { Inject } from '../di/annotations'

@Inject
export default class GetCategoriesCacheHandler implements IActionHandler<GetCategories, void> {
    constructor(private categoryRepository: ICategoryRepository) {
    }

    async handle(action: GetCategories, eventDispatcher: IEventDispatcher): Promise<void> {
        const categories = await this.categoryRepository.getAll()
        if (categories) {
            eventDispatcher.dispatch<CategoriesReceived>({
                eventType: CategoriesReceived,
                categories
            })
        }
    }
}
