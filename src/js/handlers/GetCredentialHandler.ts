import Authenticator from '../services/feedly/Authenticator'
import { CredentialReceived } from '../constants/eventTypes'
import { GetCredential } from '../constants/actionTypes'
import { EventDispatcher, IActionHandler } from '../shared/interfaces'
import { Inject } from '../shared/di/annotations'

@Inject
export default class GetCredentialHandler implements IActionHandler<GetCredential> {
    constructor(private authenticator: Authenticator) {
    }

    async handle(action: GetCredential, dispatch: EventDispatcher): Promise<void> {
        const credential = await this.authenticator.getCredential()

        if (credential) {
            dispatch({
                eventType: CredentialReceived,
                credential
            } as CredentialReceived)
        }
    }
}

