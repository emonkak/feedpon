import Authenticator from '../services/feedly/authenticator'
import Gateway from '../services/feedly/gateway'
import { IActionHandler } from './interfaces'
import { ContentsReceived, StreamSelected } from '../constants/eventTypes'
import { IEventDispatcher } from '../eventDispatchers/interfaces'
import { Inject } from '../di/annotations'
import { SelectStream } from '../constants/actionTypes'

@Inject
export default class SelectStreamHandler implements IActionHandler<SelectStream, void> {
    constructor(private authenticator: Authenticator,
                private gateway: Gateway) {
    }

    async handle(action: SelectStream, eventDispatcher: IEventDispatcher): Promise<void> {
        eventDispatcher.dispatch<StreamSelected>({
            eventType: StreamSelected,
            streamId: action.streamId
        })

        const { access_token } = await this.authenticator.getCredential()
        const contents = await this.gateway.getContents(access_token, action)

        eventDispatcher.dispatch<ContentsReceived>({
            eventType: ContentsReceived,
            contents
        })
    }
}
