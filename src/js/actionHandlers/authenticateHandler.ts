import * as feedly from '../services/feedly/interfaces'
import AuthService from '../services/feedly/authService'
import eventTypes from '../constants/eventTypes'
import { Action, IActionHandler } from '../actionDispatchers/interfaces'
import { IEventDispatcher } from '../eventDispatchers/interfaces'
import { IWindowOpener } from '../services/window/interfaces'
import { Inject } from '../di/annotations'

interface AuthenticateAction extends Action<string> {
}

@Inject
export default class AuthenticateHandler implements IActionHandler<AuthenticateAction, void> {
    constructor(private authService: AuthService,
                private eventDispatcher: IEventDispatcher,
                private windowOpener: IWindowOpener) {
    }

    handle(action: AuthenticateAction): Promise<void> {
        return this.authService.getCredential()
            .catch(() => this.authService.authenticate(this.windowOpener))
            .then(credential => {
                this.eventDispatcher.dispatch({ eventType: eventTypes.AUTHENTICATED, credential })
            })
    }
}
