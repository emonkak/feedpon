import React, { PureComponent } from 'react';
import { Link } from 'react-router';
import { createSelector } from 'reselect';

import * as CacheMap from 'utils/CacheMap';
import MainLayout from 'components/layouts/MainLayout';
import Navbar from 'components/parts/Navbar';
import RelativeTime from 'components/parts/RelativeTime';
import SubscriptionIcon from 'components/parts/SubscriptionIcon';
import connect from 'utils/flux/react/connect';
import { State } from 'messaging/types';

interface DashboardProps {
    onToggleSidebar: () => void;
    streamHistories: StreamHistory[];
}

interface DashboardState {
    modalIsOpened: boolean;
}

interface StreamHistory {
    streamId: string;
    type: 'subscription' | 'category';
    title: string;
    iconUrl: string;
    unreadCount: number;
    fetchedAt: number;
}

class DashboardPage extends PureComponent<DashboardProps, DashboardState> {
    constructor(props: any, context: any) {
        super(props, context);
    }

    renderStreamHistory(streamHistory: StreamHistory) {
        return (
            <Link
                key={streamHistory.streamId}
                className="list-group-item"
                to={`/streams/${encodeURIComponent(streamHistory.streamId)}`}>
                <div className="u-flex u-flex-align-items-center">
                    <div className="u-flex-shrink-0 u-margin-right-2">
                        {streamHistory.type === 'category'
                            ? <i className="icon icon-16 icon-folder" />
                            : <SubscriptionIcon title={streamHistory.title} iconUrl={streamHistory.iconUrl} />}
                    </div>
                    <div className="u-flex-grow-1 u-margin-right-2">
                        <div>
                            {streamHistory.title}
                        </div>
                        <div className="u-text-small u-text-muted">
                            <RelativeTime time={streamHistory.fetchedAt} />
                        </div>
                    </div>
                    {streamHistory.unreadCount > 0 &&
                        <div><span className="badge badge-positive">{streamHistory.unreadCount}</span></div>}
                </div>
            </Link>
        );
    }

    renderNavbar() {
        const { onToggleSidebar } = this.props;

        return (
            <Navbar onToggleSidebar={onToggleSidebar}>
                <h1 className="navbar-title">Dashboard</h1>
            </Navbar>
        );
    }

    renderContent() {
        const { streamHistories } = this.props;

        return (
            <div className="container">
                <section className="section">
                    <h1 className="display-1">Recently read streams</h1>
                    <ol className="list-group">
                        {streamHistories.map(this.renderStreamHistory, this)}
                    </ol>
                </section>
            </div>
        );
    }

    render() {
        return (
            <MainLayout header={this.renderNavbar()}>
                {this.renderContent()}
            </MainLayout>
        );
    }
}

export default connect(() => {
    const subscriptionsSelector = createSelector(
        (state: State) => state.subscriptions.items,
        (subscriptions) => Object.values(subscriptions)
    );

    const categoryUnreadCountsSelector = createSelector(
        subscriptionsSelector,
        (subscriptions) => subscriptions.reduce<{ [key: string]: number }>((acc, subscription) => {
            for (const label of subscription.labels) {
                acc[label] = (acc[label] || 0) + subscription.unreadCount;
            }
            return acc;
        }, {})
    );

    const streamHistoriesSelector = createSelector(
        (state: State) => state.histories.recentlyReadStreams,
        (state: State) => state.subscriptions.items,
        (state: State) => state.categories.items,
        categoryUnreadCountsSelector,
        (recentlyReadStreams, subscriptions, categories, categoryUnreadCounts) =>
            CacheMap.keys(recentlyReadStreams)
                .reduce<StreamHistory[]>((acc, streamId) => {
                    if (subscriptions[streamId]) {
                        const subscription = subscriptions[streamId];
                        acc.push({
                            streamId,
                            type: 'subscription',
                            title: subscription.title,
                            iconUrl: subscription.iconUrl,
                            unreadCount: subscription.unreadCount,
                            fetchedAt: CacheMap.get(recentlyReadStreams, streamId)!
                        });
                    } else if (categories[streamId]) {
                        const category = categories[streamId];
                        acc.push({
                            streamId,
                            type: 'category',
                            title: category.label,
                            iconUrl: '',
                            unreadCount: categoryUnreadCounts[category.label] || 0,
                            fetchedAt: CacheMap.get(recentlyReadStreams, streamId)!
                        });
                    }
                    return acc;
                }, [])
            .reverse()
    );

    return {
        mapStateToProps: (state: State) => ({
            streamHistories: streamHistoriesSelector(state)
        })
    };
})(DashboardPage);
