import React, { PropTypes, PureComponent } from 'react';
import { Location } from 'history';

import bindAction from 'supports/bindAction';
import connect from 'supports/react/connect';
import { State } from 'messaging/types';
import { authenticate } from 'messaging/actions';

interface AuthenticationProps {
    location: Location;
    onAuthenticate: () => void;
}

class Authentication extends PureComponent<AuthenticationProps, {}> {
    static propTypes = {
        location: PropTypes.object.isRequired,
        onAuthenticate: PropTypes.func.isRequired
    };

    handleAuthenticate() {
        const { onAuthenticate } = this.props;

        onAuthenticate();
    }

    render() {
        // TODO: Layout
        return (
            <div className="container">
                <h1>Authentication</h1>

                <button
                    type="button"
                    className="button button-positive"
                    onClick={this.handleAuthenticate.bind(this)}>
                    Authenticate
                </button>
            </div>
        );
    }
}

export default connect(
    (state: State) => ({}),
    (dispatch) => ({
        onAuthenticate: bindAction(authenticate, dispatch)
    })
)(Authentication);
