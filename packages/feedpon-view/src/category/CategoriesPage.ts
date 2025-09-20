import { createComponent, type ElementRef, type RenderContext } from 'barebind';
import { type HistoryNavigator, RelativeURL } from 'barebind/extras/router';
import { bindActions } from 'feedpon-flux';
import { getStoreHook } from 'feedpon-flux/barebind.ts';
import type { Category, State, Subscription } from 'feedpon-messaging';
import {
  createCategory,
  createSortedCategoriesSelector,
  deleteCategory,
  UNCATEGORIZED,
  updateCategory,
} from 'feedpon-messaging/categories';
import {
  addToCategory,
  createAllSubscriptionsSelector,
  importOpml,
  removeFromCategory,
  unsubscribe,
} from 'feedpon-messaging/subscriptions';
import { toggleSidebar } from 'feedpon-messaging/ui';
import createAscendingComparer from 'feedpon-utils/createAscendingComparer.ts';
import debounce from 'feedpon-utils/debounce.ts';

import { MainLayout } from '../layout/MainLayout.ts';
import { Dropdown } from '../primitives/Dropdown.ts';
import { Navbar } from '../primitives/Navbar.ts';
import { type TabItem, TabList } from '../primitives/TabList.ts';
import {
  type BlankSpaces,
  VirtualScrollList,
} from '../primitives/VirtualScrollList.ts';
import { SubscriptionView } from '../subscription/SubscriptionView.ts';
import { CategoryForm } from './CategoryForm.ts';

export interface CategoriesPageProps {
  label?: string;
  navigator: HistoryNavigator;
}

