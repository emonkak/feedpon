import { Action, IActionDispatcher } from '../interfaces'

export default class ChromeBackgroundActionDispatcher implements IActionDispatcher {
    dispatch<A extends Action<string>>(action: A): Promise<any> {
        return new Promise((resolve, reject) => {
            (chrome as any).runtime.sendMessage(action, (response: any) => {
                if (response.success) {
                    resolve(response.result)
                } else {
                    reject(response.result)
                }
            })
        })
    }
}
