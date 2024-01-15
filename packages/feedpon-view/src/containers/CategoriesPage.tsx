import React, { useMemo, useRef, useState } from 'react';
import { useParams, useHistory } from 'react-router';

import { bindActions } from 'feedpon-flux';
import connect from 'feedpon-flux/react/connect';
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
import Dropdown from '../components/Dropdown';
import { MenuItem } from '../components/Menu';
import Navbar from '../components/Navbar';
import VirtualList, { BlankSpaces } from '../components/VirtualList';
import MainLayout from '../layouts/MainLayout';
import CategoriesNav from '../modules/CategoriesNav';
import EditCategoryForm from '../modules/EditCategoryForm';
import SubscriptionItem from '../modules/Subscription';
import useEvent from '../hooks/useEvent';

type Action = 'IMPORT_OPML' | 'EXPORT_OPML';

interface CategoriesPageProps {
  categories: Category[];
  exportUrl: string;
  onAddToCategory: typeof addToCategory;
  onCreateCategory: typeof createCategory;
  onDeleteCategory: typeof deleteCategory;
  onImportOpml: typeof importOpml;
  onRemoveFromCategory: typeof removeFromCategory;
  onToggleSidebar: typeof toggleSidebar;
  onUnsubscribe: typeof unsubscribe;
  onUpdateCategory: typeof updateCategory;
  subscriptions: Subscription[];
}

function CategoriesPage({
  categories,
  exportUrl,
  onDeleteCategory,
  onImportOpml,
  onToggleSidebar,
  onUpdateCategory,
  subscriptions,
}: CategoriesPageProps) {
  const [query, setQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);

  const history = useHistory();
  const params = useParams<{ label: string }>();

  const activeCategory = useMemo(
    () =>
      categories.find((category) => category.label === params.label) ?? null,
    [categories, params.label],
  );

  const selectedSubscriptions = useMemo(() => {
    return Object.values(subscriptions)
      .filter(
        params.label
          ? (subscription) => subscription.labels.includes(params.label)
          : (subscription) => subscription.labels.length === 0,
      )
      .sort(createAscendingComparer<Subscription>('subscriptionId'));
  }, [subscriptions, params.label]);

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

  const handleChangeUploadFile = useEvent((
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
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
  });

  const handleUpdateCategory = useEvent(
    (category: Category, newLabel: string) => {
      onUpdateCategory(category, newLabel);

      history.replace('/categories/' + encodeURIComponent(newLabel));
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
    history.replace(
      '/categories/' +
        (typeof label === 'string' ? encodeURIComponent(label) : ''),
    );
  });

  const filteredSubscriptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (normalizedQuery === '') {
      return selectedSubscriptions;
    }

    const tokens = normalizedQuery.split(/\s+/);

    return selectedSubscriptions.filter((subscription) => {
      const input = (subscription.title + ' ' + subscription.url).toLowerCase();
      return tokens.every((query) => input.includes(query));
    });
  }, [query, selectedSubscriptions]);

  const header = (
    <Navbar onToggleSidebar={onToggleSidebar}>
      <h1 className="navbar-title">Organize subscriptions</h1>
      <Dropdown<Action>
        toggleButton={
          <button className="navbar-action">
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
    </Navbar>
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
    <MainLayout header={header}>
      <div className="container">
        <CategoriesNav
          categories={categories}
          label={params.label ?? UNCATEGORIZED}
          onSelectCategory={handleSelectCategory}
        />
        {activeCategory && (
          <EditCategoryForm
            category={activeCategory}
            onUpdate={handleUpdateCategory}
            onDelete={onDeleteCategory}
          />
        )}
        <h1 className="display-1">{params.label ?? 'Uncategorized'}</h1>
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
        <VirtualList
          assumedItemSize={60}
          idAttribute="subscriptionId"
          items={filteredSubscriptions}
          renderItem={renderSubscriptionItem}
          renderList={renderSubscriptionList}
        />
      </div>
    </MainLayout>
  );
}

const ConnectedSubscriptionItem = connect(() => {
  const categoriesSelector = createSortedCategoriesSelector();

  return {
    mapStateToProps: (state: State) => ({
      categories: categoriesSelector(state),
    }),
    mapDispatchToProps: bindActions({
      onAddToCategory: addToCategory,
      onRemoveFromCategory: removeFromCategory,
      onUnsubscribe: unsubscribe,
    }),
  };
})(SubscriptionItem);

function renderSubscriptionList(
  children: React.ReactNode,
  blankSpaces: BlankSpaces,
): React.ReactElement<any> {
  return (
    <ul className="list-group">
      <div style={{ height: blankSpaces.above }}></div>
      {children}
      <div style={{ height: blankSpaces.below }}></div>
    </ul>
  );
}

function renderSubscriptionItem(subscription: Subscription) {
  return (
    <ConnectedSubscriptionItem
      key={subscription.subscriptionId}
      subscription={subscription}
    />
  );
}

export default connect(() => {
  const categoriesSelector = createSortedCategoriesSelector();
  const subscriptionsSelector = createAllSubscriptionsSelector();

  return {
    mapStateToProps: (state: State) => ({
      categories: categoriesSelector(state),
      exportUrl: state.backend.exportUrl,
      subscriptions: subscriptionsSelector(state),
    }),
    mapDispatchToProps: bindActions({
      onCreateCategory: createCategory,
      onDeleteCategory: deleteCategory,
      onImportOpml: importOpml,
      onToggleSidebar: toggleSidebar,
      onUpdateCategory: updateCategory,
    }),
  };
})(CategoriesPage);
