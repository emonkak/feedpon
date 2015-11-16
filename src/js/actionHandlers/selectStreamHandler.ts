import * as feedly from '../services/feedly/interfaces'
import Authenticator from '../services/feedly/authenticator'
import Gateway from '../services/feedly/gateway'
import eventTypes from '../constants/eventTypes'
import { Action, IActionHandler } from '../actionDispatchers/interfaces'
import { IEventDispatcher } from '../eventDispatchers/interfaces'
import { Inject } from '../di/annotations'

type SelectStreamAction = Action<string> & feedly.GetStreamInput

@Inject
export default class SelectStreamHandler implements IActionHandler<SelectStreamAction, void> {
    constructor(private authenticator: Authenticator,
                private gateway: Gateway) {
    }

    async handle(action: SelectStreamAction, eventDispatcher: IEventDispatcher): Promise<void> {
        eventDispatcher.dispatch({
            eventType: eventTypes.STREAM_SELECTED,
            streamId: action.streamId
        })

        const { access_token } = await this.authenticator.getCredential()
        const contents = await this.gateway.getContents(access_token, action)

        eventDispatcher.dispatch({ eventType: eventTypes.CONTENTS_RECEIVED, contents })
    }
}
