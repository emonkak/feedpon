import Header from './Header';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import React from 'react';
import Sidebar from './Sidebar';
import appContextTypes from '../../shared/components/react/appContextTypes';
import { Authenticate, History } from '../../constants/actionTypes';
import { GetCategoriesCache, GetSubscriptionsCache, GetUnreadCountsCache } from '../../constants/actionTypes';

export default class Layout extends React.Component {
    static contextTypes = appContextTypes;

    componentWillMount() {
        this._dispatchActionFromState(this.props.state);
    }

    componentWillUpdate(nextProps) {
        if (this.props.state !== nextProps.state) {
            this._dispatchActionFromState(nextProps.state);
        }
    }

    render() {
        return (
            <div>
                <header className="l-header">
                    <Header {...this.props} />
                </header>
                <aside className="l-sidebar">
                    <Sidebar {...this.props} />
                </aside>
                <main className="l-main">
                    {this.props.children}
                </main>
            </div>
        );
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
            this.context.dispatch({ actionType: GetCategoriesCache });
            this.context.dispatch({ actionType: GetSubscriptionsCache });
            this.context.dispatch({ actionType: GetUnreadCountsCache });
            break;
        }
    }
}

Object.assign(Root.prototype, PureRenderMixin);
