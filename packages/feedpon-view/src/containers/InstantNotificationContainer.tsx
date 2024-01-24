import CSSTransition from 'react-transition-group/CSSTransition';
import React, { useEffect } from 'react';
import TransitionGroup from 'react-transition-group/TransitionGroup';

import InstantNotificationComponent from '../modules/InstantNotification';
import { bindActions } from 'feedpon-flux';
import connect from 'feedpon-flux/react/connect';
import type { InstantNotification, State } from 'feedpon-messaging';
import { dismissInstantNotification } from 'feedpon-messaging/instantNotifications';

interface InstantNotificationContainerProps {
  instantNotification: InstantNotification | null;
  onDismissInstantNotification: typeof dismissInstantNotification;
}

function InstantNotificationContainer({
  instantNotification,
  onDismissInstantNotification,
}: InstantNotificationContainerProps) {
  useEffect(() => {
    let timer: number | null = null;
    if (instantNotification && instantNotification.dismissAfter >= 0) {
      timer = window.setTimeout(() => {
        onDismissInstantNotification();
        timer = null;
      }, instantNotification.dismissAfter);
    }
    return () => {
      if (timer !== null) {
        clearTimeout(timer);
      }
    };
  }, [onDismissInstantNotification, instantNotification]);

  return (
    <TransitionGroup>
      {instantNotification && (
        <CSSTransition classNames="instant-notification" timeout={200}>
          <div>
            <InstantNotificationComponent
              instantNotification={instantNotification}
            />
          </div>
        </CSSTransition>
      )}
    </TransitionGroup>
  );
}

export default connect({
  mapStateToProps: (state: State) => ({
    instantNotification: state.instantNotifications.item,
  }),
  mapDispatchToProps: bindActions({
    onDismissInstantNotification: dismissInstantNotification,
  }),
})(InstantNotificationContainer);
