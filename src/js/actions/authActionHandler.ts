/// <reference path="../../DefinitelyTyped/node/node-0.11.d.ts" />

import AuthService from '../services/authService'
import { AuthAction, IActionHandler } from './interfaces'
import { EventEmitter } from 'events'
import { Inject } from '../di/annotations'

@Inject
export default class AuthActionHandler implements IActionHandler<AuthAction, string> {
    constructor(private authService: AuthService) {
    }

    handle(action: AuthAction): Promise<string> {
        return this.authService.authenticate().then((credential) => {
            return credential
        })
    }
}
