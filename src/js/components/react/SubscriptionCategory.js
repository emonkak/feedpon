import PureRenderMixin from 'react-addons-pure-render-mixin';
import React from 'react';
import Subscription from './Subscription';
import appContextTypes from '../../shared/components/react/appContextTypes';
import classnames from 'classnames';
import { History } from '../../constants/actionTypes';

export default class SubscriptionCategory extends React.Component {
    static propTypes = {
        category: React.PropTypes.object.isRequired,
        subscriptions: React.PropTypes.array.isRequired,
        selectedStreamId: React.PropTypes.string
    };

    static contextTypes = appContextTypes;

    constructor(props) {
        super(props);

        this.state = { expanded: false };
    }

    render() {
        const { category, subscriptions, selectedStreamId } = this.props;
        const { expanded } = this.state;

        const unreadCount = subscriptions
            .reduce((sum, { unreadCount }) => sum + unreadCount.count, 0);

        return (
            <li className='subscription-category-container'>
                <div className={classnames('subscription-category', { 'is-selected': category.id === selectedStreamId })}>
                    <a className={classnames('subscription-category-expand-button', {'is-expanded': expanded })} href="#" onClick={::this.handleExpand}>
                        {expanded ? <i className='fa fa-caret-down' /> : <i className='fa fa-caret-right' />}
                    </a>
                    <a className='subscription-category-link' href="#" onClick={::this.handleSelectStream}>
                        <span className='subscription-category-label'>{category.label}</span>
                        <span className='subscription-category-unread-count'>{unreadCount}</span>
                    </a>
                </div>
                <ul className={classnames('subscriptions', { 'is-expanded': expanded })}>
                    {subscriptions.map(::this.renderSubscription)}
                </ul>
            </li>
        );
    }

    renderSubscription({ subscription, unreadCount, isHidden }) {
        const { selectedStreamId } = this.props;

        return (
            <Subscription key={subscription.id}
                          subscription={subscription}
                          unreadCount={unreadCount}
                          isSelected={subscription.id === selectedStreamId}
                          isHidden={isHidden} />
        );
    }

    handleExpand(event) {
        event.preventDefault();

        this.setState(state => ({
            ...state,
            expanded: !state.expanded
        }));

        return false;
    }

    handleSelectStream(event) {
        event.preventDefault();

        const { category } = this.props;

        this.context.dispatch({
            actionType: History.Push,
            path: `/contents/${encodeURIComponent(category.id)}`
        });
    }
}

Object.assign(SubscriptionCategory.prototype, PureRenderMixin);
