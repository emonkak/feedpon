import { History } from 'history';
import { PureComponent } from 'react';

import connect from 'utils/flux/react/connect';
import { State } from 'messaging/types';

interface NotAuthenticatedProps {
    children: React.ReactElement<any>;
    isAuthenticated: boolean;
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
        const { isAuthenticated, router } = props;

        if (isAuthenticated) {
            router.replace('/');
        }
    }

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
