import { History } from 'history';
import { PropTypes, PureComponent } from 'react';

import connect from 'supports/react/connect';
import { Credential, State } from 'messaging/types';

interface Props {
    children: React.ReactElement<any>;
    credential: Credential;
    router: History;
}

class AuthenticationRequired extends PureComponent<Props, {}> {
    static propTypes = {
        children: PropTypes.element.isRequired,
        credential: PropTypes.object,
        router: PropTypes.object.isRequired
    };

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
