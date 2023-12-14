import { History } from 'history';
import { PureComponent } from 'react';

import connect from 'feedpon-utils/flux/react/connect';
import type { State } from 'feedpon-messaging';

interface AuthenticationRequiredProps {
    children: React.ReactElement<any>;
    isAuthenticated: boolean;
    history: History;
}

class AuthenticationRequired extends PureComponent<AuthenticationRequiredProps> {
    override componentDidMount() {
        this._refresh(this.props);
    }

    override componentDidUpdate(_prevProps: AuthenticationRequiredProps, _prevState: {}) {
        this._refresh(this.props);
    }

    override render() {
        const { children, isAuthenticated } = this.props;

        return isAuthenticated ? children : null;
    }

    private _refresh(props: AuthenticationRequiredProps) {
        const { isAuthenticated, history } = props;

        if (!isAuthenticated) {
            history.replace('/authentication');
        }
    }
}

export default connect(() => ({
    mapStateToProps: (state: State) => ({
        isAuthenticated: !!state.backend.token
    })
}))(AuthenticationRequired);
