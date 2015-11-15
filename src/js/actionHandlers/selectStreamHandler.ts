import * as feedly from '../services/feedly/interfaces'
import eventTypes from '../constants/eventTypes'
import { Action, IActionHandler } from '../actionDispatchers/interfaces'
import { IEventDispatcher } from '../eventDispatchers/interfaces'
import { Inject } from '../di/annotations'

interface SelectStreamAction extends Action<string> {
    streamId: string
}

@Inject
export default class SelectStreamHandler implements IActionHandler<SelectStreamAction, void> {
    handle(action: SelectStreamAction, eventDispatcher: IEventDispatcher): Promise<void> {
        eventDispatcher.dispatch({
            eventType: eventTypes.STREAM_SELECTED,
            streamId: action.streamId
        })

        return Promise.resolve()
    }
}
