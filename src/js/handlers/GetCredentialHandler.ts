import Authenticator from '../services/feedly/Authenticator';
import Inject from '../shared/di/annotations/Inject';
import { CredentialReceived } from '../constants/eventTypes';
import { EventDispatcher, IActionHandler } from '../shared/interfaces';
import { GetCredential } from '../constants/actionTypes';

@Inject
export default class GetCredentialHandler implements IActionHandler<GetCredential> {
    constructor(private authenticator: Authenticator) {
    }

    async handle(action: GetCredential, dispatch: EventDispatcher): Promise<void> {
        const credential = await this.authenticator.getCredential();

        if (credential) {
            dispatch({
                eventType: CredentialReceived,
                credential
            } as CredentialReceived);
        }
    }
}

