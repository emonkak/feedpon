import CSSTransitionGroup from 'react-addons-css-transition-group';
import React, { PureComponent } from 'react';
import classnames from 'classnames';

import Notification from 'components/parts/Notification';
import bindAction from 'utils/bindAction';
import connect from 'utils/react/connect';
import { Notification as NotificationInterface, State } from 'messaging/types';
import { dismissNotification } from 'messaging/notification/actions';

interface NotificationsProps {
    isReversed?: boolean;
    notifications: NotificationInterface[];
    onDismissNotification: (id: number) => void;
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
                    <Notification
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
    (dispatch) => ({
        onDismissNotification: bindAction(dismissNotification, dispatch)
    })
)(Notifications);
