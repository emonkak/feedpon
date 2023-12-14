import { History } from 'history';
import { PureComponent } from 'react';

import connect from 'feedpon-utils/flux/react/connect';
import type { State } from 'feedpon-messaging';

interface NotAuthenticatedProps {
  children: React.ReactElement<any>;
  isAuthenticated: boolean;
  history: History;
}

class NotAuthenticated extends PureComponent<NotAuthenticatedProps> {
  override render() {
    const { children, isAuthenticated } = this.props;

    return !isAuthenticated ? children : null;
  }
}

export default connect(() => ({
  mapStateToProps: (state: State) => ({
    isAuthenticated: !!state.backend.token,
  }),
}))(NotAuthenticated);
