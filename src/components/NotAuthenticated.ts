import { PropTypes, PureComponent } from 'react';
import { routerShape } from 'react-router/lib/PropTypes';

import connect from 'supports/react/connect';
import { State } from 'messaging/types';

@connect((state: State) => {
    return {
        credential: state.credential
    };
})
export default class NotAuthenticated extends PureComponent<any, any> {
    static propTypes = {
        children: PropTypes.element.isRequired,
        credential: PropTypes.shape({
            authorizedAt: PropTypes.string.isRequired,
            token: PropTypes.object.isRequired
        }),
        router: routerShape
    };

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

