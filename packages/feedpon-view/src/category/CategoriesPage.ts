import { createComponent, html, type Ref, text } from 'barebind';
import { NavigationContext } from 'barebind/addons/router';
import { AppStore, type Subscription } from 'feedpon-store';
import * as subscriptionActions from 'feedpon-store/actions/subscription';
import * as uiActions from 'feedpon-store/actions/ui';
import { BindActionCreators } from 'store';

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
}

export const CategoriesPage = createComponent<CategoriesPageProps>(
  function CategoriesPage({ label }) {
    const { state$ } = this.use(AppStore);
    const { adapter: navigator } = this.inject(NavigationContext);
    const categories = this.use(state$.get('unsortedCategories'));
    const subscriptions = this.use(state$.get('unsortedSubscriptions'));
    const { toggleSidebar } = this.use(BindActionCreators(AppStore, uiActions));
    const {
      createCategory,
      deleteCategory,
      deleteSubscription,
      exportOpml,
      importOpml,
      updateCategory,
      updateSubscription,
    } = this.use(BindActionCreators(AppStore, subscriptionActions));
    const [query, setQuery] = this.useState('');
    const searchInputRef = this.useRef<HTMLInputElement | null>(null);
    const uploadInputRef = this.useRef<HTMLInputElement | null>(null);

    const activeCategory = this.useMemo(
      () =>
        label !== undefined
          ? (categories.find((category) => category.label === label) ?? null)
          : null,
      [categories, label],
    );

    const selectedSubscriptions = this.useMemo(() => {
      return Object.values(subscriptions).filter(
        label !== undefined
          ? (subscription) =>
              subscription.categories.some(
                (category) => category.label === label,
              )
          : (subscription) => subscription.categories.length === 0,
      );
    }, [subscriptions, label]);

    const renderSubscriptionItem = this.useCallback(
      (
        { subscription }: { id: string | number; subscription: Subscription },
        _index: number,
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

    const handleChangeSearchQuery = this.useMemo(
      () =>
        debounce((_event: Event) => {
          if (!searchInputRef.current) {
            return;
          }

          setQuery(searchInputRef.current.value);
        }, 100),
      [],
    );

    const handleChangeUploadFile = this.useCallback((event: Event) => {
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

    const handleCategoryDelete = this.useCallback(
      async (categoryId: string) => {
        await deleteCategory(categoryId);

        navigator.navigate('/categories/');
      },
      [],
    );

    const handleCategoryUpdate = this.useCallback(
      async (categoryId: string, newLabel: string) => {
        await updateCategory(categoryId, newLabel);

        navigator.navigate('/categories/' + encodeURIComponent(newLabel));
      },
      [],
    );

    const handleImportOpml = this.useCallback(() => {
      uploadInputRef.current?.click();
    }, []);

    const handleSelectCategory = this.useCallback(
      (_event: Event, key: string) => {
        navigator.navigate('/categories/' + encodeURIComponent(key));
      },
      [],
    );

    const filteredSubscriptions = this.useMemo(() => {
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
      trigger: ({ id, onMenuToggle, open }) => html`
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
          children: html`
            <div class="MenuItem-content">Import OPML...</div>
          `,
          onAction: handleImportOpml,
        },
        {
          type: 'button',
          key: 'export_opml',
          children: html`
            <div class="MenuItem-content">Export OPML...</div>
          `,
          onAction: exportOpml,
        },
      ],
    });

    const header = Navbar({
      onSidebarToggle: toggleSidebar,
      children: html`
        <h1 class="navbar-title">Organize subscriptions</h1>
        <${dropdown}>
        <input
          class="u-none"
          type="file"
          @change=${handleChangeUploadFile}
          ${uploadInputRef}
        >
      `,
    });

    const tabList = TabList({
      items: [
        {
          key: '',
          children: text`Uncategorized`,
          selected: label === undefined,
        } as TabItem,
      ].concat(
        categories.map((category) => ({
          key: category.label ?? '',
          children: text`${category.label}`,
          selected: label === category.label,
        })),
      ),
      onTabSelect: handleSelectCategory,
    });

    const description =
      selectedSubscriptions.length > 0
        ? html`
          <p>
            <strong>${selectedSubscriptions.length}</strong> subscriptions are
            available in this category.
          </p>
        `
        : html`<p>There are no subscriptions in this category.</p>`;

    const content = html`
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
            type="search"
            class="form-control"
            placeholder="Filter for subscriptions..."
            @change=${handleChangeSearchQuery}
            ${searchInputRef}
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
  },
);

function renderSubscriptionList(
  children: unknown,
  blankSpaces: BlankSpaces,
  elementRef: Ref<Element | null>,
): unknown {
  return html`
    <ul class="list-group" ${elementRef}>
      <li style=${{ height: blankSpaces.above + 'px' }}></li>
      <${children}>
      <li style=${{ height: blankSpaces.below + 'px' }}></li>
    </ul>
  `;
}
