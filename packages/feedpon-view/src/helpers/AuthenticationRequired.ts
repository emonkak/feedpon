import React, { useEffect } from 'react';
import { useHistory } from 'react-router';

import { useStore } from 'feedpon-flux/react';
import type { State } from 'feedpon-messaging';

export interface AuthenticationRequiredProps {
  children: React.ReactElement;
}

export function AuthenticationRequired({
  children,
}: AuthenticationRequiredProps) {
  const { isAuthenticated } = useStore({
    mapStateToProps: (state: State) => ({
      isAuthenticated: !!state.backend.token,
    }),
  });
  const history = useHistory();

  useEffect(() => {
    if (!isAuthenticated) {
      history.replace('/authentication');
    }
  }, [isAuthenticated]);

  return isAuthenticated ? children : null;
}
