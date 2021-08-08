import { History } from 'history';
import { PureComponent } from 'react';

import connect from 'utils/flux/react/connect';
import { State } from 'messaging/types';

interface AuthenticationRequiredProps {
    children: React.ReactElement<any>;
    isAuthenticated: boolean;
    history: History;
}

class AuthenticationRequired extends PureComponent<AuthenticationRequiredProps> {
    componentDidMount() {
        this._refresh(this.props);
    }

    componentDidUpdate(prevProps: AuthenticationRequiredProps, prevState: {}) {
        this._refresh(this.props);
    }

    render() {
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
