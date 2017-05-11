import React, { PureComponent } from 'react';
import { Link } from 'react-router';

import SubscribeButton from 'components/parts/SubscribeButton';
import { Category, Feed } from 'messaging/types';

interface FeedProps {
    categories: Category[];
    feed: Feed;
    onSubscribe: (feedId: string | number, categoryIds: (string | number)[]) => void;
    onUnsubscribe: (feedId: string | number) => void;
}

export default class FeedComponent extends PureComponent<FeedProps, {}> {
    constructor(props: FeedProps, context: any) {
        super(props, context);

        this.handleSubscribe = this.handleSubscribe.bind(this);
        this.handleUnsubscribe = this.handleUnsubscribe.bind(this);
    }

    handleSubscribe(categoryIds: (string | number)[]) {
        const { feed, onSubscribe } = this.props;

        onSubscribe(feed.feedId, categoryIds);
    }

    handleUnsubscribe() {
        const { feed, onUnsubscribe } = this.props;

        onUnsubscribe(feed.feedId);
    }

    render() {
        const { categories, feed } = this.props;

        return (
            <li className="list-group-item">
                <div className="u-margin-right">
                    <Link className="feed-title link-default" to={`/streams/${encodeURIComponent(feed.streamId)}`}>{feed.title}</Link>
                    <div className="feed-subscribers"><strong>{feed.subscribers}</strong> subscribers</div>
                    <div className="feed-description">{feed.description}</div>
                </div>
                <SubscribeButton
                    categories={categories}
                    onSubscribe={this.handleSubscribe}
                    onUnsubscribe={this.handleUnsubscribe}
                    subscription={feed.subscription} />
            </li>
        );
    }
}
