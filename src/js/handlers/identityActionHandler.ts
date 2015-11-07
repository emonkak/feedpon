import { Action, IActionHandler } from '../dispatchers/interfaces'
import { Inject, Singleton } from '../di/annotations'

@Inject
@Singleton
export default class IdentityActionHandler<T extends Action<any>> implements IActionHandler<T, T> {
    handle(action: T): Promise<T> {
        return Promise.resolve(action)
    }
}
