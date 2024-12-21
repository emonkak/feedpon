import { type LocationActions, RelativeURL } from '@emonkak/ebit/router.js';
import { bindActions } from 'feedpon-flux';
import type { Category, State, Subscription } from 'feedpon-messaging';
import {
  UNCATEGORIZED,
  createCategory,
  createSortedCategoriesSelector,
  deleteCategory,
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
import createAscendingComparer from 'feedpon-utils/createAscendingComparer';
import debounce from 'feedpon-utils/debounce';

import type { RenderContext, TemplateResult } from '@emonkak/ebit';
import {
  type ElementRef,
  component,
  optional,
  ref,
  styleMap,
} from '@emonkak/ebit/directives.js';
import { getStoreHook } from 'feedpon-flux/ebit';
import { Navbar } from '../common/components/Navbar';
import {
  type BlankSpaces,
  VirtualScrollList,
} from '../common/components/VirtualScrollList';
import { MainLayout } from '../layouts/MainLayout';
import { Dropdown } from '../primitives/Dropdown';
import { type TabItem, TabList } from '../primitives/TabList';
import { SubscriptionView } from '../subscription/SubscriptionView';
import { CategoryEdit } from './CategoryEdit';

export interface CategoriesPageProps {
  label?: string;
  locationActions: LocationActions;
}

export function CategoriesPage(
  { label, locationActions }: CategoriesPageProps,
  context: RenderContext,
): TemplateResult {
  const categoriesSelector = context.useMemo(
    () => createSortedCategoriesSelector(),
    [],
  );
  const subscriptionsSelector = context.useMemo(
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
  } = context.use(
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
  const [query, setQuery] = context.useState('');
  const searchInputRef = context.useRef<HTMLInputElement | null>(null);
  const uploadInputRef = context.useRef<HTMLInputElement | null>(null);

  const activeCategory = context.useMemo(
    () => categories.find((category) => category.label === label) ?? null,
    [categories, label],
  );

  const selectedSubscriptions = context.useMemo(() => {
    return Object.values(subscriptions)
      .filter(
        label
          ? (subscription) => subscription.labels.includes(label)
          : (subscription) => subscription.labels.length === 0,
      )
      .sort(createAscendingComparer<Subscription>('subscriptionId'));
  }, [subscriptions, label]);

  const renderSubscriptionItem = context.useCallback(
    (
      { subscription }: { id: string | number; subscription: Subscription },
      _index: number,
      _ref: ElementRef,
      _context: RenderContext,
    ) =>
      component(SubscriptionView, {
        categories,
        onAddToCategory,
        onCreateCategory,
        onRemoveFromCategory,
        onUnsubscribe,
        subscription,
      }),
    [categories],
  );

  const handleChangeSearchQuery = context.useMemo(
    () =>
      debounce((_event: Event) => {
        if (!searchInputRef.current) {
          return;
        }

        setQuery(searchInputRef.current.value);
      }, 100),
    [],
  );

  const handleChangeUploadFile = context.useCallback((event: Event) => {
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

  const handleUpdateCategory = context.useCallback(
    (category: Category, newLabel: string) => {
      onUpdateCategory(category, newLabel);

      locationActions.navigate(
        new RelativeURL('/categories/' + encodeURIComponent(newLabel)),
        { replace: true },
      );
    },
    [],
  );

  const handleImportOpml = context.useCallback(() => {
    uploadInputRef.current?.click();
  }, []);

  const handleExportOpml = context.useCallback(() => {
    window.open(exportUrl, '_blank');
  }, [exportUrl]);

  const handleSelectCategory = context.useCallback(
    (_event: Event, key: string) => {
      locationActions.navigate(
        new RelativeURL('/categories/' + encodeURIComponent(key)),
        { replace: true },
      );
    },
    [],
  );

  const filteredSubscriptions = context.useMemo(() => {
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

  const dropdown = component(Dropdown, {
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
        children: context.html`
          <div class="MenuItem-content">Import OPML...</div>
        `,
        onAction: handleImportOpml,
      },
      {
        type: 'button',
        key: 'export_opml',
        children: context.html`
          <div class="MenuItem-content">Export OPML...</div>
        `,
        onAction: handleExportOpml,
      },
    ],
  });

  const header = component(Navbar, {
    onToggleSidebar,
    children: context.html`
      <h1 class="navbar-title">Organize subscriptions</h1>
      <${dropdown}>
      <input
        class="u-none"
        ref=${ref(uploadInputRef)}
        type="file"
        @change=${handleChangeUploadFile}
      >
    `,
  });

  const tabList = component(TabList, {
    items: [
      {
        key: UNCATEGORIZED,
        children: context.html`Uncategorized`,
        selected: label === UNCATEGORIZED,
      } as TabItem,
    ].concat(
      categories.map((category) => ({
        key: category.label,
        children: context.html`${category.label}`,
        selected: label === category.label,
      })),
    ),
    onTabSelect: handleSelectCategory,
  });

  // biome-ignore format:
  const description =
    selectedSubscriptions.length > 0 ? context.html`
      <p>
        <strong>${selectedSubscriptions.length}</strong> subscriptions are
        available in this category.
      </p>
    ` : context.html`<p>There are no subscriptions in this category.</p>`;

  const content = context.html`
    <div class="container">
      <${tabList}>
      <${optional(
        activeCategory !== null
          ? component(CategoryEdit, {
              category: activeCategory,
              onCategoryUpdate: handleUpdateCategory,
              onCategoryDelete: onDeleteCategory,
            })
          : null,
      )}>
      <h1 class="display-1">${label ?? 'Uncategorized'}</h1>
      <p>
        <input
          ref=${ref(searchInputRef)}
          type="search"
          class="form-control"
          placeholder="Filter for subscriptions..."
          @change=${handleChangeSearchQuery}
        >
      </p>
      <${description}>
      <${component(
        VirtualScrollList<
          { id: string | number; subscription: Subscription },
          unknown
        >,
        {
          assumedItemSize: 60,
          items: filteredSubscriptions,
          renderItem: renderSubscriptionItem,
          renderList: renderSubscriptionList,
        },
      )}>
    </div>
  `;

  return context.html`<${component(MainLayout, {
    header,
    content,
  })}>`;
}

function renderSubscriptionList(
  children: unknown,
  blankSpaces: BlankSpaces,
  elementRef: ElementRef,
  context: RenderContext,
): TemplateResult {
  return context.html`
    <ul class="list-group" ref=${ref(elementRef)}>
      <li style=${styleMap({ height: blankSpaces.above + 'px' })}></li>
      <${children}>
      <li style=${styleMap({ height: blankSpaces.below + 'px' })}></li>
    </ul>
  `;
}
