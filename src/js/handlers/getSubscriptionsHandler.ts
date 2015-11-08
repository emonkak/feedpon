import * as feedly from '../services/feedly/interfaces'
import AuthService from '../services/feedly/authService'
import Gateway from '../services/feedly/gateway'
import { Action, IActionHandler } from '../dispatchers/interfaces'
import { Inject } from '../di/annotations'

interface GetSubscriptionsAction extends Action<string> {
}

@Inject
export default class GetSubscriptionsHandler implements IActionHandler<GetSubscriptionsAction, feedly.Subscription[]> {
    constructor(private authService: AuthService,
                private gateway: Gateway) {
    }

    handle(action: GetSubscriptionsAction): Promise<feedly.Subscription[]> {
        return this.authService.getCredential()
            .then(({ access_token }) => this.gateway.allSubscriptions(access_token))
    }
}
