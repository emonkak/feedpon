import React from 'react'
import actionTypes from '../constants/actionTypes'
import classnames from 'classnames'

class Subscription extends React.Component {
    static propTypes = {
        subscription: React.PropTypes.object.isRequired,
        unreadcount: React.PropTypes.object.isRequired,
        selected: React.PropTypes.bool.isRequired
    }

    static contextTypes = {
        dispatch: React.PropTypes.func.isRequired,
        getObservable: React.PropTypes.func.isRequired
    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.props.subscription !== nextProps.subscription
            || this.props.unreadcount !== nextProps.unreadcount
            || this.props.selected !== nextProps.selected
    }

    handleSelect(event) {
        event.preventDefault()

        this.context.dispatch({
            actionType: actionTypes.SELECT_STREAM,
            streamId: this.props.subscription.id
        })

        return false
    }

    render() {
        const { subscription, unreadcount, selected } = this.props

        const icon = subscription.iconUrl != null
            ? <img className="subscription-icon" src={subscription.iconUrl} alt={subscription.title} width="16" height="16" />
            : <i className="subscription-icon subscription-icon-default" />

        return (
            <li className={classnames('subscription', { 'is-selected': selected })}>
                <a className="subscription-link" href="#" onClick={::this.handleSelect}>
                    {icon}
                    <span className="subscription-title">{subscription.title}</span>
                    <span className="subscription-unreadcount">{unreadcount.count}</span>
                </a>
            </li>
        )
    }
}

export default Subscription
