import { Action, IActionHandler } from '../dispatchers/interfaces'
import { Inject } from '../di/annotations'

@Inject
export default class IdenticalHandler<T extends Action<any>> implements IActionHandler<T, T> {
    handle(action: T): Promise<T> {
        return Promise.resolve(action)
    }
}
