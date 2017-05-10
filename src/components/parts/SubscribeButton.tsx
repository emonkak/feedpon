import React, { PureComponent } from 'react';

import Dropdown from 'components/parts/Dropdown';
import MenuItem from 'components/parts/MenuItem';
import { Category, Subscription } from 'messaging/types';

interface SubscribeButtonProps {
    categories: Category[];
    onSubscribe: (categoryIds: (string | number)[]) => void;
    onUnsubscribe: () => void;
    subscription: Subscription | null;
}

export default class SubscribeButton extends PureComponent<SubscribeButtonProps, {}> {
    constructor(props: SubscribeButtonProps, context: any) {
        super(props, context);
    }

    renderToggleButton() {
        const { subscription } = this.props;

        if (subscription) {
            return (
                <button className="button button-outline-default dropdown-arrow">
                    <i className="u-sm-inline-block u-md-none icon icon-20 icon-settings" />
                    <span className="u-sm-none u-md-inline">Edit</span>
                </button>
            );
        } else {
            return (
                <button className="button button-outline-positive dropdown-arrow">
                    <i className="u-sm-inline-block u-md-none icon icon-20 icon-plus-math" />
                    <span className="u-sm-none u-md-inline">Subscribe</span>
                </button>
            );
        }
    }

    renderCategoryMenuItem(category: Category) {
        const { onSubscribe, subscription } = this.props;

        if (subscription) {
            const isAdded = subscription.categoryIds.indexOf(category.categoryId) !==  -1;

            const subscribedCategories = isAdded
                ? subscription.categoryIds.filter((categoryId) => categoryId !== category.categoryId)
                : subscription.categoryIds.concat([category.categoryId]);

            return (
                <MenuItem
                    key={category.categoryId}
                    icon={isAdded ? <i className="icon icon-16 icon-checkmark" /> : null}
                    onSelect={onSubscribe.bind(null, subscribedCategories)}
                    primaryText={category.label} />
            );
        } else {
            const subscribedCategories = [category.categoryId];

            return (
                <MenuItem
                    key={category.categoryId}
                    onSelect={onSubscribe.bind(null, subscribedCategories)}
                    primaryText={category.label} />
            );
        }
    }

    render() {
        const { categories, onUnsubscribe, subscription } = this.props;

        return (
            <Dropdown
                toggleButton={this.renderToggleButton()}
                pullRight={true}>
                <div className="menu-heading">Category</div>
                {categories.map(this.renderCategoryMenuItem.bind(this))}
                <div className="menu-divider" />
                <MenuItem primaryText="New Category..." />
                <div className="menu-divider" />
                <MenuItem
                    isDisabled={!subscription}
                    onSelect={onUnsubscribe}
                    primaryText="Unsubscribe" />
            </Dropdown>
        );
    }
}
