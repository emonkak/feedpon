import { EventDispatcher, IActionHandler } from '../shared/interfaces';
import { CategoriesReceived } from '../constants/eventTypes';
import { GetCategoriesCache } from '../constants/actionTypes';
import { ICategoryRepository } from '../services/feedly/interfaces';
import { Inject } from '../shared/di/annotations';

@Inject
export default class GetCategoriesCacheHandler implements IActionHandler<GetCategoriesCache> {
    constructor(private categoryRepository: ICategoryRepository) {
    }

    async handle(action: GetCategoriesCache, dispatch: EventDispatcher): Promise<void> {
        const categories = await this.categoryRepository.getAll();
        if (categories) {
            dispatch({
                eventType: CategoriesReceived,
                categories
            } as CategoriesReceived);
        }
    }
}
