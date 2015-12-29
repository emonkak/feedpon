import Authenticator from '../services/feedly/Authenticator'
import Gateway from '../services/feedly/Gateway'
import { IActionHandler } from './interfaces'
import { CategoriesReceived } from '../constants/eventTypes'
import { GetCategories } from '../constants/actionTypes'
import { ICategoryRepository } from '../services/feedly/interfaces'
import { IEventDispatcher } from '../eventDispatchers/interfaces'
import { Inject } from '../di/annotations'

@Inject
export default class GetCategoriesHandler implements IActionHandler<GetCategories, void> {
    constructor(private authenticator: Authenticator,
                private categoryRepository: ICategoryRepository,
                private gateway: Gateway) {
    }

    async handle(action: GetCategories, eventDispatcher: IEventDispatcher): Promise<void> {
        const { access_token } = await this.authenticator.getCredential()
        const categories = await this.gateway.allCategories(access_token)

        await this.categoryRepository.putAll(categories)

        eventDispatcher.dispatch<CategoriesReceived>({
            eventType: CategoriesReceived,
            categories
        })
    }
}
