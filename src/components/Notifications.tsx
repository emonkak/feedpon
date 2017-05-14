import CSSTransitionGroup from 'react-addons-css-transition-group';
import React, { PureComponent } from 'react';
import classnames from 'classnames';

import NotificationComponent from 'components/parts/Notification';
import bindActions from 'utils/flux/bindActions';
import connect from 'utils/flux/react/connect';
import { Notification, State } from 'messaging/types';
import { dismissNotification } from 'messaging/notification/actions';

interface NotificationsProps {
    isReversed?: boolean;
    notifications: Notification[];
    onDismissNotification: typeof dismissNotification;
}

class Notifications extends PureComponent<NotificationsProps, {}> {
    static defaultProps = {
        isReversed: false
    };

    render() {
        const { onDismissNotification, isReversed, notifications } = this.props;

        return (
            <CSSTransitionGroup
                component="div"
                className={classnames('notifications', {
                    'notifications-reversed': isReversed
                })}
                transitionName="notification"
                transitionEnterTimeout={200}
                transitionLeaveTimeout={200}>
                {notifications.map((notification) =>
                    <NotificationComponent
                        notification={notification}
                        isReversed={isReversed}
                        key={notification.id}
                        onClose={onDismissNotification} />
                )}
            </CSSTransitionGroup>
        );
    }
}

export default connect(
    (state: State) => ({
        notifications: state.notifications
    }),
    (dispatch) => bindActions({
        onDismissNotification: dismissNotification
    }, dispatch)
)(Notifications);
