import { CategoriesReceived } from '../constants/eventTypes'
import { GetCategories } from '../constants/actionTypes'
import { IActionHandler, IEventDispatcher } from '../shared/interfaces'
import { ICategoryRepository } from '../services/feedly/interfaces'
import { Inject } from '../shared/di/annotations'

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
