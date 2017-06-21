import React, { PureComponent } from 'react';
import classnames from 'classnames';
import { History } from 'history';
import { createSelector } from 'reselect';

import ConfirmModal from 'components/parts/ConfirmModal';
import Dropdown from 'components/parts/Dropdown';
import LazyList from 'components/parts/LazyList';
import MainLayout from 'components/layouts/MainLayout';
import ModalButton from 'components/parts/ModalButton';
import Navbar from 'components/parts/Navbar';
import Portal from 'components/parts/Portal';
import RelativeTime from 'components/parts/RelativeTime';
import SubscriptionIcon from 'components/parts/SubscriptionIcon';
import bindActions from 'utils/flux/bindActions';
import connect from 'utils/flux/react/connect';
import createAscendingComparer from 'utils/createAscendingComparer';
import debounceEventHandler from 'utils/debounceEventHandler';
import { Category, State, Subscription } from 'messaging/types';
import { MenuItem, MenuForm } from 'components/parts/Menu';
import { Nav, NavItem } from 'components/parts/Nav';
import { Params } from 'react-router/lib/Router';
import { addToCategory, removeFromCategory, unsubscribe } from 'messaging/subscriptions/actions';
import { createCategory, deleteCategory, updateCategory } from 'messaging/categories/actions';

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

const UNCATEGORIZED = Symbol();

