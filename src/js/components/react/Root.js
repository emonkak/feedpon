import Content from './Content'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import React from 'react'
import Sidebar from './Sidebar'
import appContextTypes from './appContextTypes'
import { GetCredential, GetCategoriesCache, GetSubscriptionsCache, GetUnreadCountsCache } from '../../constants/actionTypes'

export default class Root extends React.Component {
    static propTypes = {
        credential: React.PropTypes.object,
        content: React.PropTypes.element.isRequired,
        sidebar: React.PropTypes.element
    }

    static contextTypes = appContextTypes

    componentDidMount() {
        this.context.dispatch({ actionType: GetCredential })
        this.context.dispatch({ actionType: GetCategoriesCache })
        this.context.dispatch({ actionType: GetSubscriptionsCache })
        this.context.dispatch({ actionType: GetUnreadCountsCache })
    }

    handleAuthenticate() {
        this.context.dispatch({ actionType: Authenticate })
    }

    render() {
        return (
            <div>
                {this.renderHeader()}
                {this.renderMain()}
            </div>
        )
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
        )
    }

    renderMain() {
        const { credential, content, sidebar } = this.props
        if (credential) {
            return (
                <div>
                    {sidebar}
                    {content}
                </div>
            )
        } else {
            return (
                <div>
                    <button className="button button-default button-fill" onClick={::this.handleAuthenticate}>Authenticate</button>
                </div>
            )
        }
    }
}

Object.assign(Root.prototype, PureRenderMixin)
