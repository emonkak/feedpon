import CSSTransition from 'react-transition-group/CSSTransition';
import React, { PureComponent } from 'react';

import NotificationComponent from 'components/parts/Notification';
import bindActions from 'utils/flux/bindActions';
import connect from 'utils/flux/react/connect';
import { Notification, State } from 'messaging/types';
import { dismissNotification } from 'messaging/notifications/actions';

interface NotificationsProps {
    notifications: Notification[];
    onDismissNotification: typeof dismissNotification;
}

class Notifications extends PureComponent<NotificationsProps> {
    render() {
        const { onDismissNotification, notifications } = this.props;

        return (
            <CSSTransition
                classNames="notification"
                timeout={200}>
                <div
                    className="notification-list">
                    {notifications.map((notification) =>
                        <NotificationComponent
                            notification={notification}
                            key={notification.id}
                            onDismiss={onDismissNotification} />
                    )}
                </div>
            </CSSTransition>
        );
    }
}

export default connect({
    mapStateToProps: (state: State) => ({
        notifications: state.notifications.items
    }),
    mapDispatchToProps: bindActions({
        onDismissNotification: dismissNotification
    })
})(Notifications);
