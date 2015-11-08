import * as feedly from '../services/feedly/interfaces'
import AuthService from '../services/feedly/authService'
import { Action, IActionHandler } from '../dispatchers/interfaces'
import { IWindowOpener } from '../services/window/interfaces'
import { Inject } from '../di/annotations'

interface AuthenticateAction extends Action<string> {
}

@Inject
export default class AuthenticateActionHandler implements IActionHandler<AuthenticateAction, feedly.Credential> {
    constructor(private authService: AuthService,
                private windowOpener: IWindowOpener) {
    }

    handle(action: AuthenticateAction): Promise<feedly.Credential> {
        return this.authService.getCredential()
            .catch(() => this.authService.authenticate(this.windowOpener))
    }
}
