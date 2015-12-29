import Authenticator from '../services/feedly/Authenticator'
import { Authenticate } from '../constants/actionTypes'
import { CredentialReceived } from '../constants/eventTypes'
import { IActionHandler } from './interfaces'
import { IEventDispatcher } from '../eventDispatchers/interfaces'
import { IWindowOpener } from '../services/window/interfaces'
import { Inject } from '../di/annotations'

@Inject
export default class AuthenticateHandler implements IActionHandler<Authenticate, void> {
    constructor(private authenticator: Authenticator,
                private windowOpener: IWindowOpener) {
    }

    async handle(action: Authenticate, eventDispatcher: IEventDispatcher): Promise<void> {
        const credential = await this.authenticator.authenticate(this.windowOpener)

        eventDispatcher.dispatch<CredentialReceived>({
            eventType: CredentialReceived,
            credential
        })
    }
}
