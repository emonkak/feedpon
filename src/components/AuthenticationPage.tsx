import React, { PureComponent } from 'react';
import { Location } from 'history';

import bindAction from 'utils/bindAction';
import connect from 'utils/react/connect';
import { State } from 'messaging/types';
import { authenticate } from 'messaging/credential/actions';

interface AuthenticationProps {
    location: Location;
    onAuthenticate: () => void;
}

class AuthenticationPage extends PureComponent<AuthenticationProps, {}> {
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
)(AuthenticationPage);
