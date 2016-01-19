import { Observable } from 'rxjs/Observable'
import { Observer } from 'rxjs/Observer'

// XXX: ScalarObservable is buggy. Use this instead
export default function fromScalar<T>(value: T): Observable<T> {
    return Observable.create((observer: Observer<T>) => {
        observer.next(value)
        observer.complete()
    })
}

