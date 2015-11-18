import * as feedly from '../services/feedly/interfaces'
import Authenticator from '../services/feedly/authenticator'
import eventTypes from '../constants/eventTypes'
import { Action, IActionHandler } from '../actionDispatchers/interfaces'
import { IEventDispatcher } from '../eventDispatchers/interfaces'
import { IWindowOpener } from '../services/window/interfaces'
import { Inject } from '../di/annotations'

type AuthenticateAction = Action<string>

@Inject
export default class AuthenticateHandler implements IActionHandler<AuthenticateAction, void> {
    constructor(private authenticator: Authenticator,
                private windowOpener: IWindowOpener) {
    }

    async handle(action: AuthenticateAction, eventDispatcher: IEventDispatcher): Promise<void> {
        const credential = await this.authenticator.authenticate(this.windowOpener)

        eventDispatcher.dispatch({
            eventType: eventTypes.CREDENTIAL_RECEIVED,
            credential
        })
    }
}
