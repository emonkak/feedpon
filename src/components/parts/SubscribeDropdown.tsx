import React, { PureComponent } from 'react';

import ConfirmModal from 'components/widgets/ConfirmModal';
import Dropdown from 'components/widgets/Dropdown';
import Portal from 'components/widgets/Portal';
import SubscribeButton from 'components/parts/SubscribeButton';
import { Category, Feed, Subscription } from 'messaging/types';
import { MenuItem, MenuForm } from 'components/widgets/Menu';

interface SubscribeDropdownProps {
    categories: Category[];
    feed: Feed;
    onAddToCategory: (subscription: Subscription, label: string) => void;
    onCreateCategory: (label: string, callback: (category: Category) => void) => void;
    onRemoveFromCategory: (subscription: Subscription, label: string) => void;
    onSubscribe: (feed: Feed, labels: string[]) => void;
    onUnsubscribe: (subscription: Subscription) => void;
    subscription: Subscription | null;
}

interface SubscribeDropdownState {
    unsubscribeModalIsOpened: boolean;
}

export default class SubscribeDropdown extends PureComponent<SubscribeDropdownProps, SubscribeDropdownState> {
    private categoryLabelInput: HTMLInputElement | null;

    constructor(props: SubscribeDropdownProps, context: any) {
        super(props, context);

        this.state = {
            unsubscribeModalIsOpened: false
        };

        this.handleAddToCategory = this.handleAddToCategory.bind(this);
        this.handleCloseUnsubscribeModal = this.handleCloseUnsubscribeModal.bind(this);
        this.handleCreateCategory = this.handleCreateCategory.bind(this);
        this.handleOpenUnsubscribeModal = this.handleOpenUnsubscribeModal.bind(this);
        this.handleRemoveFromCategory = this.handleRemoveFromCategory.bind(this);
        this.handleSubscribe = this.handleSubscribe.bind(this);
        this.handleUnsubscribe = this.handleUnsubscribe.bind(this);
    }

    handleAddToCategory(label: string) {
        const { onAddToCategory, subscription } = this.props;

        if (subscription) {
            onAddToCategory(subscription, label);
        }
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

        const { feed, onAddToCategory, onCreateCategory, onSubscribe, subscription } = this.props;
        const label = this.categoryLabelInput.value;

        if (subscription) {
            onCreateCategory(label, () => onAddToCategory(subscription, label));
        } else {
            onCreateCategory(label, () => onSubscribe(feed, [label]));
        }

        this.categoryLabelInput.value = '';
    }

    handleOpenUnsubscribeModal() {
        this.setState({
            unsubscribeModalIsOpened: true
        });
    }

    handleRemoveFromCategory(label: string) {
        const { onRemoveFromCategory, subscription } = this.props;

        if (subscription) {
            onRemoveFromCategory(subscription, label);
        }
    }

    handleSubscribe(label: string) {
        const { feed, onSubscribe } = this.props;

        onSubscribe(feed, [label]);
    }

    handleUnsubscribe() {
        const { onUnsubscribe, subscription } = this.props;

        if (subscription) {
            onUnsubscribe(subscription);
        }
    }

    renderCategoryMenuItem(category: Category) {
        const { subscription } = this.props;

        if (subscription) {
            const isAdded = subscription.labels.includes(category.label);

            return (
                <MenuItem
                    value={category.label}
                    key={category.label}
                    icon={isAdded ? <i className="icon icon-16 icon-checkmark" /> : null}
                    onSelect={isAdded ? this.handleRemoveFromCategory : this.handleAddToCategory}
                    primaryText={category.label} />
            );
        } else {
            return (
                <MenuItem
                    value={category.label}
                    key={category.categoryId}
                    onSelect={this.handleSubscribe}
                    primaryText={category.label} />
            );
        }
    }

    render() {
        const { categories, feed, subscription } = this.props;
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
                    title={`Unsubscribe "${feed.title}"`} />
            }>
                <Dropdown
                    toggleButton={<SubscribeButton isSubscribed={!!subscription} isLoading={feed.isLoading} />}>
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
                                ref={(ref) => this.categoryLabelInput = ref} />
                            <button type="submit" className="button button-positive">OK</button>
                        </div>
                    </MenuForm>
                    <div className="menu-divider" />
                    <MenuItem
                        isDisabled={!subscription}
                        onSelect={this.handleOpenUnsubscribeModal}
                        primaryText="Unsubscribe..." />
                </Dropdown>
            </Portal>
        );
    }
}
