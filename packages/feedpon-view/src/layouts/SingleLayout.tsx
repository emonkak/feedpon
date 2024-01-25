import React from 'react';

import InstantNotificationContainer from '../containers/InstantNotificationContainer';
import NotificationList from '../containers/NotificationList';
import connect from 'feedpon-flux/react/connect';
import type { State } from 'feedpon-messaging';

interface SingleLayoutProps {
  children?: React.ReactNode;
  isLoading: boolean;
}

function SingleLayout({ children, isLoading }: SingleLayoutProps) {
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

export default connect(SingleLayout, {
  mapStateToProps: (state: State) => ({
    isLoading: state.backend.isLoading,
  }),
});
