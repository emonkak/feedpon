import PureRenderMixin from 'react-addons-pure-render-mixin';
import React from 'react';
import appContextTypes from '../../shared/components/react/appContextTypes';
import { History } from '../../constants/actionTypes';

export default class Boot extends React.Component {
    static contextTypes = appContextTypes;

    static propTypes = {
        state: React.PropTypes.string.isRequired
    };

    componentWillMount() {
        this._dispatchActionFromState(this.props.state);
    }

    componentWillReceiveProps(nextProps) {
        this._dispatchActionFromState(nextProps.state);
    }

    render() {
        return (<div>Booting...</div>);
    }

    _dispatchActionFromState(state) {
        switch (state) {
        case 'AUTHENTICATION_REQUIRED':
            this.context.dispatch({
                actionType: History.Replace,
                path: '/authentication'
            });
            break;

        case 'AUTHENTICATED':
            this.context.dispatch({
                actionType: History.Replace,
                path: '/dashboard'
            });
            break;
        }
    }
}

Object.assign(Boot.prototype, PureRenderMixin);
