import { createComponent, type RenderContext, Repeat } from 'barebind';
import { bindActions } from 'feedpon-flux';
import { getStoreHook } from 'feedpon-flux/barebind.ts';
import type { State } from 'feedpon-messaging';
import { toggleSidebar } from 'feedpon-messaging/ui';
import * as CacheMap from 'feedpon-utils/CacheMap.ts';

import { MainLayout } from '../common/MainLayout.ts';
import { Navbar } from '../common/Navbar.ts';
import { RelativeTime } from '../primitives/RelativeTime.ts';

export interface DashboardProps {}

interface StreamHistory {
  streamId: string;
  type: 'subscription' | 'category';
  title: string;
  iconUrl: string;
  unreadCount: number;
  fetchedAt: number;
}

export const DashboardPage = createComponent(function DashboardPage(
  {}: DashboardProps,
  $: RenderContext,
): unknown {
  const { onToggleSidebar, categories, subscriptions, histories } = $.use(
    getStoreHook({
      mapStateToProps: (state: State) => ({
        categories: state.categories,
        histories: state.histories,
        subscriptions: state.subscriptions,
      }),
      mapDispatchToProps: bindActions({
        onToggleSidebar: toggleSidebar,
      }),
    }),
  );

  const categoryUnreadCounts = $.useMemo(
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

  const streamHistories = $.useMemo(
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

  const header = Navbar({
    onToggleSidebar,
    children: $.html`
      <h1 class="navbar-title">Dashboard</h1>
    `,
  });

  const streamHistoryList =
    streamHistories.length === 0
      ? $.html`
        <p>Recently read streams does not exist yet. Let's subscribe to feeds and read the stream.</p>
      `
      : $.html`
    <ol class="list-group">
      <${Repeat({
        source: streamHistories,
        keySelector: (streamHistory) => streamHistory.streamId,
        valueSelector: (streamHistory) => StreamHistoryView({ streamHistory }),
      })}>
    </ol>
  `;
  const content = $.html`
    <div class="container">
      <section class="section">
        <h1 class="display-1">Recently read</h1>
        <${streamHistoryList}>
      </section>
    </div>
  `;

  return MainLayout({
    content,
    header,
  });
});

interface StreamHistoryViewProps {
  streamHistory: StreamHistory;
}

const StreamHistoryView = createComponent(function StreamHistoryView(
  { streamHistory }: StreamHistoryViewProps,
  $: RenderContext,
): unknown {
  const icon =
    streamHistory.iconUrl !== ''
      ? $.html`
        <img
          class="u-vertical-middle u-object-fit-cover"
          alt=${streamHistory.title}
          src=${streamHistory.iconUrl}
          width="16"
          height="16"
        >
      `
      : streamHistory.type === 'subscription'
        ? $.html`<i class="icon icon-16 icon-file"></i>`
        : $.html`<i class="icon icon-16 icon-folder"></i>`;

  return $.html`
    <a
      class="list-group-item"
      href=${`#/streams/${encodeURIComponent(streamHistory.streamId)}`}
    >
      <div class="u-flex u-flex-align-items-center">
        <div class="u-flex-shrink-0 u-margin-right-2">
          <${icon}>
        </div>
        <div class="u-flex-grow-1 u-margin-right-2">
          <div>${streamHistory.title}</div>
          <div class="u-text-7 u-text-muted">
            <${RelativeTime({ time: streamHistory.fetchedAt })}>
          </div>
        </div>
        <${
          streamHistory.unreadCount > 0
            ? $.html`
              <div class="u-flex-shrink-0">
                <span class="badge badge-medium badge-positive">
                  ${streamHistory.unreadCount}
                </span>
              </div>
            `
            : null
        }>
      </div>
    </a>
  `;
});
