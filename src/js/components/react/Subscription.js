import PureRenderMixin from 'react-addons-pure-render-mixin'
import React from 'react'
import appContextTypes from './appContextTypes'
import classnames from 'classnames'
import { History } from '../../constants/actionTypes'

export default class Subscription extends React.Component {
    static propTypes = {
        subscription: React.PropTypes.object.isRequired,
        unreadCount: React.PropTypes.object.isRequired,
        isSelected: React.PropTypes.bool.isRequired
    }

    static contextTypes = appContextTypes

    handleSelectStream() {
        const { subscription } = this.props

        this.context.dispatch({
            actionType: History.Push,
            path: `streams/${encodeURIComponent(subscription.id)}`
        })
    }

    render() {
        const { subscription, unreadCount, isSelected } = this.props

        const icon = subscription.iconUrl != null
            ? <img className="subscription-icon" src={subscription.iconUrl} alt={subscription.title} width="16" height="16" />
            : <i className="subscription-icon subscription-icon-default" />

        return (
            <li className={classnames('subscription', { 'is-selected': isSelected })}>
                <a className="subscription-link" onClick={::this.handleSelectStream}>
                    {icon}
                    <span className="subscription-title">{subscription.title}</span>
                    <span className="subscription-unread-count">{unreadCount.count}</span>
                </a>
            </li>
        )
    }
}

Object.assign(Subscription.prototype, PureRenderMixin)
