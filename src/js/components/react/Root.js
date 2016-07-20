import PureRenderMixin from 'react-addons-pure-render-mixin';
import React from 'react';
import appContextTypes from '../../shared/components/react/appContextTypes';
import { Authenticate } from '../../constants/actionTypes';

export default class Root extends React.Component {
    static propTypes = {
        credential: React.PropTypes.object,
        content: React.PropTypes.element.isRequired,
        sidebar: React.PropTypes.element
    };

    static contextTypes = appContextTypes;

    handleAuthenticate() {
        this.context.dispatch({ actionType: Authenticate });
    }

    render() {
        return (
            <div>
                {this.renderHeader()}
                {this.renderMain()}
            </div>
        );
    }

    renderHeader() {
        return (
            <header className="l-header">
                <div className="notification"></div>
                <nav className="nav">
                    <ul>
                    </ul>
                </nav>
            </header>
        );
    }

    renderMain() {
        const { credential, content, sidebar } = this.props;
        if (credential) {
            return (
                <div>
                    {sidebar}
                    {content}
                </div>
            );
        } else {
            return (
                <div>
                    <button className="button button-default button-fill" onClick={::this.handleAuthenticate}>Authenticate</button>
                </div>
            );
        }
    }
}

Object.assign(Root.prototype, PureRenderMixin);
