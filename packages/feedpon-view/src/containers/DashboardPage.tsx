import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { bindActions } from 'feedpon-flux';
import connect from 'feedpon-flux/react/connect';
import type {
  Histories,
  Categories,
  Subscriptions,
  State,
} from 'feedpon-messaging';
import { toggleSidebar } from 'feedpon-messaging/ui';
import * as CacheMap from 'feedpon-utils/CacheMap';
import Navbar from '../components/Navbar';
import RelativeTime from '../components/RelativeTime';
import MainLayout from '../layouts/MainLayout';
import SubscriptionIcon from '../modules/SubscriptionIcon';

interface DashboardProps {
  histories: Histories;
  subscriptions: Subscriptions;
  categories: Categories;
  onToggleSidebar: typeof toggleSidebar;
}

interface StreamHistory {
  streamId: string;
  type: 'subscription' | 'category';
  title: string;
  iconUrl: string;
  unreadCount: number;
  fetchedAt: number;
}

function DashboardPage({
  onToggleSidebar,
  categories,
  subscriptions,
  histories,
}: DashboardProps) {
  const categoryUnreadCounts = useMemo(
    () =>
      Object.values(subscriptions.items).reduce<{ [key: string]: number }>(
        (acc, subscription) => {
          for (const label of subscription.labels) {
            if (subscription.unreadCount > subscription.readCount) {
              acc[label] =
                (acc[label] || 0) +
                subscription.unreadCount -
                subscription.readCount;
            }
          }
          return acc;
        },
        {},
      ),
    [subscriptions.items],
  );

  const streamHistories = useMemo(
    () =>
      CacheMap.keys(histories.recentlyReadStreams)
        .reduce<StreamHistory[]>((acc, streamId) => {
          if (subscriptions.items[streamId]) {
            const subscription = subscriptions.items[streamId]!;
            acc.push({
              streamId,
              type: 'subscription',
              title: subscription.title,
              iconUrl: subscription.iconUrl,
              unreadCount: Math.max(
                0,
                subscription.unreadCount - subscription.readCount,
              ),
              fetchedAt: CacheMap.get(histories.recentlyReadStreams, streamId)!,
            });
          } else if (categories.items[streamId]) {
            const category = categories.items[streamId]!;
            acc.push({
              streamId,
              type: 'category',
              title: category.label,
              iconUrl: '',
              unreadCount: categoryUnreadCounts[category.label] || 0,
              fetchedAt: CacheMap.get(histories.recentlyReadStreams, streamId)!,
            });
          }
          return acc;
        }, [])
        .reverse(),
    [
      categoryUnreadCounts,
      histories.recentlyReadStreams,
      subscriptions.items,
      categories.items,
    ],
  );

  const navbar = (
    <Navbar onToggleSidebar={onToggleSidebar}>
      <h1 className="navbar-title">Dashboard</h1>
    </Navbar>
  );

  let streamHistoryList;

  if (streamHistories.length === 0) {
    streamHistoryList = (
      <p>{`Recently read streams does not exist yet. Let's subscribe to feeds and read the stream.`}</p>
    );
  } else {
    streamHistoryList = (
      <ol className="list-group">
        {streamHistories.map((streamHistory) => (
          <Link
            key={streamHistory.streamId}
            className="list-group-item"
            to={`/streams/${encodeURIComponent(streamHistory.streamId)}`}
          >
            <div className="u-flex u-flex-align-items-center">
              <div className="u-flex-shrink-0 u-margin-right-2">
                {streamHistory.type === 'category' ? (
                  <i className="icon icon-16 icon-folder" />
                ) : (
                  <SubscriptionIcon
                    title={streamHistory.title}
                    iconUrl={streamHistory.iconUrl}
                  />
                )}
              </div>
              <div className="u-flex-grow-1 u-margin-right-2">
                <div>{streamHistory.title}</div>
                <div className="u-text-7 u-text-muted">
                  <RelativeTime time={streamHistory.fetchedAt} />
                </div>
              </div>
              {streamHistory.unreadCount > 0 && (
                <div className="u-flex-shrink-0">
                  <span className="badge badge-medium badge-positive">
                    {streamHistory.unreadCount}
                  </span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </ol>
    );
  }

  return (
    <MainLayout header={navbar}>
      <div className="container">
        <section className="section">
          <h1 className="display-1">Recently read</h1>
          {streamHistoryList}
        </section>
      </div>
    </MainLayout>
  );
}

export default connect(() => {
  return {
    mapStateToProps: (state: State) => ({
      categories: state.categories,
      histories: state.histories,
      subscriptions: state.subscriptions,
    }),
    mapDispatchToProps: bindActions({
      onToggleSidebar: toggleSidebar,
    }),
  };
})(DashboardPage);
