import CSSTransition from 'react-transition-group/CSSTransition';
import React, { PureComponent } from 'react';
import TransitionGroup from 'react-transition-group/TransitionGroup';

import NotificationComponent from 'view/modules/Notification';
import bindActions from 'utils/flux/bindActions';
import connect from 'utils/flux/react/connect';
import { Notification, State } from 'messaging/types';
import { dismissNotification } from 'messaging/notifications/actions';

interface NotificationListProps {
    notifications: Notification[];
    onDismissNotification: typeof dismissNotification;
}

class NotificationList extends PureComponent<NotificationListProps> {
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
        );
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
})(NotificationList);
