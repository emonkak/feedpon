import React from 'react';

import { useStore } from 'feedpon-flux/react';
import type { State } from 'feedpon-messaging';

export interface NotAuthenticatedProps {
  children: React.ReactElement<any>;
}

export function NotAuthenticated({ children }: NotAuthenticatedProps) {
  const { isAuthenticated } = useStore({
    mapStateToProps: (state: State) => ({
      isAuthenticated: !!state.backend.token,
    }),
  });
  return !isAuthenticated ? children : null;
}
