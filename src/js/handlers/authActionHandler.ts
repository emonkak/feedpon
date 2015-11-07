import * as feedly from '../services/feedly/interfaces'
import AuthService from '../services/feedly/authService'
import { Action, IActionHandler } from '../dispatchers/interfaces'
import { IWindowOpener } from '../services/window/interfaces'
import { Inject, Singleton } from '../di/annotations'

interface AuthAction extends Action<string> {
}

@Inject
@Singleton
export default class AuthActionHandler implements IActionHandler<AuthAction, feedly.Credential> {
    constructor(private authService: AuthService,
                private windowOpener: IWindowOpener) {
    }

    handle(action: AuthAction): Promise<feedly.Credential> {
        return this.authService.getCredential()
            .catch(() => this.authService.authenticate(this.windowOpener))
    }
}
