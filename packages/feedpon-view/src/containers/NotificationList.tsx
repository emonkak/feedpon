import CSSTransition from 'react-transition-group/CSSTransition';
import React from 'react';
import TransitionGroup from 'react-transition-group/TransitionGroup';

import NotificationComponent from '../modules/Notification';
import { bindActions } from 'feedpon-flux';
import connect from 'feedpon-flux/react/connect';
import { Notification, State } from 'feedpon-messaging';
import { dismissNotification } from 'feedpon-messaging/notifications';

interface NotificationListProps {
  notifications: Notification[];
  onDismissNotification: typeof dismissNotification;
}

function NotificationList({
  notifications,
  onDismissNotification,
}: NotificationListProps) {
  return (
    <TransitionGroup className="notification-list">
      {notifications.map((notification) => (
        <CSSTransition
          key={notification.id}
          classNames="notification"
          timeout={200}
        >
          <div>
            <NotificationComponent
              notification={notification}
              onDismiss={onDismissNotification}
            />
          </div>
        </CSSTransition>
      ))}
    </TransitionGroup>
  );
}

export default connect(NotificationList, {
  mapStateToProps: (state: State) => ({
    notifications: state.notifications.items,
  }),
  mapDispatchToProps: bindActions({
    onDismissNotification: dismissNotification,
  }),
});
