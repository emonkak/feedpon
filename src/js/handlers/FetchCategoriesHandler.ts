import Authenticator from '../services/feedly/Authenticator';
import Gateway from '../services/feedly/Gateway';
import Inject from '../shared/di/annotation/Inject';
import { CategoriesReceived } from '../constants/eventTypes';
import { EventDispatcher, IActionHandler } from '../shared/interfaces';
import { FetchCategories } from '../constants/actionTypes';
import { ICategoryRepository } from '../services/feedly/interfaces';

@Inject
export default class FetchCategoriesHandler implements IActionHandler<FetchCategories> {
    constructor(private authenticator: Authenticator,
                private categoryRepository: ICategoryRepository,
                private gateway: Gateway) {
    }

    async handle(action: FetchCategories, dispatch: EventDispatcher): Promise<void> {
        const { access_token } = await this.authenticator.getCredential();
        const categories = await this.gateway.allCategories(access_token);

        await this.categoryRepository.putAll(categories);

        dispatch({
            eventType: CategoriesReceived,
            categories
        } as CategoriesReceived);
    }
}
