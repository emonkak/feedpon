import Enumerable from '@emonkak/enumerable';
import React, { PureComponent } from 'react';

import '@emonkak/enumerable/extensions/take';
import '@emonkak/enumerable/extensions/toArray';
import '@emonkak/enumerable/extensions/where';

import Autocomplete from 'components/parts/Autocomplete';
import { MenuItem } from 'components/parts/Menu';
import { Subscription } from 'messaging/types';

interface FeedSearchFormProps {
    onSearch: (query: string) => void;
    onSelect: (path: string) => void;
    subscriptions: Subscription[];
}

export default class FeedSearchForm extends PureComponent<FeedSearchFormProps, {}> {
    constructor(props: FeedSearchFormProps, context: any) {
        super(props, context);

        this.handleComplete = this.handleComplete.bind(this);
    }

    handleComplete(query: string) {
        if (!query) {
            return [];
        }

        const splittedQueries = query.toLowerCase().split(/\s+/);
        const { subscriptions } = this.props;

        return new Enumerable(subscriptions)
            .where((subscription) => {
                const text = (subscription.title + ' ' + subscription.url).toLowerCase();
                return splittedQueries.every(query => text.includes(query));
            })
            .take(10)
            .toArray();
    }

    render() {
        const { onSearch, onSelect } = this.props;

        return (
            <Autocomplete inputControl={<input type="search" className="form-search-box" placeholder="Search for feeds ..." />}
                          getCandidates={this.handleComplete}
                          onSubmit={onSearch}
                          onSelect={onSelect}
                          renderCandidate={renderCandidate}
                          renderTailItems={renderTailItems} />
        );
    }
}

function renderCandidate(subscription: Subscription, query: string) {
    const icon = subscription.iconUrl
        ? <img alt={subscription.title} src={subscription.iconUrl} width={16} height={16} />
        : <i className="icon icon-16 icon-file" />;

    return (
        <MenuItem key={subscription.subscriptionId}
                  value={'streams/' + encodeURIComponent(subscription.streamId)}
                  primaryText={subscription.title}
                  secondaryText={subscription.unreadCount > 0 ? Number(subscription.unreadCount).toLocaleString() : ''}
                  icon={icon} />
    );
}

function renderTailItems(query: string) {
    if (!query) {
        return null;
    }

    return (
        <MenuItem value={'search/' + encodeURIComponent(query)}
                  primaryText={`Search for "${query}"`} />
    );
}
