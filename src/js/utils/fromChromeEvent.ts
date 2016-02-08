import { FromEventPatternObservable } from 'rxjs/observable/fromEventPattern'
import { Observable } from 'rxjs/Observable'

export default function fromChromeEvent<T>(
    event: chrome.events.Event,
    selector?: (...args: Array<any>) => T
): Observable<T> {
    return FromEventPatternObservable.create(
        (handler) => event.addListener(handler),
        (handler) => event.removeListener(handler as any),
        selector
    )
}
