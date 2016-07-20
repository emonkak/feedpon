import * as React from 'react';
import appContextTypes from './appContextTypes';
import { AnimationFrameScheduler } from 'rxjs/scheduler/AnimationFrameScheduler';
import { AnyAction, AnyEvent } from '../../interfaces';
import { ConnectableObservable } from 'rxjs/observable/ConnectableObservable';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

import 'rxjs/add/operator/multicast';
import 'rxjs/add/operator/publishBehavior';
import 'rxjs/add/operator/scan';
import 'rxjs/add/operator/subscribeOn';

type Props = {
    actions: Subject<AnyAction>,
    events: Observable<AnyEvent>
};

export default class AppContext extends React.Component<Props, {}> {
    static propTypes = {
        actions: React.PropTypes.instanceOf(Subject).isRequired,
        events: React.PropTypes.instanceOf(Observable).isRequired
    };

    static childContextTypes = appContextTypes;

    private _localEvents: Subject<AnyEvent>;

    private _events: ConnectableObservable<AnyEvent>;

    private _subscription: Subscription;

    componentWillMount() {
        this._localEvents = new Subject();
        this._events = this.props.events.multicast(this._localEvents);
        this._subscription = this._events.connect();
    }

    componentWillUnmount() {
        this._subscription.unsubscribe();
    }

    getChildContext() {
        const { actions } = this.props;
        const localEvents = this._localEvents;
        const events = this._events;
        return {
            createStore<TState>(reducer: (result: TState, value: AnyEvent) => TState, initialState: TState): Observable<TState> {
                return events
                    .scan(reducer, initialState)
                    .publishBehavior(initialState).refCount()
                    .subscribeOn(new AnimationFrameScheduler());
            },
            dispatch(action: AnyAction): void {
                actions.next(action);
            },
            dispatchEvent(event: AnyEvent): void {
                localEvents.next(event);
            }
        };
    }

    render() {
        return React.Children.only(this.props.children);
    }
}
