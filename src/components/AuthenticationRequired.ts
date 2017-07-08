import { History } from 'history';
import { PureComponent } from 'react';

import connect from 'utils/flux/react/connect';
import { State } from 'messaging/types';

interface AuthenticationRequiredProps {
    children: React.ReactElement<any>;
    isAuthenticated: boolean;
    router: History;
}

class AuthenticationRequired extends PureComponent<AuthenticationRequiredProps, {}> {
    componentWillMount() {
        this.update(this.props);
    }

    componentWillUpdate(nextProps: AuthenticationRequiredProps, nextState: {}) {
        this.update(nextProps);
    }

    update(props: AuthenticationRequiredProps) {
        const { isAuthenticated, router } = props;

        if (!isAuthenticated) {
            router.replace('/authentication');
        }
    }

    render() {
        const { children, isAuthenticated } = this.props;

        return isAuthenticated ? children : null;
    }
}

export default connect(() => ({
    mapStateToProps: (state: State) => ({
        isAuthenticated: !!state.backend.token
    })
}))(AuthenticationRequired);
