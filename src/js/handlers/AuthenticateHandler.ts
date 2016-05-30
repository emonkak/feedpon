import Authenticator from '../services/feedly/Authenticator';
import Inject from '../shared/di/annotation/Inject';
import { Authenticate } from '../constants/actionTypes';
import { CredentialReceived } from '../constants/eventTypes';
import { EventDispatcher, IActionHandler } from '../shared/interfaces';
import { IWindowOpener } from '../services/window/interfaces';

@Inject
export default class AuthenticateHandler implements IActionHandler<Authenticate> {
    constructor(private authenticator: Authenticator,
                private windowOpener: IWindowOpener) {
    }

    async handle(action: Authenticate, dispatch: EventDispatcher): Promise<void> {
        const credential = await this.authenticator.authenticate(this.windowOpener);

        if (credential) {
            dispatch({
                eventType: CredentialReceived,
                credential
            } as CredentialReceived);
        }
    }
}
