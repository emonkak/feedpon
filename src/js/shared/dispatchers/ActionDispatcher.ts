import { AnyAction, AnyEvent, IActionDispatcher, IActionHandlerClass } from '../interfaces';
import { _throw } from 'rxjs/observable/throw';
import { IContainer } from '../di/interfaces';
import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';

export default class ActionDispatcher implements IActionDispatcher {
    private _handlerClasses: { [key: string]: IActionHandlerClass<AnyAction> } = {};

    private _fallback: IActionDispatcher = {
        dispatch(action: AnyAction): Observable<AnyEvent> {
            return _throw<AnyEvent>(new Error(`Can not handle the "${action.actionType}" action.`));
        }
    };

    constructor(private _container: IContainer) {
    }

    mount(actionType: string, handlerClass: IActionHandlerClass<AnyAction>): this {
        this._handlerClasses[actionType] = handlerClass;
        return this;
    }

    fallback(fallback: IActionDispatcher): this {
        this._fallback = fallback;
        return this;
    }

    dispatch(action: AnyAction): Observable<AnyEvent> {
        const { actionType } = action;
        const handlerClass = this._handlerClasses[actionType];
        if (handlerClass) {
            return new Observable((observer: Subscriber<AnyEvent>) => {
                const handler = this._container.get(handlerClass);
                handler.handle(action, event => observer.next(event))
                    .then(() => observer.complete())
                    .catch(error => observer.error(error));
            });
        }
        return this._fallback.dispatch(action);
    }
}
