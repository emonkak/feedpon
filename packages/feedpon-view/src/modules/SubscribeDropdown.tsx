import React, { PureComponent } from 'react';

import ConfirmModal from '../components/ConfirmModal';
import Dropdown from '../components/Dropdown';
import Portal from '../components/Portal';
import SubscribeButton from './SubscribeButton';
import type { Category, Feed, Subscription } from 'feedpon-messaging';
import { MenuForm, MenuItem } from '../components/Menu';

interface SubscribeDropdownProps {
    categories: Category[];
    className?: string;
    feed: Feed;
    onAddToCategory: (subscription: Subscription, label: string) => void;
    onCreateCategory: (label: string, callback: (category: Category) => void) => void;
    onRemoveFromCategory: (subscription: Subscription, label: string) => void;
    onSubscribe: (feed: Feed, labels: string[]) => void;
    onUnsubscribe: (subscription: Subscription) => void;
    subscription: Subscription | null;
}

interface SubscribeDropdownState {
    categoryLabel: string;
    unsubscribeModalIsOpened: boolean;
}

export default class SubscribeDropdown extends PureComponent<SubscribeDropdownProps, SubscribeDropdownState> {
    constructor(props: SubscribeDropdownProps) {
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
        this.handleSubscribe = this.handleSubscribe.bind(this);
        this.handleUnsubscribe = this.handleUnsubscribe.bind(this);
    }

    handleAddToCategory(label: string) {
        const { onAddToCategory, subscription } = this.props;

        if (subscription) {
            onAddToCategory(subscription, label);
        }
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
        const { feed, onAddToCategory, onCreateCategory, onSubscribe, subscription } = this.props;
        const { categoryLabel } = this.state;

        if (subscription) {
            onCreateCategory(categoryLabel, () => onAddToCategory(subscription, categoryLabel));
        } else {
            onCreateCategory(categoryLabel, () => onSubscribe(feed, [categoryLabel]));
        }

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

    override render() {
        const { categories, className, feed, subscription } = this.props;
        const { categoryLabel, unsubscribeModalIsOpened } = this.state;

        return (
            <>
                <Dropdown
                    className={className}
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
                                value={categoryLabel}
                                onChange={this.handleChangeCategoryLabel} />
                            <button type="submit" className="button button-positive">OK</button>
                        </div>
                    </MenuForm>
                    <div className="menu-divider" />
                    <MenuItem
                        isDisabled={!subscription}
                        onSelect={this.handleOpenUnsubscribeModal}
                        primaryText="Unsubscribe..." />
                </Dropdown>
                <Portal>
                    <ConfirmModal
                        confirmButtonClassName="button button-negative"
                        confirmButtonLabel="Unsubscribe"
                        isOpened={unsubscribeModalIsOpened}
                        message="Are you sure you want to unsubscribe this feed?"
                        onClose={this.handleCloseUnsubscribeModal}
                        onConfirm={this.handleUnsubscribe}
                        title={`Unsubscribe "${feed.title}"`} />
                </Portal>
            </>
        );
    }
}
