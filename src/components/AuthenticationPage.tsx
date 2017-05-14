import React, { PureComponent } from 'react';
import { Location } from 'history';

import bindActions from 'utils/flux/bindActions';
import connect from 'utils/flux/react/connect';
import { State } from 'messaging/types';
import { authenticate } from 'messaging/credential/actions';

interface AuthenticationProps {
    location: Location;
    onAuthenticate: typeof authenticate;
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
                <h1 className="display-1">Authentication</h1>

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
    (dispatch) => bindActions({
        onAuthenticate: authenticate
    }, dispatch)
)(AuthenticationPage);
