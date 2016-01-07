import { AnyAction, AnyEvent, IActionDispatcher, IActionHandlerClass } from '../interfaces'
import { ErrorObservable } from 'rxjs/observable/throw'
import { IContainer } from '../di/interfaces'
import { Observable } from 'rxjs/Observable'
import { Subscriber } from 'rxjs/Subscriber'

export default class ActionDispatcher implements IActionDispatcher {
    private _handlerClasses: { [key: string]: IActionHandlerClass<AnyAction> } = {}

    private _fallback: IActionDispatcher = {
        dispatch<T extends AnyAction>(action: T): Observable<AnyEvent> {
            // BUGS:
            return ErrorObservable.create<any>(new Error(`Can not handle the "${action.actionType}" action.`))
        }
    }

    constructor(private _container: IContainer) {
    }

    mount<T extends AnyAction>(actionType: string, handlerClass: IActionHandlerClass<T>): this {
        this._handlerClasses[actionType] = handlerClass
        return this
    }

    fallback(fallback: IActionDispatcher): this {
        this._fallback = fallback
        return this
    }

    dispatch<T extends AnyAction>(action: T): Observable<AnyEvent> {
        const { actionType } = action
        const handlerClass = this._handlerClasses[actionType]
        if (handlerClass) {
            return Observable.create((observer: Subscriber<AnyEvent>) => {
                const handler = this._container.get(handlerClass)
                handler.handle(action, event => observer.next(event))
                    .then(() => observer.complete())
                    .catch(error => observer.error(error))
            })
        }
        return this._fallback.dispatch(action)
    }
}
