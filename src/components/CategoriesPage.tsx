import React, { PureComponent } from 'react';
import { History } from 'history';
import { createSelector } from 'reselect';

import CategoriesNav from 'components/parts/CategoriesNav';
import EditCategoryForm from 'components/parts/EditCategoryForm';
import LazyList from 'components/parts/LazyList';
import MainLayout from 'components/layouts/MainLayout';
import Navbar from 'components/parts/Navbar';
import SubscriptionItem from 'components/parts/Subscription';
import bindActions from 'utils/flux/bindActions';
import connect from 'utils/flux/react/connect';
import debounceEventHandler from 'utils/debounceEventHandler';
import { Category, State, Subscription } from 'messaging/types';
import { Params } from 'react-router/lib/Router';
import { UNCATEGORIZED } from 'messaging/categories/constants';
import { addToCategory, removeFromCategory, unsubscribe } from 'messaging/subscriptions/actions';
import { createCategory, deleteCategory, updateCategory } from 'messaging/categories/actions';
import { createSortedCategoriesSelector } from 'messaging/categories/selectors';
import { subscriptionIdComparer } from 'messaging/subscriptions/selectors';

interface CategoriesPageProps {
    categories: Category[];
    onAddToCategory: typeof addToCategory;
    onUpdateCategory: typeof updateCategory;
    onCreateCategory: typeof createCategory;
    onDeleteCategory: typeof deleteCategory;
    onRemoveFromCategory: typeof removeFromCategory;
    onToggleSidebar: () => void;
    onUnsubscribe: typeof unsubscribe;
    params: Params;
    router: History;
    subscriptions: Subscription[];
}

interface CategoriesPageState {
    query: string;
}

class CategoriesPage extends PureComponent<CategoriesPageProps, CategoriesPageState> {
    private searchInput: HTMLInputElement | null;

    constructor(props: CategoriesPageProps, context: any) {
        super(props, context);

        this.handleSelectCategory = this.handleSelectCategory.bind(this);
        this.handleChangeSearchQuery = debounceEventHandler(this.handleChangeSearchQuery.bind(this), 100);

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

    handleSelectCategory(label: string | symbol) {
        const { router } = this.props;

        router.replace('/categories/' + (typeof label === 'string' ? encodeURIComponent(label) : ''));
    }

    handleChangeSearchQuery(event: React.ChangeEvent<any>) {
        if (!this.searchInput) {
            return;
        }

        this.setState({
            query: this.searchInput.value
        });
    }

    renderNavbar() {
        const { onToggleSidebar } = this.props;

        return (
            <Navbar onToggleSidebar={onToggleSidebar}>
                <h1 className="navbar-title">Organize subscriptions</h1>
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
                {category ? <EditCategoryForm category={category} onUpdateCategory={onUpdateCategory} onDeleteCategory={onDeleteCategory} /> : null}
                <h1 className="display-1">{label || 'Uncategorized'}</h1>
                {description}
                <p>
                    <input
                        ref={(ref) => this.searchInput = ref}
                        type="search"
                        className="form-control"
                        placeholder="Filter for subscriptions..."
                        onChange={this.handleChangeSearchQuery} />
                </p>
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
            subscriptions: visibleSubscriptionsSelector(state, props)
        }),
        mapDispatchToProps: bindActions({
            onUpdateCategory: updateCategory,
            onCreateCategory: createCategory,
            onDeleteCategory: deleteCategory,
        })
    }
})(CategoriesPage);
