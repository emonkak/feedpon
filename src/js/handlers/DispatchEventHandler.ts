import { AnyEvent } from '../shared/interfaces'
import { DispatchEvent } from '../constants/actionTypes'
import { EventDispatcher, IActionHandler } from '../shared/interfaces'
import { Inject } from '../shared/di/annotations'

@Inject
export default class DispatchEventHandler implements IActionHandler<DispatchEvent<AnyEvent>> {
    handle(action: DispatchEvent<AnyEvent>, dispatch: EventDispatcher): Promise<void> {
        dispatch(action.event)
        return Promise.resolve()
    }
}
