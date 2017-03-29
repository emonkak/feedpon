import React, { PropTypes, PureComponent } from 'react';
import { locationShape } from 'react-router/lib/PropTypes';

import connect from 'supports/react/connect';
import { State } from 'messaging/types';
import { authenticate } from 'messaging/actions';

@connect((state: State) => ({
    environment: state.environment
}))
export default class Authentication extends PureComponent<any, any> {
    static propTypes = {
        environment: PropTypes.shape({
            endpoint: PropTypes.string.isRequired,
            clientId: PropTypes.string.isRequired,
            clientSecret: PropTypes.string.isRequired,
            scope: PropTypes.string.isRequired,
            redirectUri: PropTypes.string.isRequired
        }),
        dispatch: PropTypes.func.isRequired,
        location: locationShape
    };

    handleAuthenticate() {
        const { dispatch, environment } = this.props;

        dispatch(authenticate(environment));
    }

    render() {

        return (
            <div className="container">
                <h1>Authentication</h1>

                <button
                    className="button button-positive"
                    onClick={this.handleAuthenticate.bind(this)}
                    type="button">
                    Authenticate
                </button>
            </div>
        );
    }
}
