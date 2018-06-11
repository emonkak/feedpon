import { History } from 'history';
import { PureComponent } from 'react';

import connect from 'utils/flux/react/connect';
import { State } from 'messaging/types';

interface NotAuthenticatedProps {
    children: React.ReactElement<any>;
    isAuthenticated: boolean;
    router: History;
}

class NotAuthenticated extends PureComponent<NotAuthenticatedProps> {
    componentDidMount() {
        this._refresh();
    }

    componentDidUpdate(prevProps: NotAuthenticatedProps, prevState: {}) {
        this._refresh();
    }

    render() {
        const { children, isAuthenticated } = this.props;

        return !isAuthenticated ? children : null;
    }

    private _refresh() {
        const { isAuthenticated, router } = this.props;

        if (isAuthenticated) {
            router.replace('/');
        }
    }
}

export default connect(() => ({
    mapStateToProps: (state: State) => ({
        isAuthenticated: !!state.backend.token
    })
}))(NotAuthenticated);
