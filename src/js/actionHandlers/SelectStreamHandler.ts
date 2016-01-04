import Authenticator from '../services/feedly/Authenticator'
import Gateway from '../services/feedly/Gateway'
import { IActionHandler } from './interfaces'
import { ContentsReceived, StreamSelected } from '../constants/eventTypes'
import { IEventDispatcher } from '../eventDispatchers/interfaces'
import { Inject } from '../di/annotations'
import { SelectStream } from '../constants/actionTypes'

@Inject
export default class SelectStreamHandler implements IActionHandler<SelectStream, void> {
    async handle(action: SelectStream, eventDispatcher: IEventDispatcher): Promise<void> {
        eventDispatcher.dispatch<StreamSelected>({
            eventType: StreamSelected,
            streamId: action.streamId
        })
    }
}
