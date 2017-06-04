import React, { PureComponent } from 'react';

import { Category, Feed, Subscription } from 'messaging/types';
import { Menu, MenuForm, MenuItem } from 'components/parts/Menu';

interface SubscribeMenuProps {
    categories: Category[];
    feed: Feed;
    onAddToCategory: (subscription: Subscription, label: string) => void;
    onClose?: () => void;
    onCreateCategory: (label: string, callback: (category: Category) => void) => void;
    onKeyDown?: (event: React.KeyboardEvent<any>) => void;
    onRemoveFromCategory: (subscription: Subscription, label: string) => void;
    onSelect?: (value?: any) => void;
    onSubscribe: (feed: Feed, labels: string[]) => void;
    onUnsubscribe: (subscription: Subscription) => void;
    subscription: Subscription | null;
}

export default class SubscribeMenu extends PureComponent<SubscribeMenuProps, {}> {
    private categoryLabelInput: HTMLInputElement;

    constructor(props: SubscribeMenuProps, context: any) {
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
                    key={category.categoryId}
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
        const { categories, onClose, onKeyDown, onSelect, subscription } = this.props;

        return (
            <Menu
                onClose={onClose}
                onKeyDown={onKeyDown}
                onSelect={onSelect}>
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
            </Menu>
        )
    }
}
