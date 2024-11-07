import type { Category, Feed, Subscription } from 'feedpon-messaging';

import type { RenderContext, TemplateResult } from '@emonkak/ebit';
import {
  atom,
  classMap,
  component,
  live,
  nonKeyedList,
  optional,
} from '@emonkak/ebit/directives.js';
import { ConfirmModal } from '../primitives/ConfirmModal';
import { Menu } from '../primitives/Menu';

interface SubscriptionSettingsDropdownProps {
  categories: Category[];
  feed: Feed;
  onAddToCategory: (subscription: Subscription, label: string) => void;
  onCreateCategory: (
    label: string,
    callback: (category: Category) => void,
  ) => void;
  onRemoveFromCategory: (subscription: Subscription, label: string) => void;
  onSubscribe: (feed: Feed, labels: string[]) => void;
  onUnsubscribe: (subscription: Subscription) => void;
  subscription: Subscription | null;
}

export function SubscriptionSettingsDropdown(
  {
    categories,
    feed,
    onAddToCategory,
    onCreateCategory,
    onRemoveFromCategory,
    onSubscribe,
    onUnsubscribe,
    subscription,
  }: SubscriptionSettingsDropdownProps,
  context: RenderContext,
): TemplateResult {
  const [isOpened, setIsOpened] = context.useState(false);
  const categoryLabel$ = context.useMemo(() => atom(''), []);

  const toggleId = context.useId();

  const closeDropdown = context.useCallback(() => {
    setIsOpened(false);
  }, []);

  const toggleDropdown = context.useCallback(() => {
    setIsOpened((isOpened) => !isOpened);
  }, []);

  const handleCreateCategory = context.useCallback(() => {
    const categoryLabel = categoryLabel$.value;
    if (subscription !== null) {
      onCreateCategory(categoryLabel, () =>
        onAddToCategory(subscription, categoryLabel),
      );
    } else {
      onCreateCategory(categoryLabel, () => onSubscribe(feed, [categoryLabel]));
    }
    categoryLabel$.value = '';
  }, [onAddToCategory, onCreateCategory, onSubscribe, subscription]);

  const handleChangeCategoryLabel = context.useCallback((event: Event) => {
    categoryLabel$.value = (event.currentTarget as HTMLInputElement).value;
  }, []);

  const handleUnsubscribe = context.useCallback(() => {
    ConfirmModal.open(
      {
        confirmButton: (callback, context) => context.html`
          <button class="button button-negative" type="button" @click=${callback}>Unsubscribe</button>
        `,
        cancelButton: (callback, context) => context.html`
          <button class="button button-outline-default" type="button" @click=${callback}>Cancel</button>
        `,
        onConfirm: () => {
          if (subscription !== null) {
            onUnsubscribe(subscription);
          }
        },
        title: `Unsubscribe "${feed.title}"`,
        message: `Are you sure you want to unsubscribe the feed?`,
      },
      context,
    );
  }, [feed, onUnsubscribe]);

  const categoryItems =
    subscription !== null
      ? nonKeyedList(categories, (category) => {
          const isAdded = subscription.labels.includes(category.label);
          const handleClick = isAdded
            ? () => {
                onRemoveFromCategory(subscription, category.label);
                closeDropdown();
              }
            : () => {
                onAddToCategory(subscription, category.label);
                closeDropdown();
              };
          return context.html`
            <button
              class="MenuItem"
              role="menuitem"
              type="button"
              @click=${handleClick}
            >
              <div class="MenuItem-icon">
                <${optional(isAdded ? context.html`<i aria-hidden="true" class="icon icon-16 icon-checkmark" role="img"></i>` : null)}>
              </div>
              <div class="MenuItem-content">${category.label}</div>
            </button>
          `;
        })
      : nonKeyedList(
          categories,
          (category) => context.html`
            <button
              class="MenuItem"
              role="menuitem"
              type="button"
              @click=${() => {
                onSubscribe(feed, [category.label]);
                closeDropdown();
              }}
            >
              <div class="MenuItem-content">${category.label}</div>
            </button>
          `,
        );

  const menuItems = context.html`
    <div class="MenuSection" role="group">
      <div class="MenuHeading" role="heading">Category</div>
      <${categoryItems}>
    </div>
    <hr class="MenuSeparator">
    <div class="MenuSection" role="group">
      <div class="MenuHeading" role="heading">New category</div>
      <form
        class="MenuItem"
        role="menuitem"
        @submit=${handleCreateCategory}
      >
        <div class="MenuItem-content">
          <div class="input-group">
            <input
              type="text"
              class="form-control"
              style='width: 12ch'
              .value=${categoryLabel$.map(live)}
              @change=${handleChangeCategoryLabel}
            >
            <button type="submit" class="button button-positive">OK</button>
          </div>
        </div>
      </form>
    </div>
    <hr class="MenuSeparator">
    <button
      class="MenuItem"
      disabled=${subscription === null}
      role="menuitem"
      type="button"
      @click=${handleUnsubscribe}
    >
      <div class="MenuItem-content">Unsubscribe...</div>
    </button>
  `;

  return context.html`
    <div class="Dropdown">
      <button
        @click=${toggleDropdown}
        aria-label="Subscription settings"
        class=${subscription !== null ? 'button button-outline-default dropdown-arrow' : 'button button-outline-positive dropdown-arrow'}
        disabled=${feed.isLoading}
        id=${toggleId}
        type="button"
      >
        <i
          aria-hidden="true"
          class=${classMap({
            icon: true,
            'icon-20': true,
            [feed.isLoading
              ? 'icon-spinner'
              : subscription !== null
                ? 'icon-settings'
                : 'icon-plus-math']: true,
            'animation-rotating': feed.isLoading,
          })}
          role="img"
        ></i>
      </button>
      <${component(Menu, {
        anchorTarget: toggleId,
        children: menuItems,
        onClose: closeDropdown,
        open: isOpened,
      })}>
    </div>
  `;
}
