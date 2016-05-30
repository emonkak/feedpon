import Inject from '../shared/di/annotation/Inject';
import { CategoriesReceived } from '../constants/eventTypes';
import { EventDispatcher, IActionHandler } from '../shared/interfaces';
import { GetCategoriesCache } from '../constants/actionTypes';
import { ICategoryRepository } from '../services/feedly/interfaces';

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
