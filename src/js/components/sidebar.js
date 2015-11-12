import Enumerable from 'linq'
import React from 'react'
import actionTypes from '../constants/actionTypes'
import eventTypes from '../constants/eventTypes'

class Sidebar extends React.Component {
    static propTypes = {
        subscriptions: React.PropTypes.array.isRequired,
        unreadcounts: React.PropTypes.array.isRequired,
        categories: React.PropTypes.array.isRequired
    }

    render() {
        const { subscriptions, unreadcounts, categories } = this.props

        const uncategorized = { label: 'Uncategorized', id: null }
        const subscriptionItems = Enumerable.from(subscriptions)
            .join(
                Enumerable.from(unreadcounts),
                subscription => subscription.id,
                unreadcount => unreadcount.id,
                (subscription, unreadcount) => ({ subscription, unreadcount })
            )
            .selectMany(({ subscription, unreadcount }) => {
                return Enumerable.from(subscription.categories)
                    .defaultIfEmpty(uncategorized)
                    .select(category => ({ category, subscription, unreadcount }));
            })
        const categoryItems = Enumerable.from(categories)
            .concat(Enumerable.make(uncategorized))
            .groupJoin(
                subscriptionItems,
                category => category.id,
                ({ category }) => category.id,
                (category, subscriptions) => ({ category, subscriptions })
            )
            .where(({ subscriptions }) => subscriptions.count() > 0)

        return (
            <div className="l-sidebar">
                <ul className="subscription-list">
                    {categoryItems.select(::this.renderCategory).toArray()}
                </ul>
            </div>
        )
    }

    renderCategory({ category, subscriptions }) {
        return (
            <li key={category.id}>
                <a href="#">{category.label}</a>
                <ul>{subscriptions.select(::this.renderSubscription).toArray()}</ul>
            </li>
        )
    }

    renderSubscription({ subscription, unreadcount }) {
        return (
            <li key={subscription.id}>
                <a href="#">
                    <img src={subscription.iconUrl} alt={subscription.title} width="16" height="16" />
                    <span className="subscription-title">{subscription.title}</span>
                </a>
            </li>
        )
    }
}

export default Sidebar
