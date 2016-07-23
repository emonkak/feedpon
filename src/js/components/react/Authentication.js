import PureRenderMixin from 'react-addons-pure-render-mixin';
import React from 'react';
import appContextTypes from '../../shared/components/react/appContextTypes';
import { Authenticate } from '../../constants/actionTypes';

export default class Authorization extends React.Component {
    static contextTypes = appContextTypes;

    render() {
        return (
            <div>
                <button className="button button-default button-fill" onClick={::this._handleAuthenticate}>Authenticate</button>
            </div>
        );
    }

    _handleAuthenticate() {
        this.context.dispatch({ actionType: Authenticate });
    }
}
