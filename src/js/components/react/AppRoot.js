import Main from './Main'
import React from 'react'
import Sidebar from './Sidebar'
import { GetCredential, GetCategoriesCache, GetSubscriptionsCache, GetUnreadCountsCache } from '../../constants/actionTypes'

export default class AppRoot extends React.Component {
    static propTypes = {
        subscriptions: React.PropTypes.array.isRequired,
        categories: React.PropTypes.array.isRequired,
        unreadCounts: React.PropTypes.array.isRequired,
        contents: React.PropTypes.object,
        selectedStreamId: React.PropTypes.string,
        credential: React.PropTypes.object,
    }

    static contextTypes = {
        dispatch: React.PropTypes.func.isRequired
    }

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
                <header className="l-header">
                    <div className="notification"></div>
                    <nav className="nav">
                        <ul>
                        </ul>
                    </nav>
                </header>
                {this.renderMain()}
            </div>
        )
    }

    renderMain() {
        const { subscriptions, unreadCounts, categories, contents, credential, selectedStreamId } = this.props

        if (credential) {
            return (
                <div>
                    <Sidebar subscriptions={subscriptions} unreadCounts={unreadCounts} categories={categories} credential={credential} selectedStreamId={selectedStreamId} />
                    <Main contents={contents} />
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
