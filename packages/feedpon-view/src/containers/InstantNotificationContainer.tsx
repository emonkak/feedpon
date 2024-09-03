import React, { useEffect } from 'react';
import CSSTransition from 'react-transition-group/CSSTransition';
import TransitionGroup from 'react-transition-group/TransitionGroup';

import { bindActions } from 'feedpon-flux';
import { useStore } from 'feedpon-flux/react';
import type { State } from 'feedpon-messaging';
import { dismissInstantNotification } from 'feedpon-messaging/instantNotifications';
import InstantNotificationComponent from '../modules/InstantNotification';

export interface InstantNotificationContainerProps {}

export function InstantNotificationContainer({}: InstantNotificationContainerProps) {
  const { instantNotification, onDismissInstantNotification } = useStore({
    mapStateToProps: (state: State) => ({
      instantNotification: state.instantNotifications.item,
    }),
    mapDispatchToProps: bindActions({
      onDismissInstantNotification: dismissInstantNotification,
    }),
  });

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
