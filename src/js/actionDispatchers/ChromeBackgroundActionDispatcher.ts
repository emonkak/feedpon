/// <reference path="../typings/chrome.d.ts" />

import { Action } from '../constants/actionTypes'
import { IActionDispatcher } from './interfaces'

export default class ChromeBackgroundActionDispatcher implements IActionDispatcher {
    dispatch<A extends Action<string>>(action: A): Promise<any> {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(action, response => {
                if (response && !('error' in response)) {
                    resolve(response.result)
                } else {
                    reject(response ? response.error : null)
                }
            })
        })
    }
}
