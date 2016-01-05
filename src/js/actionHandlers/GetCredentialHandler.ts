import Authenticator from '../services/feedly/Authenticator'
import { CredentialReceived } from '../constants/eventTypes'
import { GetCredential } from '../constants/actionTypes'
import { IActionHandler, IEventDispatcher } from '../shared/interfaces'
import { Inject } from '../shared/di/annotations'

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

