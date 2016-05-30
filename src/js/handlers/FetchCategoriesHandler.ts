import Authenticator from '../services/feedly/Authenticator';
import Gateway from '../services/feedly/Gateway';
import { EventDispatcher, IActionHandler } from '../shared/interfaces';
import { CategoriesReceived } from '../constants/eventTypes';
import { FetchCategories } from '../constants/actionTypes';
import { ICategoryRepository } from '../services/feedly/interfaces';
import { Inject } from '../shared/di/annotations';

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
