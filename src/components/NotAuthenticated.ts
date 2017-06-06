import { History } from 'history';
import { PureComponent } from 'react';

import connect from 'utils/flux/react/connect';
import { Credential, State } from 'messaging/types';

interface NotAuthenticatedProps {
    children: React.ReactElement<any>;
    credential: Credential;
    router: History;
}

class NotAuthenticated extends PureComponent<NotAuthenticatedProps, {}> {
    componentWillMount() {
        this.update(this.props);
    }

    componentWillUpdate(nextProps: NotAuthenticatedProps, nextState: {}) {
        this.update(nextProps);
    }

    update(props: NotAuthenticatedProps) {
        const { credential, router } = props;

        if (credential.token) {
            router.replace('/');
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
}))(NotAuthenticated);
