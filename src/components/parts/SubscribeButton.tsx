import React, { PureComponent } from 'react';
import classnames from 'classnames';

import Dropdown from 'components/parts/Dropdown';
import { Category, Feed, Subscription } from 'messaging/types';
import { MenuForm, MenuItem } from 'components/parts/Menu';

interface SubscribeButtonProps {
    categories: Category[];
    feed: Feed;
    onCreateCategory: (label: string, callback: (category: Category) => void) => void;
    onSubscribe: (feed: Feed, labels: string[]) => void;
    onUnsubscribe: (feedId: string | number) => void;
    subscription: Subscription | null;
}

export default class SubscribeButton extends PureComponent<SubscribeButtonProps, {}> {
    private categoryLabelInput: HTMLInputElement | null;

    constructor(props: SubscribeButtonProps, context: any) {
        super(props, context);

        this.handleAddToCategory = this.handleAddToCategory.bind(this);
        this.handleCreateCategory = this.handleCreateCategory.bind(this);
        this.handleRemoveFromCategory = this.handleRemoveFromCategory.bind(this);
        this.handleUncategorize = this.handleUncategorize.bind(this);
        this.handleUnsubscribe = this.handleUnsubscribe.bind(this);
    }

    handleAddToCategory(selectedLabel: string) {
        const { feed, onSubscribe, subscription } = this.props;

        const selectedLabels = subscription
            ? subscription.labels.concat([selectedLabel])
            : [selectedLabel];

        onSubscribe(feed, selectedLabels);
    }

    handleUncategorize() {
        const { feed, onSubscribe } = this.props;

        onSubscribe(feed, []);
    }

    handleCreateCategory() {
        if (this.categoryLabelInput) {
            const { feed, onCreateCategory, onSubscribe, subscription } = this.props;
            const label = this.categoryLabelInput.value;

            const selectedLabels = subscription
                ? subscription.labels.concat([label])
                : [label];

            onCreateCategory(label, (category) => onSubscribe(feed, selectedLabels));
        }
    }

    handleRemoveFromCategory(selectedLabel: string) {
        const { feed, onSubscribe, subscription } = this.props;

        const selectedLabels = subscription
            ? subscription.labels.filter((label) => label !== selectedLabel)
            : [selectedLabel];

        onSubscribe(feed, selectedLabels);
    }

    handleUnsubscribe() {
        const { feed, onUnsubscribe } = this.props;

        onUnsubscribe(feed.feedId);
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

        const isAdded = subscription && subscription.labels.indexOf(category.label) !== -1;

        return (
            <MenuItem value={category.label}
                      key={category.categoryId}
                      icon={isAdded ? <i className="icon icon-16 icon-checkmark" /> : null}
                      onSelect={isAdded ? this.handleRemoveFromCategory : this.handleAddToCategory}
                      primaryText={category.label} />
        );
    }

    render() {
        const { categories, subscription } = this.props;

        const isUncategorized = !!subscription && subscription.labels.length === 0;

        return (
            <Dropdown
                toggleButton={this.renderToggleButton()}
                pullRight={true}>
                <div className="menu-heading">Category</div>
                {categories.map(this.renderCategoryMenuItem.bind(this))}
                <MenuItem icon={isUncategorized ? <i className="icon icon-16 icon-checkmark" /> : null}
                          isDisabled={isUncategorized}
                          onSelect={this.handleUncategorize}
                          primaryText="Uncategorized" />
                <div className="menu-divider" />
                <div className="menu-heading">New category</div>
                <MenuForm onSubmit={this.handleCreateCategory}>
                    <div className="input-group">
                        <input type="text"
                               className="form-control"
                               style={{ width: '12rem' }}
                               ref={(ref) => this.categoryLabelInput = ref} />
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
