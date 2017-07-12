import React, { PureComponent } from 'react';
import { Location } from 'history';

import bindActions from 'utils/flux/bindActions';
import connect from 'utils/flux/react/connect';
import { authenticate } from 'messaging/backend/actions';

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
        return (
            <div className="container container-narrow">
                <div className="u-text-center u-margin-bottom-1">
                    <a href="https://github.com/emonkak/feedpon" target="_blank">
                        <img src="./img/logo.svg" width="278" height="100" />
                    </a>
                </div>
                <div className="u-text-muted u-text-center u-margin-bottom-1">
                    <p className="u-text-x-large">Please choose the backend service and sign in</p>
                </div>
                <div className="list-group u-margin-bottom-1">
                    <label className="list-group-item">
                        <div className="u-flex u-flex-align-items-center">
                            <input className="form-check" type="radio" name="backend" value="feedly" defaultChecked />
                            <i className="icon icon-48 icon-feedly u-margin-right-1" />
                            <span className="u-flex-grow-1 u-text-large">Feedly</span>
                        </div>
                    </label>
                </div>
                <button
                    className="button button-positive button-block button-large"
                    onClick={this.handleAuthenticate.bind(this)}>
                    Authenticate...
                </button>
            </div>
        );
    }
}

export default connect({
    mapDispatchToProps: bindActions({
        onAuthenticate: authenticate
    })
})(AuthenticationPage);