export const CategoriesPage = createComponent(function CategoriesPage(
  { label, navigator }: CategoriesPageProps,
  $: RenderContext,
): unknown {
  const categoriesSelector = $.useMemo(
    () => createSortedCategoriesSelector(),
    [],
  );
  const subscriptionsSelector = $.useMemo(
    () => createAllSubscriptionsSelector(),
    [],
  );
  const {
    categories,
    exportUrl,
    onAddToCategory,
    onCreateCategory,
    onDeleteCategory,
    onImportOpml,
    onRemoveFromCategory,
    onToggleSidebar,
    onUpdateCategory,
    onUnsubscribe,
    subscriptions,
  } = $.use(
    getStoreHook({
      mapStateToProps: (state: State) => {
        return {
          categories: categoriesSelector(state),
          exportUrl: state.backend.exportUrl,
          subscriptions: subscriptionsSelector(state),
        };
      },
      mapDispatchToProps: bindActions({
        onAddToCategory: addToCategory,
        onCreateCategory: createCategory,
        onDeleteCategory: deleteCategory,
        onImportOpml: importOpml,
        onRemoveFromCategory: removeFromCategory,
        onToggleSidebar: toggleSidebar,
        onUnsubscribe: unsubscribe,
        onUpdateCategory: updateCategory,
      }),
    }),
  );
  const [query, setQuery] = $.useState('');
  const searchInputRef = $.useRef<HTMLInputElement | null>(null);
  const uploadInputRef = $.useRef<HTMLInputElement | null>(null);

  const activeCategory = $.useMemo(
    () => categories.find((category) => category.label === label) ?? null,
    [categories, label],
  );

  const selectedSubscriptions = $.useMemo(() => {
    return Object.values(subscriptions)
      .filter(
        label
          ? (subscription) => subscription.labels.includes(label)
          : (subscription) => subscription.labels.length === 0,
      )
      .sort(createAscendingComparer<Subscription>('subscriptionId'));
  }, [subscriptions, label]);

  const renderSubscriptionItem = $.useCallback(
    (
      { subscription }: { id: string | number; subscription: Subscription },
      _index: number,
      _ref: ElementRef,
      _context: RenderContext,
    ) =>
      SubscriptionView({
        categories,
        onAddToCategory,
        onCreateCategory,
        onRemoveFromCategory,
        onUnsubscribe,
        subscription,
      }),
    [categories],
  );

  const handleChangeSearchQuery = $.useMemo(
    () =>
      debounce((_event: Event) => {
        if (!searchInputRef.current) {
          return;
        }

        setQuery(searchInputRef.current.value);
      }, 100),
    [],
  );

  const handleChangeUploadFile = $.useCallback((event: Event) => {
    const target = event.currentTarget as HTMLInputElement;
    if (!target.files) {
      return;
    }

    const file = target.files[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = (_event) => {
      onImportOpml(reader.result as string);
    };

    reader.readAsText(file);
  }, []);

  const handleUpdateCategory = $.useCallback(
    (category: Category, newLabel: string) => {
      onUpdateCategory(category, newLabel);

      navigator.navigate(
        new RelativeURL('/categories/' + encodeURIComponent(newLabel)),
        { replace: true },
      );
    },
    [],
  );

  const handleImportOpml = $.useCallback(() => {
    uploadInputRef.current?.click();
  }, []);

  const handleExportOpml = $.useCallback(() => {
    window.open(exportUrl, '_blank');
  }, [exportUrl]);

  const handleSelectCategory = $.useCallback((_event: Event, key: string) => {
    navigator.navigate(
      new RelativeURL('/categories/' + encodeURIComponent(key)),
      { replace: true },
    );
  }, []);

  const filteredSubscriptions = $.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (normalizedQuery === '') {
      return selectedSubscriptions.map((subscription) => ({
        id: subscription.subscriptionId,
        subscription,
      }));
    }

    const tokens = normalizedQuery.split(/\s+/);

    return selectedSubscriptions
      .filter((subscription) => {
        const input = (
          subscription.title +
          ' ' +
          subscription.url
        ).toLowerCase();
        return tokens.every((query) => input.includes(query));
      })
      .map((subscription) => ({
        id: subscription.subscriptionId,
        subscription,
      }));
  }, [query, selectedSubscriptions]);

  const dropdown = Dropdown({
    trigger: ({ id, onToggle, open }, context) => context.html`
          <button
            aria-expanded=${open.toString()}
            aria-label="Toggle menu"
            class="navbar-action"
            id=${id}
            type="button"
            @click=${onToggle}
          >
            <i
              aria-hidden
              class="icon icon-24 icon-menu-2"
              role="img"
            ></i>
          </button>
        `,
    items: [
      {
        type: 'button',
        key: 'import_opml',
        children: $.html`
          <div class="MenuItem-content">Import OPML...</div>
        `,
        onAction: handleImportOpml,
      },
      {
        type: 'button',
        key: 'export_opml',
        children: $.html`
          <div class="MenuItem-content">Export OPML...</div>
        `,
        onAction: handleExportOpml,
      },
    ],
  });

  const header = Navbar({
    onToggleSidebar,
    children: $.html`
      <h1 class="navbar-title">Organize subscriptions</h1>
      <${dropdown}>
      <input
        :ref=${uploadInputRef}
        class="u-none"
        type="file"
        @change=${handleChangeUploadFile}
      >
    `,
  });

  const tabList = TabList({
    items: [
      {
        key: UNCATEGORIZED,
        children: $.html`Uncategorized`,
        selected: label === UNCATEGORIZED,
      } as TabItem,
    ].concat(
      categories.map((category) => ({
        key: category.label,
        children: $.html`${category.label}`,
        selected: label === category.label,
      })),
    ),
    onTabSelect: handleSelectCategory,
  });

  const description =
    selectedSubscriptions.length > 0
      ? $.html`
        <p>
          <strong>${selectedSubscriptions.length}</strong> subscriptions are
          available in this category.
        </p>
      `
      : $.html`<p>There are no subscriptions in this category.</p>`;

  const content = $.html`
    <div class="container">
      <${tabList}>
      <${
        activeCategory !== null
          ? CategoryForm({
              category: activeCategory,
              onCategoryUpdate: handleUpdateCategory,
              onCategoryDelete: onDeleteCategory,
            })
          : null
      }>
      <h1 class="display-1">${label ?? 'Uncategorized'}</h1>
      <p>
        <input
          :ref=${searchInputRef}
          type="search"
          class="form-control"
          placeholder="Filter for subscriptions..."
          @change=${handleChangeSearchQuery}
        >
      </p>
      <${description}>
      <${VirtualScrollList({
        assumedItemSize: 60,
        items: filteredSubscriptions,
        renderItem: renderSubscriptionItem,
        renderList: renderSubscriptionList,
      })}>
    </div>
  `;

  return MainLayout({
    header,
    content,
  });
});

function renderSubscriptionList(
  children: unknown,
  blankSpaces: BlankSpaces,
  elementRef: ElementRef,
  $: RenderContext,
): unknown {
  return $.html`
    <ul class="list-group" :ref=${elementRef}>
      <li :style=${{ height: blankSpaces.above + 'px' }}></li>
      <${children}>
      <li :style=${{ height: blankSpaces.below + 'px' }}></li>
    </ul>
  `;
}
