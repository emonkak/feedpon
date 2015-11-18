import Authenticator from '../services/feedly/authenticator'
import eventTypes from '../constants/eventTypes'
import { Action, IActionHandler } from '../actionDispatchers/interfaces'
import { IEventDispatcher } from '../eventDispatchers/interfaces'
import { Inject } from '../di/annotations'

type GetCredentialAction = Action<string>

@Inject
export default class GetCredentialHandler implements IActionHandler<GetCredentialAction, void> {
    constructor(private authenticator: Authenticator) {
    }

    async handle(action: GetCredentialAction, eventDispatcher: IEventDispatcher): Promise<void> {
        const credential = await this.authenticator.getCredential()

        eventDispatcher.dispatch({
            eventType: eventTypes.CREDENTIAL_RECEIVED,
            credential
        })
    }
}

