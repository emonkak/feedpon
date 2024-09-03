import React from 'react';
import CSSTransition from 'react-transition-group/CSSTransition';
import TransitionGroup from 'react-transition-group/TransitionGroup';

import { bindActions } from 'feedpon-flux';
import { useStore } from 'feedpon-flux/react';
import type { State } from 'feedpon-messaging';
import { dismissNotification } from 'feedpon-messaging/notifications';
import NotificationComponent from '../modules/Notification';

export interface NotificationListProps {}

export function NotificationList(_props: NotificationListProps) {
  const { notifications, onDismissNotification } = useStore({
    mapStateToProps: (state: State) => ({
      notifications: state.notifications.items,
    }),
    mapDispatchToProps: bindActions({
      onDismissNotification: dismissNotification,
    }),
  });

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
