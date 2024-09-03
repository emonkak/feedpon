import React from 'react';

import { useStore } from 'feedpon-flux/react';
import type { State } from 'feedpon-messaging';
import { InstantNotificationContainer } from '../containers/InstantNotificationContainer';
import { NotificationList } from '../containers/NotificationList';

export interface SingleLayoutProps {
  children?: React.ReactNode;
}

export function SingleLayout({ children }: SingleLayoutProps) {
  const { isLoading } = useStore({
    mapStateToProps: (state: State) => ({
      isLoading: state.backend.isLoading,
    }),
  });

  return (
    <>
      <div className="l-main">
        <div className="l-notifications">
          <NotificationList />
        </div>
        <div className="l-instant-notifications">
          <InstantNotificationContainer />
        </div>
        {children}
      </div>
      <div className="l-backdrop">
        {isLoading ? (
          <i className="icon icon-48 icon-spinner animation-rotating" />
        ) : null}
      </div>
    </>
  );
}
