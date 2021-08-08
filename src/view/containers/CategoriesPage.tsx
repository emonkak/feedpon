import React, { PureComponent } from 'react';
import debounce from 'lodash.debounce';
import { RouteComponentProps } from 'react-router';
import { createSelector } from 'reselect';

import CategoriesNav from 'view/modules/CategoriesNav';
import Dropdown from 'view/components/Dropdown';
import EditCategoryForm from 'view/modules/EditCategoryForm';
import LazyList from 'view/components/LazyList';
import MainLayout from 'view/layouts/MainLayout';
import Navbar from 'view/components/Navbar';
import SubscriptionItem from 'view/modules/Subscription';
import bindActions from 'utils/flux/bindActions';
import connect from 'utils/flux/react/connect';
import createAscendingComparer from 'utils/createAscendingComparer';
import { Category, State, Subscription } from 'messaging/types';
import { MenuItem } from 'view/components/Menu';
import { UNCATEGORIZED } from 'messaging/categories/constants';
import { addToCategory, importOpml, removeFromCategory, unsubscribe } from 'messaging/subscriptions/actions';
import { createCategory, deleteCategory, updateCategory } from 'messaging/categories/actions';
import { createSortedCategoriesSelector } from 'messaging/categories/selectors';
import { toggleSidebar } from 'messaging/ui/actions';

interface CategoriesPageProps extends RouteComponentProps<{'label': string}> {
    activeCategory: Category | null;
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

interface CategoriesPageState {
    query: string;
}

class CategoriesPage extends PureComponent<CategoriesPageProps, CategoriesPageState> {
    private searchInput: HTMLInputElement | null = null;

    private uploadInput: HTMLInputElement | null = null;

    constructor(props: CategoriesPageProps) {
        super(props);

        this.state = {
            query: ''
        };
    }

    render() {
        return (
            <MainLayout header={this._renderNavbar()}>
                {this._renderContent()}
            </MainLayout>
        );
    }

    private _renderNavbar() {
        const { exportUrl, onToggleSidebar } = this.props;

        return (
            <Navbar onToggleSidebar={onToggleSidebar}>
                <h1 className="navbar-title">Organize subscriptions</h1>
                <Dropdown
                    toggleButton={
                        <button className="navbar-action">
                            <i className="icon icon-24 icon-menu-2" />
                        </button>
                    }>
                    <MenuItem
                        primaryText="Import OPML..."
                        onSelect={this._handleImport} />
                    <MenuItem
                        primaryText="Export OPML..."
                        href={exportUrl}
                        target="_blank" />
                </Dropdown>
                <input
                    ref={this._handleUploadInputRef}
                    className="u-none"
                    type="file"
                    onChange={this._handleChangeUploadFile} />
            </Navbar>
        );
    }

    private _renderContent() {
        const { activeCategory, categories, onDeleteCategory, match } = this.props;
        const label = match.params['label'];

        const subscriptions = this._getFilteredSubscriptions();

        const description = subscriptions.length > 0
            ? <p><strong>{subscriptions.length}</strong> subscriptions are available in this category.</p>
            : <p>There are no subscriptions in this category.</p>;

        return (
            <div className="container">
                <CategoriesNav
                    categories={categories}
                    label={label || UNCATEGORIZED}
                    onSelectCategory={this._handleSelectCategory} />
                {activeCategory &&
                    <EditCategoryForm
                        category={activeCategory}
                        onUpdate={this._handleUpdateCategory}
                        onDelete={onDeleteCategory} />}
                <h1 className="display-1">{label || 'Uncategorized'}</h1>
                <p>
                    <input
                        ref={this._handleSearchInputRef}
                        type="search"
                        className="form-control"
                        placeholder="Filter for subscriptions..."
                        onChange={this._handleChangeSearchQuery} />
                </p>
                {description}
                <LazyList
                    assumedItemHeight={60}
                    idAttribute="subscriptionId"
                    items={subscriptions}
                    renderItem={renderSubscriptionItem}
                    renderList={renderSubscriptionList} />
            </div>
        );
    }

