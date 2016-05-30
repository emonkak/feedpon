import { fromEventPattern } from 'rxjs/observable/fromEventPattern';
import { Observable } from 'rxjs/Observable';

export default function fromChromeEvent<T>(
    event: chrome.events.Event<Function>,
    selector?: (...args: Array<any>) => T
): Observable<T> {
    return fromEventPattern(
        (handler) => event.addListener(handler),
        (handler) => event.removeListener(handler),
        selector
    );
}
