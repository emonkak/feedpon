import CSSTransition from 'react-transition-group/CSSTransition';
import React, { PureComponent } from 'react';
import TransitionGroup from 'react-transition-group/TransitionGroup';

import InstantNotificationComponent from 'view/modules/InstantNotification';
import bindActions from 'utils/flux/bindActions';
import connect from 'utils/flux/react/connect';
import { InstantNotification, State } from 'messaging/types';
import { dismissInstantNotification } from 'messaging/instantNotifications/actions';

interface InstantNotificationContainerProps {
    instantNotification: InstantNotification | null;
    onDismissInstantNotification: typeof dismissInstantNotification;
}

class InstantNotificationContainer extends PureComponent<InstantNotificationContainerProps> {
    private _timer: number | null = null;

    componentDidMount() {
        const { instantNotification } = this.props;

        if (instantNotification) {
            this._startTimer(instantNotification);
        }
    }

    componentDidUpdate(prevProps: InstantNotificationContainerProps, prevState: {}) {
        const { instantNotification } = this.props;

        if (instantNotification
            && instantNotification !== prevProps.instantNotification) {
            this._restartTimer(instantNotification);
        }
    }

    componentWillUnmount() {
        this._stopTimer();
    }

    render() {
        const { instantNotification } = this.props;

        return (
            <TransitionGroup>
                {instantNotification &&
                    <CSSTransition
                        classNames="instant-notification"
                        timeout={200}>
                        <div>
                            <InstantNotificationComponent
                                instantNotification={instantNotification} />
                        </div>
                    </CSSTransition>}
            </TransitionGroup>
        );
    }

    private _startTimer(instantNotification: InstantNotification) {
        if (instantNotification.dismissAfter > 0) {
            const { onDismissInstantNotification } = this.props;

            this._timer = window.setTimeout(() => {
                onDismissInstantNotification();
                this._timer = null;
            }, instantNotification.dismissAfter);
        }
    }

    private _restartTimer(instantNotification: InstantNotification) {
        this._stopTimer();
        this._startTimer(instantNotification);
    }

    private _stopTimer() {
        if (this._timer !== null) {
            window.clearTimeout(this._timer);
            this._timer = null;
        }
    }
}

export default connect({
    mapStateToProps: (state: State) => ({
        instantNotification: state.instantNotifications.item
    }),
    mapDispatchToProps: bindActions({
        onDismissInstantNotification: dismissInstantNotification
    })
})(InstantNotificationContainer);
