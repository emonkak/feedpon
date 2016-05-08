import PureRenderMixin from 'react-addons-pure-render-mixin'
import React from 'react'
import SubscriptionCategory from './SubscriptionCategory'
import appContextTypes from './appContextTypes'
import concat from '@emonkak/enumerable/concat'
import groupJoin from '@emonkak/enumerable/groupJoin'
import join from '@emonkak/enumerable/join'
import select from '@emonkak/enumerable/select'
import selectMany from '@emonkak/enumerable/selectMany'
import toArray from '@emonkak/enumerable/toArray'
import where from '@emonkak/enumerable/where'
import { FetchSubscriptions, FetchUnreadCounts, FetchCategories } from '../../constants/actionTypes'

export default class Sidebar extends React.Component {
    static propTypes = {
        credential: React.PropTypes.object,
        subscriptions: React.PropTypes.array.isRequired,
        unreadCounts: React.PropTypes.array.isRequired,
        categories: React.PropTypes.array.isRequired
    }

    static contextTypes = appContextTypes

    constructor(props) {
        super(props)

        this.state = { filterQuery: '' }
    }

    handleFilterChanged(event) {
        this.setState({ filterQuery: event.target.value })
    }

    handleUpdate() {
        this.context.dispatch({ actionType: FetchSubscriptions })
        this.context.dispatch({ actionType: FetchUnreadCounts })
        this.context.dispatch({ actionType: FetchCategories })
    }

    render() {
        const { credential, unreadCounts } = this.props
        const { filterQuery } = this.state

        const defaultCategories = credential
            ? [{ label: 'Uncategorized', id: `user/${credential.id}/category/global.uncategorized` }]
            : []

        const subscriptions = this.props.subscriptions
            ::where(subscription => (subscription.title && subscription.title.indexOf(filterQuery) !== -1) || (subscription.website && subscription.website.indexOf(filterQuery) !== -1))
            ::join(
                unreadCounts,
                subscription => subscription.id,
                unreadCount => unreadCount.id,
                (subscription, unreadCount) => ({ subscription, unreadCount })
            )
            ::selectMany(({ subscription, unreadCount }) => {
                const categories = subscription.categories.length > 0 ? subscription.categories : defaultCategories
                return categories::select(category => ({ category, subscription, unreadCount }))
            })

        const categories = this.props.categories
            ::concat(defaultCategories)
            ::groupJoin(
                subscriptions,
                category => category.id,
                ({ category }) => category.id,
                (category, subscriptions) => ({ category, subscriptions })
            )

        return (
            <div className="l-sidebar">
                <input className="subscription-filter" type="text" onChange={::this.handleFilterChanged} />
                <ul className="subscription-category-list">
                    {categories::select(::this.renderCategory)::toArray()}
                </ul>
                <button className="button button-default button-fill" onClick={::this.handleUpdate}>Update</button>
            </div>
        )
    }

    renderCategory({ category, subscriptions }) {
        const { params: { streamId } } = this.props

        return (
            <SubscriptionCategory key={category.id}
                                  category={category}
                                  subscriptions={subscriptions}
                                  selectedStreamId={streamId} />
        )
    }
}

Object.assign(Sidebar.prototype, PureRenderMixin)
