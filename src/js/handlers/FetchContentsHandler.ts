import Authenticator from '../services/feedly/Authenticator'
import Gateway from '../services/feedly/Gateway'
import { EventDispatcher, IActionHandler } from '../shared/interfaces'
import { ContentsReceived } from '../constants/eventTypes'
import { Inject } from '../shared/di/annotations'
import { FetchContents } from '../constants/actionTypes'

@Inject
export default class FetchContentsHandler implements IActionHandler<FetchContents> {
    constructor(private authenticator: Authenticator,
                private gateway: Gateway) {
    }

    async handle(action: FetchContents, dispatch: EventDispatcher): Promise<void> {
        const { access_token } = await this.authenticator.getCredential()
        const contents = await this.gateway.getEntryContents(access_token, action.payload)

        dispatch({
            eventType: ContentsReceived,
            contents
        } as ContentsReceived)
    }
}
