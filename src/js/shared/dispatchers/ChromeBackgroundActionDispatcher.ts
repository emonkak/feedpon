import { AnyAction, AnyEvent, IActionDispatcher } from '../interfaces';
import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';

export default class ChromeBackgroundActionDispatcher implements IActionDispatcher {
    dispatch(action: AnyAction): Observable<AnyEvent> {
        return new Observable((observer: Subscriber<AnyEvent>) => {
            chrome.runtime.sendMessage(action, response => {
                if (response && response.hasOwnProperty('error')) {
                    observer.error(response.error);
                } else {
                    observer.complete();
                }
            });
        });
    }
}
