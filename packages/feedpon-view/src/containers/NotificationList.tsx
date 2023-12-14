import CSSTransition from 'react-transition-group/CSSTransition';
import React, { PureComponent } from 'react';
import TransitionGroup from 'react-transition-group/TransitionGroup';

import NotificationComponent from '../modules/Notification';
import bindActions from 'feedpon-utils/flux/bindActions';
import connect from 'feedpon-utils/flux/react/connect';
import { Notification, State } from 'feedpon-messaging';
import { dismissNotification } from 'feedpon-messaging/notifications';

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
        timeout={200}
      >
        <div>
          <NotificationComponent
            notification={notification}
            onDismiss={onDismissNotification}
          />
        </div>
      </CSSTransition>
    );
  }

  override render() {
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
    notifications: state.notifications.items,
  }),
  mapDispatchToProps: bindActions({
    onDismissNotification: dismissNotification,
  }),
})(NotificationList);
