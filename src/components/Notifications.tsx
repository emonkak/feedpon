import CSSTransition from 'react-transition-group/CSSTransition';
import React, { PureComponent } from 'react';
import TransitionGroup from 'react-transition-group/TransitionGroup';

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
    renderItem(notification: Notification) {
        const { onDismissNotification } = this.props;

        return (
            <CSSTransition
                key={notification.id}
                classNames="notification"
                timeout={200}>
                <div>
                    <NotificationComponent
                        notification={notification}
                        onDismiss={onDismissNotification} />
                </div>
            </CSSTransition>
        )
    }

    render() {
        const { notifications } = this.props;

        return (
            <TransitionGroup className="notification-list">
                {notifications.map(this.renderItem, this)}
            </TransitionGroup>
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
