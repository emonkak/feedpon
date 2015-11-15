import Enumerable from 'linq'
import React from 'react'
import Subscription from './subscription'
import actionTypes from '../constants/actionTypes'
import classnames from 'classnames'

class SubscriptionCategory extends React.Component {
    static propTypes = {
        category: React.PropTypes.object.isRequired,
        subscriptions: React.PropTypes.array.isRequired,
        selected: React.PropTypes.bool.isRequired,
        selectedStreamId: React.PropTypes.string
    }

    static contextTypes = {
        dispatch: React.PropTypes.func.isRequired,
        getObservable: React.PropTypes.func.isRequired
    }

    constructor(props) {
        super(props)

        this.state = { expanded: false }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.props.category !== nextProps.category
            || this.props.subscriptions !== nextProps.subscriptions
            || this.props.selected !== nextProps.selected
            || this.props.selectedStreamId !== nextProps.selectedStreamId
            || this.state.expanded !== nextState
    }

    handleExpand(event) {
        event.preventDefault()

        this.setState(state => ({
            ...state,
            expanded: !state.expanded
        }))

        return false
    }

    handleSelect(event) {
        event.preventDefault()

        this.context.dispatch({
            actionType: actionTypes.SELECT_STREAM,
            streamId: this.props.category.id
        })

        return false
    }

    render() {
        const { category, subscriptions, selected } = this.props
        const { expanded } = this.state

        const unreadCount = Enumerable.from(subscriptions)
            .select(({ unreadCount }) => unreadCount.count)
            .sum()

        return (
            <li className="subscription-category-container">
                <div className={classnames('subscription-category', { 'is-selected': selected })}>
                    <a className={classnames('subscription-category-expand-arrow', { 'is-expanded': expanded })} onClick={::this.handleExpand}></a>
                    <a className="subscription-category-link" href="#" onClick={::this.handleSelect}>
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
                          selected={subscription.id === selectedStreamId} />
        )
    }
}

export default SubscriptionCategory
