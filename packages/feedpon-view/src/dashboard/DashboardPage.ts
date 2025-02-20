import type { RenderContext, TemplateResult } from '@emonkak/ebit';
import { component, keyedList, optional } from '@emonkak/ebit/directives.js';
import { bindActions } from 'feedpon-flux';
import { getStoreHook } from 'feedpon-flux/ebit.ts';
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

export function DashboardPage(
  {}: DashboardProps,
  context: RenderContext,
): TemplateResult {
  const { onToggleSidebar, categories, subscriptions, histories } = context.use(
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

  const categoryUnreadCounts = context.useMemo(
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

  const streamHistories = context.useMemo(
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

  const header = context.html`
    <${component(Navbar, {
      onToggleSidebar,
      children: context.html`
        <h1 class="navbar-title">Dashboard</h1>
      `,
    })}>
  `;

  // biome-ignore format:
  const streamHistoryList =
    streamHistories.length === 0
      ? context.html`
    <p>Recently read streams does not exist yet. Let's subscribe to feeds and read the stream.</p>
  ` : context.html`
    <ol class="list-group">
      <${keyedList(
        streamHistories,
        (streamHistory) => streamHistory.streamId,
        (streamHistory) => component(StreamHistoryView, { streamHistory }),
      )}>
    </ol>
  `;
  const content = context.html`
    <div class="container">
      <section class="section">
        <h1 class="display-1">Recently read</h1>
        <${streamHistoryList}>
      </section>
    </div>
  `;

  return context.html`<${component(MainLayout, {
    content,
    header,
  })}>`;
}

interface StreamHistoryViewProps {
  streamHistory: StreamHistory;
}

function StreamHistoryView(
  { streamHistory }: StreamHistoryViewProps,
  context: RenderContext,
): TemplateResult {
  const icon =
    streamHistory.iconUrl !== ''
      ? context.html`
        <img
          class="u-vertical-middle u-object-fit-cover"
          alt=${streamHistory.title}
          src=${streamHistory.iconUrl}
          width="16"
          height="16"
        >
      `
      : streamHistory.type === 'subscription'
        ? context.html`<i class="icon icon-16 icon-file"></i>`
        : context.html`<i class="icon icon-16 icon-folder"></i>`;

  return context.html`
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
            <${component(RelativeTime, { time: streamHistory.fetchedAt })}>
          </div>
        </div>
        <${optional(
          streamHistory.unreadCount > 0
            ? context.html`
              <div class="u-flex-shrink-0">
                <span class="badge badge-medium badge-positive">
                  ${streamHistory.unreadCount}
                </span>
              </div>
            `
            : null,
        )}>
      </div>
    </a>
  `;
}
