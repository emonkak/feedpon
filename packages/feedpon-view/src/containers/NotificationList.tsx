import React from 'react';
import CSSTransition from 'react-transition-group/CSSTransition';
import TransitionGroup from 'react-transition-group/TransitionGroup';

import { bindActions } from 'feedpon-flux';
import connect from 'feedpon-flux/react/connect';
import type { Notification, State } from 'feedpon-messaging';
import { dismissNotification } from 'feedpon-messaging/notifications';
import NotificationComponent from '../modules/Notification';

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
