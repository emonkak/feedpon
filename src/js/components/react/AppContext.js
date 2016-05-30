import React from 'react';
import appContextTypes from './appContextTypes';
import { AnimationFrameScheduler } from 'rxjs/scheduler/AnimationFrameScheduler';
import { DispatchEvent } from '../../constants/actionTypes';
import { concat } from 'rxjs/operator/concat';
import { publish } from 'rxjs/operator/publish';
import { publishBehavior } from 'rxjs/operator/publishBehavior';
import { scan } from 'rxjs/operator/scan';
import { startWith } from 'rxjs/operator/startWith';
import { subscribeOn } from 'rxjs/operator/subscribeOn';

export default class AppContext extends React.Component {
    static propTypes = {
        actionSubject: React.PropTypes.object.isRequired,
        eventStream: React.PropTypes.object.isRequired
    };

    static childContextTypes = appContextTypes;

    componentWillMount() {
        this._eventStream = this.props.eventStream::publish();
        this._subscription = this._eventStream.connect();
    }

    componentWillUnmount() {
        this._subscription.dispose();
    }

    getChildContext() {
        const { actionSubject } = this.props;
        const eventStream = this._eventStream;
        return {
            createStore(reducer, initialState) {
                return eventStream
                    ::scan(reducer, initialState)
                    ::publishBehavior(initialState).refCount()
                    ::subscribeOn(new AnimationFrameScheduler());
            },
            dispatch(action) {
                actionSubject.next(action);
            },
            dispatchEvent(event) {
                actionSubject.next({ actionType: DispatchEvent, event });
            }
        };
    }

    render() {
        return React.Children.only(this.props.children);
    }
}
