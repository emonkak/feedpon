import Enumerable from 'linq'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import React from 'react'
import SubscriptionCategory from './subscriptionCategory'
import { GetSubscriptions, GetUnreadCounts, GetCategories } from '../../constants/actionTypes'

export default class Sidebar extends React.Component {
    static propTypes = {
        credential: React.PropTypes.object.isRequired,
        subscriptions: React.PropTypes.array.isRequired,
        unreadCounts: React.PropTypes.array.isRequired,
        categories: React.PropTypes.array.isRequired,
        selectedStreamId: React.PropTypes.string
    }

    static contextTypes = {
        dispatch: React.PropTypes.func.isRequired
    }

    constructor(props) {
        super(props)

        this.state = { filter: '' }
    }

    handleFilterChanged(event) {
        this.setState({ filter: event.target.value })
    }

    handleUpdate() {
        this.context.dispatch({ actionType: GetSubscriptions })
        this.context.dispatch({ actionType: GetUnreadCounts })
        this.context.dispatch({ actionType: GetCategories })
    }

    render() {
        const { credential, unreadCounts } = this.props
        const { filter } = this.state

        const uncategorized = { label: 'Uncategorized', id: `user/${credential.id}/category/global.uncategorized` }
        const subscriptions = Enumerable.from(this.props.subscriptions)
            .where(subscription => (subscription.title && subscription.title.indexOf(filter) !== -1) || (subscription.website && subscription.website.indexOf(filter) !== -1))
            .join(
                Enumerable.from(unreadCounts),
                subscription => subscription.id,
                unreadCount => unreadCount.id,
                (subscription, unreadCount) => ({ subscription, unreadCount })
            )
            .selectMany(({ subscription, unreadCount }) => {
                return Enumerable.from(subscription.categories)
                    .defaultIfEmpty(uncategorized)
                    .select(category => ({ category, subscription, unreadCount }));
            })
        const categories = Enumerable.from(this.props.categories)
            .concat(Enumerable.make(uncategorized))
            .groupJoin(
                subscriptions,
                category => category.id,
                ({ category }) => category.id,
                (category, subscriptions) => ({ category, subscriptions: subscriptions.toArray() })
            )
            .where(({ subscriptions }) => subscriptions.length > 0)

        return (
            <div className="l-sidebar">
                <input className="subscription-filter" type="text" onChange={::this.handleFilterChanged} />
                <ul className="subscription-category-list">
                    {categories.select(::this.renderCategory).toArray()}
                </ul>
                <button className="button button-default button-fill" onClick={::this.handleUpdate}>Update</button>
            </div>
        )
    }

    renderCategory({ category, subscriptions }) {
        const { selectedStreamId } = this.props

        return (
            <SubscriptionCategory key={category.id}
                                  category={category}
                                  subscriptions={subscriptions}
                                  selected={category.id === selectedStreamId}
                                  selectedStreamId={selectedStreamId} />
        )
    }
}

Object.assign(Sidebar.prototype, PureRenderMixin)
