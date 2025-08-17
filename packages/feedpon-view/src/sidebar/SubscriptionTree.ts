import { createComponent, type RenderContext } from 'barebind';
import type {
  Category,
  GroupedSubscription,
  Subscription,
} from 'feedpon-messaging';
import { UNCATEGORIZED } from 'feedpon-messaging/categories';

import { Tree, type TreeItem } from '../primitives/Tree.ts';

interface SubscriptionTreeProps {
  categories: Category[];
  groupedSubscriptions: { [key: string]: GroupedSubscription };
  onSelect: (value: string) => void;
  selectedPath: string;
}

type StreamItem =
  | {
      type: 'subscription';
      subscription: Subscription;
    }
  | {
      type: 'category';
      category: Category;
      unreadCount: number;
    };

export const SubscriptionTree = createComponent(function SubscriptionTree(
  {
    categories,
    groupedSubscriptions,
    onSelect,
    selectedPath,
  }: SubscriptionTreeProps,
  $: RenderContext,
): unknown {
  const items = $.useMemo(() => {
    const items: TreeItem<string, StreamItem>[] = [];

    for (let i = 0, l = categories.length; i < l; i++) {
      const category = categories[i]!;
      const groupedSubscription = groupedSubscriptions[category.label];
      if (groupedSubscription === undefined) {
        continue;
      }
      const children = groupedSubscription.items.map((subscription) => {
        const selected =
          selectedPath ===
          `/streams/${encodeURIComponent(subscription.streamId)}`;
        return {
          children: [],
          key: category.label + '/' + subscription.streamId,
          selected,
          value: {
            type: 'subscription',
            subscription,
          },
        } satisfies TreeItem<string, StreamItem>;
      });
      items.push({
        children,
        key: category.label,
        selected:
          selectedPath === `/streams/${encodeURIComponent(category.streamId)}`,
        value: {
          type: 'category',
          unreadCount: groupedSubscription.unreadCount,
          category,
        },
      });
    }

    if (groupedSubscriptions[UNCATEGORIZED] !== undefined) {
      const uncategoriesSubscriptions =
        groupedSubscriptions[UNCATEGORIZED].items;
      for (let i = 0, l = uncategoriesSubscriptions.length; i < l; i++) {
        const subscription = uncategoriesSubscriptions[i]!;
        const selected =
          selectedPath ===
          `/streams/${encodeURIComponent(subscription.streamId)}`;
        items.push({
          children: [],
          key: subscription.streamId,
          selected,
          value: {
            type: 'subscription',
            subscription,
          },
        });
      }
    }

    return items;
  }, [categories, groupedSubscriptions, selectedPath]);

  const handleSelect = $.useCallback(
    (item: TreeItem<string, StreamItem>) => {
      const streamId =
        item.value.type === 'category'
          ? item.value.category.streamId
          : item.value.subscription.streamId;
      onSelect(`/streams/${encodeURIComponent(streamId)}`);
    },
    [onSelect],
  );

  return Tree({
    items,
    onSelect: handleSelect,
    renderItem,
  });
});

function renderItem(
  item: TreeItem<string, StreamItem>,
  $: RenderContext,
): unknown {
  if (item.value.type === 'category') {
    const { unreadCount, category } = item.value;
    return $.html`
      <div :class=${{ _: 'StreamItem', 'has-unread': unreadCount > 0 }}>
        <div class="StreamItem-title">${category.label}</div>
        <div
          aria-label=${`${unreadCount} unread item(s) available`}
          class="StreamItem-unread"
        >
          ${unreadCount > 0 ? unreadCount.toLocaleString() : ''}
        </div>
      </div>
    `;
  } else {
    const { subscription } = item.value;
    const unreadCount = Math.max(
      0,
      subscription.unreadCount - subscription.readCount,
    );
    const icon =
      subscription.iconUrl !== ''
        ? $.html`
          <img
            alt=${subscription.title}
            class="u-vertical-middle u-object-fit-cover"
            height="16"
            src=${subscription.iconUrl}
            width="16"
          >
        `
        : $.html`<i class="icon icon-16 icon-file"></i>`;
    return $.html`
      <div :class=${{ _: 'StreamItem', 'has-unread': unreadCount > 0 }}>
        <div class="StreamItem-icon"><${icon}></div>
        <div class="StreamItem-title">${subscription.title !== '' ? subscription.title : '<NO TITLE>'}</div>
        <div class="StreamItem-unread">${unreadCount > 0 ? unreadCount.toLocaleString() : ''}</div>
      </div>
    `;
  }
}
