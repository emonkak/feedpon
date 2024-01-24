import React from 'react';

import connect from 'feedpon-flux/react/connect';
import type { State } from 'feedpon-messaging';

interface NotAuthenticatedProps {
  children: React.ReactElement<any>;
  isAuthenticated: boolean;
}

function NotAuthenticated({
  children,
  isAuthenticated,
}: NotAuthenticatedProps) {
  return !isAuthenticated ? children : null;
}

export default connect(() => ({
  mapStateToProps: (state: State) => ({
    isAuthenticated: !!state.backend.token,
  }),
}))(NotAuthenticated);
