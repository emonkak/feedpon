import React, { PureComponent } from 'react';
import debounce from 'lodash.debounce';
import { History } from 'history';
import { createSelector } from 'reselect';

import CategoriesNav from 'components/parts/CategoriesNav';
import Dropdown from 'components/widgets/Dropdown';
import EditCategoryForm from 'components/parts/EditCategoryForm';
import LazyList from 'components/widgets/LazyList';
import MainLayout from 'components/layouts/MainLayout';
import Navbar from 'components/widgets/Navbar';
import SubscriptionItem from 'components/parts/Subscription';
import bindActions from 'utils/flux/bindActions';
import connect from 'utils/flux/react/connect';
import createAscendingComparer from 'utils/createAscendingComparer';
import { Category, State, Subscription } from 'messaging/types';
import { MenuItem } from 'components/widgets/Menu';
import { Params } from 'react-router/lib/Router';
import { UNCATEGORIZED } from 'messaging/categories/constants';
import { addToCategory, importOpml, removeFromCategory, unsubscribe } from 'messaging/subscriptions/actions';
import { createCategory, deleteCategory, updateCategory } from 'messaging/categories/actions';
import { createSortedCategoriesSelector } from 'messaging/categories/selectors';
import { toggleSidebar } from 'messaging/ui/actions';

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
    params: Params;
    router: History;
    subscriptions: Subscription[];
}

interface CategoriesPageState {
    query: string;
}

class CategoriesPage extends PureComponent<CategoriesPageProps, CategoriesPageState> {
    private searchInput: HTMLInputElement | null;

    private uploadInput: HTMLInputElement | null;

    constructor(props: CategoriesPageProps, context: any) {
        super(props, context);

        this.handleChangeSearchQuery = debounce(this.handleChangeSearchQuery.bind(this), 100);
        this.handleChangeUploadFile = this.handleChangeUploadFile.bind(this);
        this.handleImport = this.handleImport.bind(this);
        this.handleSearchInputRef = this.handleSearchInputRef.bind(this);
        this.handleSelectCategory = this.handleSelectCategory.bind(this);
        this.handleUploadInputRef = this.handleUploadInputRef.bind(this);

        this.state = {
            query: ''
        };
    }

    getFilteredSubscriptions() {
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
                return splittedQueries.every(query => text.includes(query));
            });
    }

    handleChangeSearchQuery(event: React.ChangeEvent<HTMLInputElement>) {
        if (!this.searchInput) {
            return;
        }

        this.setState({
            query: this.searchInput.value
        });
    }

    handleChangeUploadFile(event: React.ChangeEvent<HTMLInputElement>) {
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
            onImportOpml(reader.result);
        };

        reader.readAsText(file);
    }

    handleImport() {
        if (this.uploadInput) {
            this.uploadInput.click();
        }
    }

    handleSearchInputRef(searchInput: HTMLInputElement | null) {
        this.searchInput = searchInput;
    }

    handleSelectCategory(label: string | symbol) {
        const { router } = this.props;

        router.replace('/categories/' + (typeof label === 'string' ? encodeURIComponent(label) : ''));
    }

    handleUploadInputRef(uploadInput: HTMLInputElement | null) {
        this.uploadInput = uploadInput;
    }

    renderNavbar() {
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
                        onSelect={this.handleImport} />
                    <MenuItem
                        primaryText="Export OPML..."
                        href={exportUrl}
                        target="_blank" />
                </Dropdown>
                <input
                    ref={this.handleUploadInputRef}
                    className="u-none"
                    type="file"
                    onChange={this.handleChangeUploadFile} />
            </Navbar>
        );
    }

    renderContent() {
        const { categories, onUpdateCategory, onDeleteCategory, params } = this.props;

        const label = params['label'];
        const category = categories.find((category) => category.label === label);

        const subscriptions = this.getFilteredSubscriptions();

        const description = subscriptions.length > 0
            ? <p><strong>{subscriptions.length}</strong> subscriptions are available in this category.</p>
            : <p>There are no subscriptions in this category.</p>

        return (
            <div className="container">
                <CategoriesNav
                    categories={categories}
                    label={label || UNCATEGORIZED}
                    onSelectCategory={this.handleSelectCategory} />
                {category &&
                    <EditCategoryForm
                        category={category}
                        onUpdate={onUpdateCategory}
                        onDelete={onDeleteCategory} />}
                <h1 className="display-1">{label || 'Uncategorized'}</h1>
                <p>
                    <input
                        ref={(ref) => this.searchInput = ref}
                        type="search"
                        className="form-control"
                        placeholder="Filter for subscriptions..."
                        onChange={this.handleChangeSearchQuery} />
                </p>
                {description}
                <LazyList
                    assumedItemHeight={60}
                    getKey={getSubscriptionKey}
                    items={subscriptions}
                    renderItem={renderSubscriptionItem}
                    renderList={renderSubscriptionList} />
            </div>
        );
    }

    render() {
        return (
            <MainLayout header={this.renderNavbar()}>
                {this.renderContent()}
            </MainLayout>
        );
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
    }
})(SubscriptionItem);

function getSubscriptionKey(subscription: Subscription): string | number {
    return subscription.subscriptionId;
}

function renderSubscriptionList(children: React.ReactNode, aboveSpace: number, belowSpace: number): React.ReactElement<any> {
    return (
        <ul className="list-group" style={{ paddingTop: aboveSpace, paddingBottom: belowSpace }}>
            {children}
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
    const subscriptionIdComparer = createAscendingComparer<Subscription>('subscriptionId');
    const visibleSubscriptionsSelector = createSelector(
        (state: State) => state.subscriptions.items,
        (state: State, props: CategoriesPageProps) => props.params['label'],
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
    }
})(CategoriesPage);
