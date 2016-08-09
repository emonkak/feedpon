import { AnyAction, AnyEvent, IActionDispatcher, IActionHandlerClass } from '../interfaces';
import { IContainer } from '../di/interfaces';
import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';
import { _throw } from 'rxjs/observable/throw';
import { mergeStatic } from 'rxjs/operator/merge';

export default class ActionDispatcher implements IActionDispatcher {
    private _handlerClassesByActionType: { [key: string]: IActionHandlerClass<AnyAction>[] } = {};

    private _fallback: IActionDispatcher = {
        dispatch(action: AnyAction): Observable<AnyEvent> {
            return _throw<AnyEvent>(new Error(`Can not handle the "${action.actionType}" action.`));
        }
    };

    constructor(private _container: IContainer) {
    }

    mount(handlerClass: IActionHandlerClass<AnyAction>): this {
        handlerClass.subscribedActionTypes.forEach(actionType => {
            if (this._handlerClassesByActionType[actionType]) {
                this._handlerClassesByActionType[actionType].push(handlerClass);
            } else {
                this._handlerClassesByActionType[actionType] = [handlerClass];
            }
        });
        return this;
    }

    fallback(fallback: IActionDispatcher): this {
        this._fallback = fallback;
        return this;
    }

    dispatch(action: AnyAction): Observable<AnyEvent> {
        const { actionType } = action;
        const handlerClasses = this._handlerClassesByActionType[actionType];
        if (handlerClasses) {
            const observables = handlerClasses.map(handlerClass => {
                return new Observable((observer: Subscriber<AnyEvent>) => {
                    const handler = this._container.get(handlerClass);
                    handler.handle(action, event => observer.next(event))
                        .then(() => observer.complete())
                        .catch(error => observer.error(error));
                });
            });
            return mergeStatic(...observables);
        }
        return this._fallback.dispatch(action);
    }
}
