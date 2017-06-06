import { History } from 'history';
import { PureComponent } from 'react';

import connect from 'utils/flux/react/connect';
import { Credential, State } from 'messaging/types';

interface AuthenticationRequiredProps {
    children: React.ReactElement<any>;
    credential: Credential;
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
        const { credential, router } = props;

        if (!credential.token) {
            router.replace('/authentication');
        }
    }

    render() {
        return this.props.children;
    }
}

export default connect(() => ({
    mapStateToProps: (state: State) => ({
        credential: state.credential
    })
}))(AuthenticationRequired);
