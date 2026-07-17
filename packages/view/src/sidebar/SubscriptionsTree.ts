import type {
  Category,
  Subscription,
  SubscriptionGroup,
  SubscriptionItem,
} from '@feedpon/model';
import { Tree, type TreeItem } from '@feedpon/primitives';
import { createComponent, html } from 'barebind';

interface SubscriptionTreeProps {
  onStreamSelect: (streamId: string) => void;
  selectedStreamId: string | null;
  subscriptionGroups: SubscriptionGroup[];
  ungroupedItems: SubscriptionItem[];
}

type SubscriptionTreeItem = TreeItem<string, SubscriptionTreeItemValue>;

type SubscriptionTreeItemValue =
  | {
      type: 'subscription';
      subscription: Subscription;
      unreadCount: number;
    }
  | {
      type: 'category';
      category: Category;
      unreadCount: number;
    };

export const SubscriptionsTree = createComponent<SubscriptionTreeProps>(
  function SubscriptionsTree({
    onStreamSelect,
    selectedStreamId,
    ungroupedItems,
    subscriptionGroups,
  }) {
    const items = this.useMemo(() => {
      const categorizedItems: SubscriptionTreeItem[] = subscriptionGroups.map(
        ({ category, subscriptionItems, unreadCount, readCount }) => {
          const children: SubscriptionTreeItem[] = subscriptionItems.map(
            ({ subscription, unreadCount, readCount }) => {
              return {
                children: [],
                key: subscription.id,
                selected: subscription.id === selectedStreamId,
                value: {
                  type: 'subscription',
                  subscription,
                  unreadCount: Math.max(0, unreadCount - readCount),
                },
              };
            },
          );
          return {
            children,
            key: category.id,
            selected: category.id === selectedStreamId,
            value: {
              type: 'category',
              unreadCount: Math.max(0, unreadCount - readCount),
              category,
            },
          };
        },
      );

      const uncategorizedItems: SubscriptionTreeItem[] = ungroupedItems.map(
        ({ subscription, unreadCount }) => {
          return {
            children: [],
            key: subscription.id,
            selected: subscription.id === selectedStreamId,
            value: {
              type: 'subscription',
              subscription,
              unreadCount,
            },
          };
        },
      );

      return categorizedItems.concat(uncategorizedItems);
    }, [selectedStreamId, subscriptionGroups]);

    const handleSelect = (item: SubscriptionTreeItem) => {
      const streamId =
        item.value.type === 'category'
          ? item.value.category.id
          : item.value.subscription.id;
      onStreamSelect(streamId);
    };

    return Tree({
      items,
      onSelect: handleSelect,
      renderItem,
    });
  },
);

function renderItem(value: SubscriptionTreeItemValue, _key: string): unknown {
  if (value.type === 'category') {
    const { unreadCount, category } = value;
    return html`
      <div class=${{ StreamItem: true, 'has-unread': unreadCount > 0 }}>
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
    const { subscription, unreadCount } = value;
    const icon =
      subscription.iconUrl !== ''
        ? html`
          <img
            alt=${subscription.title}
            class="u-vertical-middle u-object-fit-cover"
            height="16"
            src=${subscription.iconUrl}
            width="16"
          >
        `
        : html`<i class="icon icon-16 icon-file"></i>`;
    return html`
      <div class=${{ StreamItem: true, 'has-unread': unreadCount > 0 }}>
        <div class="StreamItem-icon"><${icon}></div>
        <div class="StreamItem-title">${subscription.title !== '' ? subscription.title : '<NO TITLE>'}</div>
        <div class="StreamItem-unread">${unreadCount > 0 ? unreadCount.toLocaleString() : ''}</div>
      </div>
    `;
  }
}
