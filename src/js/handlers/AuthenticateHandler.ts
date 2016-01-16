import Authenticator from '../services/feedly/Authenticator'
import { Authenticate } from '../constants/actionTypes'
import { CredentialReceived } from '../constants/eventTypes'
import { EventDispatcher, IActionHandler } from '../shared/interfaces'
import { IWindowOpener } from '../services/window/interfaces'
import { Inject } from '../shared/di/annotations'

@Inject
export default class AuthenticateHandler implements IActionHandler<Authenticate> {
    constructor(private authenticator: Authenticator,
                private windowOpener: IWindowOpener) {
    }

    async handle(action: Authenticate, dispatch: EventDispatcher): Promise<void> {
        const credential = await this.authenticator.authenticate(this.windowOpener)

        dispatch({
            eventType: CredentialReceived,
            credential
        } as CredentialReceived)
    }
}
