import { AnyAction, AnyEvent, IActionDispatcher } from '../interfaces'
import { Observable } from 'rxjs/Observable'

export default class NullActionDispatcher implements IActionDispatcher {
    dispatch<T extends AnyAction>(action: T): Observable<AnyEvent> {
        return Observable.empty()
    }
}
