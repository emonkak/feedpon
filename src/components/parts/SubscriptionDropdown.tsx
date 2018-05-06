import React, { PureComponent } from 'react';
import classnames from 'classnames';

import ConfirmModal from 'components/widgets/ConfirmModal';
import Dropdown from 'components/widgets/Dropdown';
import Portal from 'components/widgets/Portal';
import { Category, Subscription } from 'messaging/types';
import { MenuForm, MenuItem } from 'components/widgets/Menu';

interface SubscriptionDropdownProps {
    categories: Category[];
    className?: string;
    onAddToCategory: (subscription: Subscription, label: string) => void;
    onCreateCategory: (label: string, callback: (category: Category) => void) => void;
    onRemoveFromCategory: (subscription: Subscription, label: string) => void;
    onUnsubscribe: (subscription: Subscription) => void;
    subscription: Subscription;
}

interface SubscriptionDropdownState {
    categoryLabel: string;
    unsubscribeModalIsOpened: boolean;
}

export default class SubscriptionDropdown extends PureComponent<SubscriptionDropdownProps, SubscriptionDropdownState> {
    constructor(props: SubscriptionDropdownProps) {
        super(props);

        this.state = {
            categoryLabel: '',
            unsubscribeModalIsOpened: false
        };

        this.handleAddToCategory = this.handleAddToCategory.bind(this);
        this.handleChangeCategoryLabel = this.handleChangeCategoryLabel.bind(this);
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

    handleChangeCategoryLabel(event: React.ChangeEvent<HTMLInputElement>) {
        const categoryLabel = event.currentTarget.value;

        this.setState({
            categoryLabel
        });
    }

    handleCloseUnsubscribeModal() {
        this.setState({
            unsubscribeModalIsOpened: false
        });
    }

    handleCreateCategory() {
        const { subscription, onAddToCategory, onCreateCategory } = this.props;
        const { categoryLabel } = this.state;

        onCreateCategory(categoryLabel, () => onAddToCategory(subscription, categoryLabel));

        this.setState({
            categoryLabel: ''
        });
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
        const { categories, className, subscription } = this.props;
        const { categoryLabel, unsubscribeModalIsOpened } = this.state;

        return <>
            <Dropdown
                className={className}
                toggleButton={
                    <button className="link-soft u-margin-left-2" disabled={subscription.isLoading}>
                        <i className={classnames('icon icon-20 icon-width-32', subscription.isLoading ? 'icon-spinner animation-rotating' : 'icon-menu-2' )} />
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
                            value={categoryLabel}
                            disabled={subscription.isLoading}
                            onChange={this.handleChangeCategoryLabel} />
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
            <Portal>
                <ConfirmModal
                    confirmButtonClassName="button button-negative"
                    confirmButtonLabel="Unsubscribe"
                    isOpened={unsubscribeModalIsOpened}
                    message="Are you sure you want to unsubscribe this feed?"
                    onClose={this.handleCloseUnsubscribeModal}
                    onConfirm={this.handleUnsubscribe}
                    title={`Unsubscribe "${subscription.title}"`} />
            </Portal>
        </>;
    }
}

