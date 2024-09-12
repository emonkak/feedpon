import { type LocationActions, RelativeURL } from '@emonkak/ebit/router.js';
import { bindActions } from 'feedpon-flux';
import { useStore } from 'feedpon-flux/react';
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
import React, { useMemo, useRef, useState } from 'react';

import { ReactMainLayout } from '../common/MainLayout';
import { Dropdown } from '../common/components/Dropdown';
import { MenuItem } from '../common/components/Menu';
import { ReactNavbar } from '../common/components/Navbar';
import {
  type BlankSpaces,
  ReactVirtualScrollList,
} from '../common/components/VirtualScrollList';
import { useEvent } from '../common/hooks/useEvent';
import { CategoriesNav } from './CategoriesNav';
import { CategoryEditForm } from './CategoryEditForm';
import { SubscriptionView } from './SubscriptionView';

type Action = 'IMPORT_OPML' | 'EXPORT_OPML';

export interface CategoriesPageProps {
  label?: string;
  locationActions: LocationActions;
}

export function CategoriesPage({
  label,
  locationActions,
}: CategoriesPageProps) {
  const categoriesSelector = useMemo(
    () => createSortedCategoriesSelector(),
    [],
  );
  const subscriptionsSelector = useMemo(
    () => createAllSubscriptionsSelector(),
    [],
  );
  const {
    categories,
    exportUrl,
    onDeleteCategory,
    onImportOpml,
    onToggleSidebar,
    onUpdateCategory,
    subscriptions,
  } = useStore({
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
  });
  const [query, setQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);

  const activeCategory = useMemo(
    () => categories.find((category) => category.label === label) ?? null,
    [categories, label],
  );

  const selectedSubscriptions = useMemo(() => {
    return Object.values(subscriptions)
      .filter(
        label
          ? (subscription) => subscription.labels.includes(label)
          : (subscription) => subscription.labels.length === 0,
      )
      .sort(createAscendingComparer<Subscription>('subscriptionId'));
  }, [subscriptions, label]);

  const renderSubscriptionItem = useEvent(
    ({ subscription }: { id: string | number; subscription: Subscription }) => (
      <SubscriptionView
        categories={categories}
        key={subscription.subscriptionId}
        onAddToCategory={addToCategory}
        onCreateCategory={createCategory}
        onRemoveFromCategory={removeFromCategory}
        onUnsubscribe={unsubscribe}
        subscription={subscription}
      />
    ),
  );

  const handleChangeSearchQuery = useMemo(
    () =>
      debounce((_event: React.ChangeEvent<HTMLInputElement>) => {
        if (!searchInputRef.current) {
          return;
        }

        setQuery(searchInputRef.current.value);
      }, 100),
    [],
  );

  const handleChangeUploadFile = useEvent(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const target = event.currentTarget;
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
    },
  );

  const handleUpdateCategory = useEvent(
    (category: Category, newLabel: string) => {
      onUpdateCategory(category, newLabel);

      locationActions.navigate(
        new RelativeURL('/categories/' + encodeURIComponent(newLabel)),
        { replace: true },
      );
    },
  );

  const handleSelectAction = useEvent((action: Action) => {
    switch (action) {
      case 'IMPORT_OPML': {
        uploadInputRef.current?.click();
        break;
      }
      case 'EXPORT_OPML': {
        window.open(exportUrl, '_blank');
        break;
      }
    }
  });

  const handleSelectCategory = useEvent((label: string | symbol) => {
    locationActions.navigate(
      new RelativeURL(
        '/categories/' +
          (typeof label === 'string' ? encodeURIComponent(label) : ''),
      ),
      { replace: true },
    );
  });

  const filteredSubscriptions = useMemo(() => {
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

  const header = (
    <ReactNavbar onToggleSidebar={onToggleSidebar}>
      <h1 className="navbar-title">Organize subscriptions</h1>
      <Dropdown<Action>
        toggleButton={
          <button type="button" className="navbar-action">
            <i className="icon icon-24 icon-menu-2" />
          </button>
        }
        onSelect={handleSelectAction}
      >
        <MenuItem<Action> value="IMPORT_OPML" primaryText="Import OPML..." />
        <MenuItem<Action> value="EXPORT_OPML" primaryText="Export OPML..." />
      </Dropdown>
      <input
        ref={uploadInputRef}
        className="u-none"
        type="file"
        onChange={handleChangeUploadFile}
      />
    </ReactNavbar>
  );

  const description =
    selectedSubscriptions.length > 0 ? (
      <p>
        <strong>{selectedSubscriptions.length}</strong> subscriptions are
        available in this category.
      </p>
    ) : (
      <p>There are no subscriptions in this category.</p>
    );

  return (
    <ReactMainLayout header={header}>
      <div className="container">
        <CategoriesNav
          categories={categories}
          label={label ?? UNCATEGORIZED}
          onSelectCategory={handleSelectCategory}
        />
        {activeCategory && (
          <CategoryEditForm
            category={activeCategory}
            onUpdate={handleUpdateCategory}
            onDelete={onDeleteCategory}
          />
        )}
        <h1 className="display-1">{label ?? 'Uncategorized'}</h1>
        <p>
          <input
            ref={searchInputRef}
            type="search"
            className="form-control"
            placeholder="Filter for subscriptions..."
            onChange={handleChangeSearchQuery}
          />
        </p>
        {description}
        <ReactVirtualScrollList
          assumedItemSize={60}
          items={filteredSubscriptions}
          renderItem={renderSubscriptionItem}
          renderList={renderSubscriptionList}
        />
      </div>
    </ReactMainLayout>
  );
}

function renderSubscriptionList(
  children: React.ReactNode,
  blankSpaces: BlankSpaces,
): React.ReactElement<any> {
  return (
    <ul className="list-group">
      <div style={{ height: blankSpaces.above }} />
      {children}
      <div style={{ height: blankSpaces.below }} />
    </ul>
  );
}
