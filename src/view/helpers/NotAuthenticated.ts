import { History } from 'history';
import { PureComponent } from 'react';

import connect from 'utils/flux/react/connect';
import { State } from 'messaging/types';

interface NotAuthenticatedProps {
    children: React.ReactElement<any>;
    isAuthenticated: boolean;
    history: History;
}

class NotAuthenticated extends PureComponent<NotAuthenticatedProps> {
    render() {
        const { children, isAuthenticated } = this.props;

        return !isAuthenticated ? children : null;
    }
}

export default connect(() => ({
    mapStateToProps: (state: State) => ({
        isAuthenticated: !!state.backend.token
    })
}))(NotAuthenticated);
