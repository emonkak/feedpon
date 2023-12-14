import React, { PureComponent } from 'react';

import InstantNotificationContainer from '../containers/InstantNotificationContainer';
import NotificationList from '../containers/NotificationList';
import connect from 'feedpon-utils/flux/react/connect';
import type { State } from 'feedpon-messaging';

interface SingleLayoutProps {
  children?: React.ReactNode;
  isLoading: boolean;
}

class SingleLayout extends PureComponent<SingleLayoutProps> {
  override render() {
    const { children, isLoading } = this.props;

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
}

export default connect({
  mapStateToProps: (state: State) => ({
    isLoading: state.backend.isLoading,
  }),
})(SingleLayout);
