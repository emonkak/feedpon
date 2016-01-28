import PureRenderMixin from 'react-addons-pure-render-mixin'
import React from 'react'
import Subscription from './Subscription'
import appContextTypes from './appContextTypes'
import classnames from 'classnames'
import { History } from '../../constants/actionTypes'

export default class SubscriptionCategory extends React.Component {
    static propTypes = {
        category: React.PropTypes.object.isRequired,
        subscriptions: React.PropTypes.array.isRequired,
        selectedStreamId: React.PropTypes.string
    }

    static contextTypes = appContextTypes

    constructor(props) {
        super(props)

        this.state = { expanded: false }
    }

    handleExpand(event) {
        event.preventDefault()

        this.setState(state => ({
            ...state,
            expanded: !state.expanded
        }))

        return false
    }

    handleSelectStream() {
        const { category } = this.props

        this.context.dispatch({
            actionType: History.Push,
            path: `/streams/${encodeURIComponent(category.id)}`
        })
    }

    render() {
        const { category, subscriptions, selectedStreamId } = this.props
        const { expanded } = this.state

        const unreadCount = subscriptions
            .reduce((sum, { unreadCount }) => sum + unreadCount.count, 0)

        return (
            <li className="subscription-category-container">
                <div className={classnames('subscription-category', { 'is-selected': category.id === selectedStreamId })}>
                    <a className={classnames('subscription-category-expand-arrow', { 'is-expanded': expanded })} onClick={::this.handleExpand}></a>
                    <a className="subscription-category-link" onClick={::this.handleSelectStream}>
                        <span className="subscription-category-label">{category.label}</span>
                        <span className="subscription-category-unread-count">{unreadCount}</span>
                    </a>
                </div>
                <ul className={classnames('subscription-list', { 'is-expanded': expanded })}>
                    {subscriptions.map(::this.renderSubscription)}
                </ul>
            </li>
        )
    }

    renderSubscription({ subscription, unreadCount }) {
        const { selectedStreamId } = this.props

        return (
            <Subscription key={subscription.id}
                          subscription={subscription}
                          unreadCount={unreadCount}
                          isSelected={subscription.id === selectedStreamId} />
        )
    }
}

Object.assign(SubscriptionCategory.prototype, PureRenderMixin)
