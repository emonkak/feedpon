import * as feedly from '../services/feedly/interfaces'
import Authenticator from '../services/feedly/authenticator'
import Gateway from '../services/feedly/gateway'
import eventTypes from '../constants/eventTypes'
import { Action, IActionHandler } from '../actionDispatchers/interfaces'
import { ICategoryRepository } from '../repositories/interfaces'
import { IEventDispatcher } from '../eventDispatchers/interfaces'
import { Inject } from '../di/annotations'

type GetCategories = Action<string>

@Inject
export default class GetCategoriesHandler implements IActionHandler<GetCategories, void> {
    constructor(private authenticator: Authenticator,
                private categoryRepository: ICategoryRepository,
                private gateway: Gateway) {
    }

    handle(action: GetCategories, eventDispatcher: IEventDispatcher): Promise<void> {
        return this.authenticator.getCredential()
            .then(({ access_token }) => this.gateway.allCategories(access_token))
            .then(categories => this.categoryRepository.putAll(categories).then(() => categories))
            .then(categories => {
                eventDispatcher.dispatch({ eventType: eventTypes.CATEGORIES_RECEIVED, categories })
            })
    }
}
