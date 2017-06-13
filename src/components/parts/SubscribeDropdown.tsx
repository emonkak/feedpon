import React, { PureComponent } from 'react';
import classnames from 'classnames';

import Dropdown from 'components/parts/Dropdown';
import { Category, Feed, Subscription } from 'messaging/types';
import { MenuForm, MenuItem } from 'components/parts/Menu';

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

export default class SubscribeDropdown extends PureComponent<SubscribeDropdownProps, {}> {
    private categoryLabelInput: HTMLInputElement;

    constructor(props: SubscribeDropdownProps, context: any) {
        super(props, context);

        this.handleAddToCategory = this.handleAddToCategory.bind(this);
        this.handleCreateCategory = this.handleCreateCategory.bind(this);
        this.handleRemoveFromCategory = this.handleRemoveFromCategory.bind(this);
        this.handleSubscribe = this.handleSubscribe.bind(this);
        this.handleUnsubscribe = this.handleUnsubscribe.bind(this);
    }

    handleCreateCategory() {
        const { feed, onAddToCategory, onCreateCategory, onSubscribe, subscription } = this.props;
        const label = this.categoryLabelInput.value;

        if (subscription) {
            onCreateCategory(label, () => onAddToCategory(subscription, label));
        } else {
            onCreateCategory(label, () => onSubscribe(feed, [label]));
        }

        this.categoryLabelInput.value = '';
    }

    handleAddToCategory(label: string) {
        const { onAddToCategory, subscription } = this.props;

        if (subscription) {
            onAddToCategory(subscription, label);
        }
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

        return (
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
                    onSelect={this.handleUnsubscribe}
                    primaryText="Unsubscribe" />
            </Dropdown>
        )
    }
}

interface SubscribeButtonProps {
    isSubscribed: boolean;
    isLoading: boolean;
    onClick?: (event: React.MouseEvent<any>) => void;
    onKeyDown?: (event: React.KeyboardEvent<any>) => void;
}

class SubscribeButton extends PureComponent<SubscribeButtonProps, {}> {
    render() {
        const { isSubscribed, isLoading, onClick, onKeyDown } = this.props;

        if (isSubscribed) {
            return (
                <button 
                    onClick={onClick}
                    onKeyDown={onKeyDown}
                    className="button button-outline-default dropdown-arrow"
                    disabled={isLoading}>
                    <i className={classnames(
                        'icon icon-20',
                        isLoading ? 'icon-spinner icon-rotating' : 'icon-settings'
                    )} />
                </button>
            );
        } else {
            return (
                <button
                    onClick={onClick}
                    onKeyDown={onKeyDown}
                    className="button button-outline-positive dropdown-arrow"
                    disabled={isLoading}>
                    <i className={classnames(
                        'icon icon-20',
                        isLoading ? 'icon-spinner icon-rotating' : 'icon-plus-math'
                    )} />
                </button>
            );
        }
    }
}
