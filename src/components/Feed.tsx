import React, { PropTypes, PureComponent } from 'react';

import Dropdown from 'components/parts/Dropdown';
import EntryList from 'components/parts/EntryList';
import MenuItem from 'components/parts/MenuItem';
import connect from 'utils/components/connect';
import { State } from 'messaging/types';
import { fetchFeed, markEntryAsRead, saveReadEntries, unselectFeed } from 'messaging/actions';

@connect((state: State) => {
    return {
        feed: state.feed,
        categories: state.categories,
        viewMode: state.preference.viewMode
    };
})
export default class Feed extends PureComponent<any, any> {
    static propTypes = {
        dispatch: PropTypes.func.isRequired,
        categories: PropTypes.array.isRequired,
        feed: PropTypes.shape({
            entries: PropTypes.array.isRequired,
            hasMoreEntries: PropTypes.bool.isRequired,
            isLoading: PropTypes.bool.isRequired,
            subscription: PropTypes.object.isRequired
        }),
        isScrolling: PropTypes.bool.isRequired,
        scrollTo: PropTypes.func.isRequired,
        viewMode: PropTypes.oneOf(['expanded', 'collapsible']).isRequired
    };

    componentWillMount() {
        const { dispatch, params } = this.props;

        dispatch(fetchFeed(params.feed_id));
    }

    componentWillUpdate(nextProps: any, nextState: any) {
        if (this.props.params.feed_id !== nextProps.params.feed_id) {
            const { feed, dispatch } = this.props;

            if (feed) {
                dispatch(saveReadEntries(feed.entries.filter(entry => entry.readAt)));
            }

            dispatch(fetchFeed(nextProps.params.feed_id));
        }
    }

    componentWillUnmount() {
        this.props.dispatch(unselectFeed());
    }

    handleMarkEntryAsRead(entryId: string) {
        this.props.dispatch(markEntryAsRead(entryId, new Date()));
    }

    handleLoadMoreEntries(event: React.SyntheticEvent<any>) {
        event.preventDefault();

        const { dispatch, params } = this.props;

        dispatch(fetchFeed(params.feed_id));
    }

    renderHeader() {
        const { feed } = this.props;

        if (feed == null) {
            return (
                <header className="feed-header">
                    <div className="container">
                        <div className="feed-header-content">
                            <div className="feed-metadata">
                                <span className="placeholder placeholder-animated placeholder-80" />
                                <span className="placeholder placeholder-animated placeholder-40" />
                            </div>
                        </div>
                    </div>
                </header>
            );
        }

        const { categories } = this.props;
        const isSubscribed = feed.subscription != null;
        const categoryId = isSubscribed ? feed.subscription.categoryId : null;

        const subscribeButton = isSubscribed
            ?  (
                <Dropdown
                    toggleButton={
                        <a className="button button-default dropdown-arrow" href="#">
                            <i className="icon icon-align-middle icon-20 icon-settings" />
                        </a>
                    }
                    pullRight={true}>
                    <div className="menu-heading">Category</div>
                    {categories.map(category => (
                        <MenuItem
                            key={category.categoryId}
                            icon={category.categoryId === categoryId ? <i className="icon icon-16 icon-checkmark" /> : null}
                            primaryText={category.title} />
                    ))}
                    <div className="menu-divider" />
                    <MenuItem primaryText="New Category..." />
                    <div className="menu-divider" />
                    <MenuItem
                        isDisabled={!isSubscribed}
                        primaryText="Unsubscribe" />
                </Dropdown>
            ) : (<a className="button button-positive dropdown-arrow" href="#">Subscribe</a>);

        return (
            <header className="feed-header">
                <div className="container">
                    <div className="feed-header-content">
                        <div className="feed-metadata">
                            <div className="feed-description">{feed.description}</div>
                            <div className="feed-info-list">
                                <span className="feed-info"><strong>{feed.subscribers}</strong> subscribers</span>
                                <span className="feed-info"><strong>{feed.entries.length}</strong> entries</span>
                            </div>
                        </div>
                        {subscribeButton}
                    </div>
                </div>
            </header>
        );
    }

    renderList() {
        const { feed, isScrolling, scrollTo, viewMode } = this.props;

        return (
            <EntryList
                entries={feed ? feed.entries : []}
                isLoading={!feed}
                isScrolling={isScrolling}
                onMarkAsRead={this.handleMarkEntryAsRead.bind(this)}
                scrollTo={scrollTo}
                viewMode={viewMode} />
        );
    }

    renderFooter() {
        const { feed } = this.props;

        if (feed == null) {
            return null;
        }

        if (feed.isLoading) {
            return (
                <footer className="feed-footer">
                    <i className="icon icon-32 icon-spinner " />
                </footer>
            );
        } else if (feed.hasMoreEntries) {
            return (
                <footer className="feed-footer">
                    <a
                        className="link-default"
                        href="#"
                        onClick={this.handleLoadMoreEntries.bind(this)}>
                        Load more entries...
                    </a>
                </footer>
            );
        } else {
            return (
                <footer className="feed-footer">
                    No more entries here.
                </footer>
            );
        }
    }

    render() {
        return (
            <div>
                {this.renderHeader()}
                {this.renderList()}
                {this.renderFooter()}
            </div>
        );
    }
}