const categoriesComparer = createAscendingComparer<Category>('categoryId');
const subscirptionComparer = createAscendingComparer<Subscription>('subscriptionId');

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

    getVisibleSubscriptions() {
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
        const { query } = this.state;

        const label = params['label'];
        const category = categories.find((category) => category.label === label);

        const subscriptions = this.getVisibleSubscriptions();

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
                        placeholder="Search for subscriptions..."
                        onChange={this.handleChangeSearchQuery}
                        value={query} />
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

interface SubscriptionItemProps {
    categories: Category[];
    onAddToCategory: typeof addToCategory;
    onCreateCategory: typeof createCategory;
    onRemoveFromCategory: typeof removeFromCategory;
    onUnsubscribe: typeof unsubscribe;
    subscription: Subscription;
}

const SubscriptionItem: React.SFC<SubscriptionItemProps> = ({
    categories,
    onAddToCategory,
    onCreateCategory,
    onRemoveFromCategory,
    onUnsubscribe,
    subscription
}) => {
    const title = subscription.url
        ? <a className="link-soft" target="_blank" href={subscription.url}>{subscription.title}</a>
        : <span>{subscription.title}</span>;

    const labels = subscription.labels
        .map((label) => <span key={label} className="badge badge-small badge-default">{label}</span>);

    return (
        <li className="list-group-item">
            <div className="u-flex u-flex-align-items-center">
                <SubscriptionIcon className="u-flex-shrink-0 u-margin-right-2" title={subscription.title} iconUrl={subscription.iconUrl} />
                <div className="u-flex-grow-1 u-margin-right-2">
                    <div>{title}{labels}</div>
                    <div className="u-text-small u-text-wrap"><a target="_blank" href={subscription.feedUrl}>{subscription.feedUrl}</a></div>
                </div>
                <div className="u-margin-right-2 u-text-right u-sm-none">
                    <RelativeTime className="u-text-small u-text-muted" time={subscription.updatedAt} />
                </div>
                <SubscriptionDropdown
                    categories={categories}
                    onAddToCategory={onAddToCategory}
                    onCreateCategory={onCreateCategory}
                    onRemoveFromCategory={onRemoveFromCategory}
                    onUnsubscribe={onUnsubscribe}
                    subscription={subscription} />
            </div>
        </li>
    );
}

interface SubscriptionDropdownProps {
    categories: Category[];
    subscription: Subscription;
    onAddToCategory: (subscription: Subscription, label: string) => void;
    onCreateCategory: (label: string, callback: (category: Category) => void) => void;
    onRemoveFromCategory: (subscription: Subscription, label: string) => void;
    onUnsubscribe: (subscription: Subscription) => void;
}

interface SubscriptionDropdownState {
    unsubscribeModalIsOpened: boolean;
}

class SubscriptionDropdown extends PureComponent<SubscriptionDropdownProps, SubscriptionDropdownState> {
    private categoryLabelInput: HTMLInputElement | null;

    constructor(props: SubscriptionDropdownProps, context: any) {
        super(props, context);

        this.state = {
            unsubscribeModalIsOpened: false
        };

        this.handleAddToCategory = this.handleAddToCategory.bind(this);
        this.handleCloseUnsubscribeModal = this.handleCloseUnsubscribeModal.bind(this);
        this.handleCreateCategory = this.handleCreateCategory.bind(this);
        this.handleOpenUnsubscribeModal = this.handleOpenUnsubscribeModal.bind(this);
        this.handleRemoveFromCategory = this.handleRemoveFromCategory.bind(this);
        this.handleUnsubscribe = this.handleUnsubscribe.bind(this);
    }

    handleAddToCategory(label: string) {
        const { subscription, onAddToCategory } = this.props;

        onAddToCategory(subscription, label);
    }

    handleCloseUnsubscribeModal() {
        this.setState({
            unsubscribeModalIsOpened: false
        });
    }

    handleCreateCategory() {
        if (!this.categoryLabelInput) {
            return;
        }

        const { subscription, onAddToCategory, onCreateCategory } = this.props;
        const label = this.categoryLabelInput.value;

        onCreateCategory(label, () => onAddToCategory(subscription, label));

        this.categoryLabelInput.value = '';
    }

    handleOpenUnsubscribeModal() {
        this.setState({
            unsubscribeModalIsOpened: true
        });
    }

    handleRemoveFromCategory(label: string) {
        const { subscription, onRemoveFromCategory } = this.props;

        if (subscription) {
            onRemoveFromCategory(subscription, label);
        }
    }

    handleUnsubscribe() {
        const { subscription, onUnsubscribe } = this.props;

        onUnsubscribe(subscription);
    }

    renderCategoryMenuItem(category: Category) {
        const { subscription } = this.props;

        const isAdded = subscription.labels.includes(category.label);

        return (
            <MenuItem
                icon={isAdded ? <i className="icon icon-16 icon-checkmark" /> : null}
                isDisabled={subscription.isLoading}
                key={category.categoryId}
                onSelect={isAdded ? this.handleRemoveFromCategory : this.handleAddToCategory}
                primaryText={category.label}
                value={category.label} />
        );
    }

    render() {
        const { categories, subscription } = this.props;
        const { unsubscribeModalIsOpened } = this.state;

        return (
            <Portal overlay={
                <ConfirmModal
                    confirmButtonClassName="button button-negative"
                    confirmButtonLabel="Unsubscribe"
                    isOpened={unsubscribeModalIsOpened}
                    message="Are you sure you want to unsubscribe this feed?"
                    onClose={this.handleCloseUnsubscribeModal}
                    onConfirm={this.handleUnsubscribe}
                    title={`Unsubscribe "${subscription.title}"`} />
            }>
                <Dropdown
                    toggleButton={
                        <button className="button-icon button-icon-24 u-margin-left-2" disabled={subscription.isLoading}>
                            <i className={classnames('icon icon-20', subscription.isLoading ? 'icon-spinner icon-rotating' : 'icon-menu-2' )} />
                        </button>
                    }>
                    <div className="menu-heading">Category</div>
                    {categories.map(this.renderCategoryMenuItem, this)}
                    <div className="menu-divider" />
                    <div className="menu-heading">New category</div>
                    <MenuForm onSubmit={this.handleCreateCategory}>
                        <div className="input-group">
                            <input
                                type="text"
                                className="form-control"
                                style={{ width: '12rem' }}
                                ref={(ref) => this.categoryLabelInput = ref}
                                disabled={subscription.isLoading} />
                            <button
                                type="submit"
                                className="button button-positive"
                                disabled={subscription.isLoading}>
                                OK
                            </button>
                        </div>
                    </MenuForm>
                    <div className="menu-divider" />
                    <MenuItem
                        onSelect={this.handleOpenUnsubscribeModal}
                        primaryText="Unsubscribe..."
                        isDisabled={subscription.isLoading} />
                </Dropdown>
            </Portal>
        );
    }
}

const ConnectedSubscriptionItem = connect(() => {
    const categoriesSelector = createSelector(
        (state: State) => state.categories.items,
        (categories) => Object.values(categories).sort(categoriesComparer)
    );

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

interface CategoriesNavProps {
    categories: Category[];
    label: string | symbol;
    onSelectCategory: (label: string) => void;
}

class CategoriesNav extends PureComponent<CategoriesNavProps, {}> {
    render() {
        const { categories, label, onSelectCategory } = this.props;

        return (
            <Nav onSelect={onSelectCategory}>
                <NavItem
                    value={UNCATEGORIZED}
                    isSelected={label === UNCATEGORIZED}>
                    Uncategorized
                </NavItem>
                {categories.map((category) =>
                    <NavItem
                        key={category.categoryId}
                        value={category.label}
                        isSelected={label === category.label}>
                        {category.label}
                    </NavItem>
                )}
            </Nav>
        );
    }
}

interface EditCategoryFormProps {
    category: Category;
    onDeleteCategory: typeof deleteCategory;
    onUpdateCategory: typeof updateCategory;
}

interface EditCategoryFormState {
    label: string;
}

class EditCategoryForm extends PureComponent<EditCategoryFormProps, EditCategoryFormState> {
    constructor(props: EditCategoryFormProps, context: any) {
        super(props, context);

        this.handleChangeCategory = this.handleChangeCategory.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleUpdate = this.handleUpdate.bind(this);

        this.state = {
            label: props.category.label
        };
    }

    componentWillReceiveProps(nextProps: EditCategoryFormProps) {
        if (this.props.category.label !== nextProps.category.label) {
            this.setState({
                label: nextProps.category.label
            })
        }
    }

    handleDelete() {
        const { category, onDeleteCategory } = this.props;

        onDeleteCategory(category.categoryId, category.label);
    }

    handleUpdate() {
        const { category, onUpdateCategory } = this.props;
        const { label } = this.state;

        onUpdateCategory(category, label);
    }

    handleChangeCategory(event: React.ChangeEvent<HTMLInputElement>) {
        this.setState({
            label: event.currentTarget.value
        });
    }

    render() {
        const { category } = this.props;
        const { label } = this.state;

        return (
            <div className="form">
                <div className="form-legend">Edit Category</div>
                <div className="input-group">
                    <input
                        onChange={this.handleChangeCategory}
                        type="text"
                        className="form-control"
                        value={label}
                        required />
                    <ModalButton
                        modal={
                            <ConfirmModal
                                message="Are you sure you want to change label of this category?"
                                confirmButtonClassName="button button-positive"
                                confirmButtonLabel="Rename"
                                onConfirm={this.handleUpdate}
                                title={`Rename "${category.label}" to "${label}"`} />
                        }
                        button={
                            <button
                                className="button button-positive"
                                disabled={category.isLoading || label === '' || label === category.label}>
                                Rename
                            </button>
                        } />
                    <ModalButton
                        modal={
                            <ConfirmModal
                                message="Are you sure you want to delete this category?"
                                confirmButtonClassName="button button-negative"
                                confirmButtonLabel="Delete"
                                onConfirm={this.handleDelete}
                                title={`Delete "${category.label}"`} />
                        }
                        button={
                            <button
                                className="button button-negative"
                                disabled={category.isLoading}>
                                Delete
                            </button>
                        } />
                </div>
            </div>
        );
    }
}

export default connect(() => {
    const categoriesSelector = createSelector(
        (state: State) => state.categories.items,
        (categories) => Object.values(categories).sort(categoriesComparer)
    );

    const subscriptionsSelector = createSelector(
        (state: State) => state.subscriptions.items,
        (subscriptions) => Object.values(subscriptions).sort(subscirptionComparer)
    );

    const visibleSubscriptionsSelector = createSelector(
        subscriptionsSelector,
        (state: State, props: CategoriesPageProps) => props.params['label'],
        (subscriptions, label) => {
            if (label) {
                return subscriptions
                    .filter((subscription) => subscription.labels.includes(label));
            } else {
                return subscriptions
                    .filter((subscription) => subscription.labels.length === 0);
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
