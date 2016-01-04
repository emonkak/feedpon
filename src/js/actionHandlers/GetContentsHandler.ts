import Authenticator from '../services/feedly/Authenticator'
import Gateway from '../services/feedly/Gateway'
import { IActionHandler } from './interfaces'
import { ContentsReceived, StreamSelected } from '../constants/eventTypes'
import { IEventDispatcher } from '../eventDispatchers/interfaces'
import { Inject } from '../di/annotations'
import { GetContents } from '../constants/actionTypes'

@Inject
export default class GetContentsHandler implements IActionHandler<GetContents, void> {
    constructor(private authenticator: Authenticator,
                private gateway: Gateway) {
    }

    async handle(action: GetContents, eventDispatcher: IEventDispatcher): Promise<void> {
        const { access_token } = await this.authenticator.getCredential()
        const contents = await this.gateway.getEntryContents(access_token, action.payload)

        eventDispatcher.dispatch<ContentsReceived>({
            eventType: ContentsReceived,
            contents
        })
    }
}
