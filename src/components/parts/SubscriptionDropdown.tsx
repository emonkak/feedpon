import React, { PureComponent } from 'react';
import classnames from 'classnames';

import ConfirmModal from 'components/parts/ConfirmModal';
import Dropdown from 'components/parts/Dropdown';
import Portal from 'components/parts/Portal';
import { Category, Subscription } from 'messaging/types';
import { MenuItem, MenuForm } from 'components/parts/Menu';

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

export default class SubscriptionDropdown extends PureComponent<SubscriptionDropdownProps, SubscriptionDropdownState> {
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

