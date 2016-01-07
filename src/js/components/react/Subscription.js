import PureRenderMixin from 'react-addons-pure-render-mixin'
import React from 'react'
import appContextTypes from './appContextTypes'
import classnames from 'classnames'
import { GetContents } from '../../constants/actionTypes'
import { Link } from 'react-router'

export default class Subscription extends React.Component {
    static propTypes = {
        subscription: React.PropTypes.object.isRequired,
        unreadCount: React.PropTypes.object.isRequired,
        isSelected: React.PropTypes.bool.isRequired
    }

    static contextTypes = appContextTypes

    render() {
        const { subscription, unreadCount, isSelected } = this.props

        const icon = subscription.iconUrl != null
            ? <img className="subscription-icon" src={subscription.iconUrl} alt={subscription.title} width="16" height="16" />
            : <i className="subscription-icon subscription-icon-default" />

        return (
            <li className={classnames('subscription', { 'is-selected': isSelected })}>
                <Link className="subscription-link" to={`streams/${encodeURIComponent(subscription.id)}`}>
                    {icon}
                    <span className="subscription-title">{subscription.title}</span>
                    <span className="subscription-unread-count">{unreadCount.count}</span>
                </Link>
            </li>
        )
    }
}

Object.assign(Subscription.prototype, PureRenderMixin)
