import React, { useEffect } from 'react';
import { useHistory } from 'react-router';

import connect from 'feedpon-flux/react/connect';
import type { State } from 'feedpon-messaging';

interface AuthenticationRequiredProps {
  children: React.ReactElement<any>;
  isAuthenticated: boolean;
}

function AuthenticationRequired({
  children,
  isAuthenticated,
}: AuthenticationRequiredProps) {
  const history = useHistory();

  useEffect(() => {
    if (!isAuthenticated) {
      history.replace('/authentication');
    }
  }, [isAuthenticated]);

  return isAuthenticated ? children : null;
}

export default connect(() => ({
  mapStateToProps: (state: State) => ({
    isAuthenticated: !!state.backend.token,
  }),
}))(AuthenticationRequired);
