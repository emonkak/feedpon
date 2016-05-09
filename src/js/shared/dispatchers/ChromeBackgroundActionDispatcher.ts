import { AnyAction, AnyEvent, IActionDispatcher } from '../interfaces'
import { Observable } from 'rxjs/Observable'
import { Subscriber } from 'rxjs/Subscriber'

export default class ChromeBackgroundActionDispatcher implements IActionDispatcher {
    dispatch<T extends AnyAction>(action: T): Observable<AnyEvent> {
        return Observable.create((observer: Subscriber<AnyEvent>) => {
            (chrome as any).runtime.sendMessage(action, (response: any) => {
                if (response && response.hasOwnProperty('error')) {
                    observer.error(response.error)
                } else {
                    observer.complete()
                }
            })
        })
    }
}
