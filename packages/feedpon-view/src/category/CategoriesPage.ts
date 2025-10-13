import { createComponent, type ElementRef, type RenderContext } from 'barebind';
import { type HistoryNavigator, RelativeURL } from 'barebind/extras/router';

import type { AppStore } from 'feedpon-store';
import * as subscriptionActions from 'feedpon-store/actions/subscription';
import * as uiActions from 'feedpon-store/actions/ui';
import { BindActionCreators } from 'feedpon-store/hooks/BindActionCreators';
import type { Subscription } from 'feedpon-store/state';

import { MainLayout } from '../layout/MainLayout.ts';
import { Dropdown } from '../primitives/Dropdown.ts';
import { Navbar } from '../primitives/Navbar.ts';
import { type TabItem, TabList } from '../primitives/TabList.ts';
import { debounce } from '../primitives/utils/debounce.ts';
import {
  type BlankSpaces,
  VirtualScrollList,
} from '../primitives/VirtualScrollList.ts';
import { SubscriptionView } from '../subscription/SubscriptionView.ts';
import { CategoryForm } from './CategoryForm.ts';

export interface CategoriesPageProps {
  label?: string;
  navigator: HistoryNavigator;
  store: AppStore;
}

export const CategoriesPage = createComponent(function CategoriesPage(
  { label, navigator, store }: CategoriesPageProps,
  $: RenderContext,
): unknown {
  const { state$ } = store;
  const categories = $.use(state$.get('unsortedCategories'));
  const subscriptions = $.use(state$.get('unsortedSubscriptions'));
  const { toggleSidebar } = $.use(BindActionCreators(uiActions));
  const {
    createCategory,
    deleteCategory,
    deleteSubscription,
    exportOpml,
    importOpml,
    updateCategory,
    updateSubscription,
  } = $.use(BindActionCreators(subscriptionActions));
  const [query, setQuery] = $.useState('');
  const searchInputRef = $.useRef<HTMLInputElement | null>(null);
  const uploadInputRef = $.useRef<HTMLInputElement | null>(null);

  const activeCategory = $.useMemo(
    () =>
      label !== undefined
        ? (categories.find((category) => category.label === label) ?? null)
        : null,
    [categories, label],
  );

  const selectedSubscriptions = $.useMemo(() => {
    return Object.values(subscriptions).filter(
      label !== undefined
        ? (subscription) =>
            subscription.categories.some((category) => category.label === label)
        : (subscription) => subscription.categories.length === 0,
    );
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
        onCategoryCreate: createCategory,
        onSubscriptionDelete: deleteSubscription,
        onSubscriptionUpdate: updateSubscription,
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
      importOpml(reader.result as string);
    };

    reader.readAsText(file);
  }, []);

  const handleCategoryDelete = $.useCallback(async (categoryId: string) => {
    await deleteCategory(categoryId);

    navigator.navigate(new RelativeURL('/categories/'), { replace: true });
  }, []);

  const handleCategoryUpdate = $.useCallback(
    async (categoryId: string, newLabel: string) => {
      await updateCategory(categoryId, newLabel);

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
        id: subscription.id,
        subscription,
      }));
    }

    const tokens = normalizedQuery.split(/\s+/);

    return selectedSubscriptions
      .filter((subscription) => {
        const input = (
          subscription.title +
          ' ' +
          subscription.website
        ).toLowerCase();
        return tokens.every((query) => input.includes(query));
      })
      .map((subscription) => ({
        id: subscription.id,
        subscription,
      }));
  }, [query, selectedSubscriptions]);

  const dropdown = Dropdown({
    trigger: ({ id, onMenuToggle, open }, context) => context.html`
          <button
            aria-expanded=${open.toString()}
            aria-label="Toggle menu"
            class="navbar-action"
            id=${id}
            type="button"
            @click=${onMenuToggle}
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
        onAction: exportOpml,
      },
    ],
  });

  const header = Navbar({
    onSidebarToggle: toggleSidebar,
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
        key: '',
        children: $.text`Uncategorized`,
        selected: label === undefined,
      } as TabItem,
    ].concat(
      categories.map((category) => ({
        key: category.label ?? '',
        children: $.text`${category.label}`,
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
              onCategoryUpdate: handleCategoryUpdate,
              onCategoryDelete: handleCategoryDelete,
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
