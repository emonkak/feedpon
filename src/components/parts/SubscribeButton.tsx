import React, { PureComponent } from 'react';
import classnames from 'classnames';

import Dropdown from 'components/parts/Dropdown';
import { Category, Feed, Subscription } from 'messaging/types';
import { MenuForm, MenuItem } from 'components/parts/Menu';

interface SubscribeButtonProps {
    feed: Feed;
    categories: Category[];
    onSubscribe: (feed: Feed, categoryIds: (string | number)[]) => void;
    onUnsubscribe: (feedId: string | number) => void;
    subscription: Subscription | null;
}

export default class SubscribeButton extends PureComponent<SubscribeButtonProps, {}> {
    private categoryNameInput: HTMLInputElement;

    constructor(props: SubscribeButtonProps, context: any) {
        super(props, context);

        this.handleCategorize = this.handleCategorize.bind(this);
        this.handleCreateCategory = this.handleCreateCategory.bind(this);
        this.handleUnsubscribe = this.handleUnsubscribe.bind(this);
    }

    handleCategorize(selectedCategoryId: string | number) {
        const { feed, onSubscribe, subscription } = this.props;

        if (subscription) {
            const { categoryIds } = subscription;
            const isAdded = categoryIds.indexOf(selectedCategoryId) === -1;

            const subscribedCategoryIds = isAdded
                ? categoryIds.concat([selectedCategoryId])
                : categoryIds.filter((categoryId) => categoryId !== selectedCategoryId);

            onSubscribe(feed, subscribedCategoryIds);
        } else {
            const subscribedCategoryIds = [selectedCategoryId];

            onSubscribe(feed, subscribedCategoryIds);
        }
    }

    handleUnsubscribe() {
        const { feed, onUnsubscribe } = this.props;

        onUnsubscribe(feed.feedId);
    }

    handleCreateCategory() {
    }

    renderToggleButton() {
        const { feed, subscription } = this.props;

        if (subscription) {
            return (
                <button className="button button-outline-default dropdown-arrow"
                        disabled={feed.isSubscribing}>
                    <i className={classnames(
                        'icon icon-20',
                        feed.isSubscribing ? 'icon-spinner animation-clockwise-rotation' : 'icon-settings'
                    )} />
                </button>
            );
        } else {
            return (
                <button className="button button-outline-positive dropdown-arrow"
                        disabled={feed.isSubscribing}>
                    <i className={classnames(
                        'icon icon-20',
                        feed.isSubscribing ? 'icon-spinner animation-clockwise-rotation' : 'icon-plus-math'
                    )} />
                </button>
            );
        }
    }

    renderCategoryMenuItem(category: Category) {
        const { subscription } = this.props;

        const isAdded = subscription && subscription.categoryIds.indexOf(category.categoryId) !== -1;

        return (
            <MenuItem value={category.categoryId}
                      key={category.categoryId}
                      icon={isAdded ? <i className="icon icon-16 icon-checkmark" /> : null}
                      onSelect={this.handleCategorize}
                      primaryText={category.label} />
        );
    }

    render() {
        const { categories, subscription } = this.props;

        return (
            <Dropdown
                toggleButton={this.renderToggleButton()}
                pullRight={true}>
                <div className="menu-heading">Category</div>
                {categories.map(this.renderCategoryMenuItem.bind(this))}
                <div className="menu-divider" />
                <div className="menu-heading">New category</div>
                <MenuForm onSubmit={this.handleCreateCategory}>
                    <div className="input-group">
                        <input type="text"
                                className="form-control"
                                style={{ width: '12rem' }}
                                placeholder="Category label"
                                ref={(ref) => this.categoryNameInput = ref} />
                        <button type="submit" className="button button-positive">OK</button>
                    </div>
                </MenuForm>
                <div className="menu-divider" />
                <MenuItem isDisabled={!subscription}
                          onSelect={this.handleUnsubscribe}
                          primaryText="Unsubscribe" />
            </Dropdown>
        );
    }
}
