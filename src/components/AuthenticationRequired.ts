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
        this.update();
    }

    componentWillUpdate() {
        this.update();
    }

    update() {
        const { credential, router } = this.props;

        if (!credential) {
            router.replace('/authentication');
        }
    }

    render() {
        return this.props.children;
    }
}

export default connect(
    (state: State) => ({
        credential: state.credential
    })
)(AuthenticationRequired);
