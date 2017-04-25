import { History } from 'history';
import { PureComponent } from 'react';

import connect from 'utils/react/connect';
import { Credential, State } from 'messaging/types';

interface NotAuthenticatedProps {
    children: React.ReactElement<any>,
    credential: Credential,
    router: History
}

class NotAuthenticated extends PureComponent<NotAuthenticatedProps, {}> {
    componentWillMount() {
        this.update();
    }

    componentWillUpdate() {
        this.update();
    }

    update() {
        const { credential, router } = this.props;

        if (credential) {
            router.replace('/');
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
)(NotAuthenticated);
