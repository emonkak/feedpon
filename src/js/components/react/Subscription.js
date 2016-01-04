import PureRenderMixin from 'react-addons-pure-render-mixin'
import React from 'react'
import appContextTypes from './appContextTypes'
import classnames from 'classnames'
import { GetContents, SelectStream } from '../../constants/actionTypes'

export default class Subscription extends React.Component {
    static propTypes = {
        subscription: React.PropTypes.object.isRequired,
        unreadCount: React.PropTypes.object.isRequired,
        selected: React.PropTypes.bool.isRequired
    }

    static contextTypes = appContextTypes

    handleSelect(event) {
        event.preventDefault()

        this.context.dispatch({
            actionType: SelectStream,
            streamId: this.props.subscription.id
        })
        this.context.dispatch({
            actionType: GetContents,
            payload: {
                streamId: this.props.category.id
            }
        })

        return false
    }

    render() {
        const { subscription, unreadCount, selected } = this.props

        const icon = subscription.iconUrl != null
            ? <img className="subscription-icon" src={subscription.iconUrl} alt={subscription.title} width="16" height="16" />
            : <i className="subscription-icon subscription-icon-default" />

        return (
            <li className={classnames('subscription', { 'is-selected': selected })}>
                <a className="subscription-link" href="#" onClick={::this.handleSelect}>
                    {icon}
                    <span className="subscription-title">{subscription.title}</span>
                    <span className="subscription-unread-count">{unreadCount.count}</span>
                </a>
            </li>
        )
    }
}

Object.assign(Subscription.prototype, PureRenderMixin)
