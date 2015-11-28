import Authenticator from '../services/feedly/authenticator'
import { IActionHandler } from './interfaces'
import { CredentialReceived } from '../constants/eventTypes'
import { GetCredential } from '../constants/actionTypes'
import { IEventDispatcher } from '../eventDispatchers/interfaces'
import { Inject } from '../di/annotations'

@Inject
export default class GetCredentialHandler implements IActionHandler<GetCredential, void> {
    constructor(private authenticator: Authenticator) {
    }

    async handle(action: GetCredential, eventDispatcher: IEventDispatcher): Promise<void> {
        const credential = await this.authenticator.getCredential()

        eventDispatcher.dispatch<CredentialReceived>({
            eventType: CredentialReceived,
            credential
        })
    }
}

