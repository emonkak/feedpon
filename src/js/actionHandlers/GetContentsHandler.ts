import Authenticator from '../services/feedly/Authenticator'
import Gateway from '../services/feedly/Gateway'
import { IActionHandler, IEventDispatcher } from '../shared/interfaces'
import { ContentsReceived } from '../constants/eventTypes'
import { Inject } from '../shared/di/annotations'
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