    private _getFilteredSubscriptions() {
        const { query } = this.state;
        const { subscriptions } = this.props;

        const trimmedQuery = query.trim();

        if (trimmedQuery === '') {
            return subscriptions;
        }

        const splittedQueries = trimmedQuery.toLowerCase().split(/\s+/);

        return subscriptions
            .filter((subscription) => {
                const text = (subscription.title + ' ' + subscription.url).toLowerCase();
                return splittedQueries.every((query) => text.includes(query));
            });
    }

    private _handleChangeSearchQuery = debounce((event: React.ChangeEvent<HTMLInputElement>) => {
        if (!this.searchInput) {
            return;
        }

        this.setState({
            query: this.searchInput.value as string
        });
    }, 100);

    private _handleChangeUploadFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const target = event.currentTarget;
        if (!target.files) {
            return;
        }

        const file = target.files[0];
        if (!file) {
            return;
        }

        const { onImportOpml } = this.props;
        const reader = new FileReader();

        reader.onload = (event) => {
            onImportOpml(reader.result as string);
        };

        reader.readAsText(file);
    }

    private _handleUpdateCategory = (category: Category, newLabel: string) => {
        const { history, onUpdateCategory } = this.props;

        onUpdateCategory(category, newLabel);

        history.replace('/categories/' + encodeURIComponent(newLabel));
    }

    private _handleImport = () => {
        if (this.uploadInput) {
            this.uploadInput.click();
        }
    }

    private _handleSearchInputRef = (searchInput: HTMLInputElement | null) => {
        this.searchInput = searchInput;
    }

    private _handleSelectCategory = (label: string | symbol) => {
        const { history } = this.props;

        history.replace('/categories/' + (typeof label === 'string' ? encodeURIComponent(label) : ''));
    }

    private _handleUploadInputRef = (uploadInput: HTMLInputElement | null) => {
        this.uploadInput = uploadInput;
    }
}

const ConnectedSubscriptionItem = connect(() => {
    const categoriesSelector = createSortedCategoriesSelector();

    return {
        mapStateToProps: (state: State) => ({
            categories: categoriesSelector(state)
        }),
        mapDispatchToProps: bindActions({
            onAddToCategory: addToCategory,
            onRemoveFromCategory: removeFromCategory,
            onUnsubscribe: unsubscribe
        })
    };
})(SubscriptionItem);

function renderSubscriptionList(children: React.ReactNode, blankSpaceAbove: number, blankSpaceBelow: number): React.ReactElement<any> {
    return (
        <ul className="list-group">
            <div style={{ height: blankSpaceAbove }}></div>
            {children}
            <div style={{ height: blankSpaceBelow }}></div>
        </ul>
    );
}

function renderSubscriptionItem(subscription: Subscription) {
    return (
        <ConnectedSubscriptionItem
            key={subscription.subscriptionId}
            subscription={subscription} />
    );
}

export default connect(() => {
    const categoriesSelector = createSortedCategoriesSelector();
    const activeCategorySelector = createSelector(
        categoriesSelector,
        (state: State, props: CategoriesPageProps) => props.match.params['label'],
        (categories, label) => categories.find((category) => category.label === label) || null
    );

    const subscriptionIdComparer = createAscendingComparer<Subscription>('subscriptionId');
    const visibleSubscriptionsSelector = createSelector(
        (state: State) => state.subscriptions.items,
        (state: State, props: CategoriesPageProps) => props.match.params['label'],
        (subscriptions, label) => {
            if (label) {
                return Object.values(subscriptions)
                    .filter((subscription) => subscription.labels.includes(label))
                    .sort(subscriptionIdComparer);
            } else {
                return Object.values(subscriptions)
                    .filter((subscription) => subscription.labels.length === 0)
                    .sort(subscriptionIdComparer);
            }
        }
    );

    return {
        mapStateToProps: (state: State, props: CategoriesPageProps) => ({
            activeCategory: activeCategorySelector(state, props),
            categories: categoriesSelector(state),
            exportUrl: state.backend.exportUrl,
            subscriptions: visibleSubscriptionsSelector(state, props)
        }),
        mapDispatchToProps: bindActions({
            onCreateCategory: createCategory,
            onDeleteCategory: deleteCategory,
            onImportOpml: importOpml,
            onToggleSidebar: toggleSidebar,
            onUpdateCategory: updateCategory
        })
    };
})(CategoriesPage);
