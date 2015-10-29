import { Action, IActionHandler } from './interfaces'
import { Inject } from '../di/annotations'

@Inject
export default class IdentityActionHandler<T extends Action<any>> implements IActionHandler<T, T> {
    handle(action: T): Promise<T> {
        return Promise.resolve(action)
    }
}
