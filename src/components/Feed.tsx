import React, { PropTypes, PureComponent } from 'react';

import EntryList from 'components/parts/EntryList';
import connect from 'utils/components/connect';
import { State } from 'messaging/types';
import { fetchFeed, unselectFeed } from 'messaging/actions';

@connect((state: State) => ({
    feed: state.feed,
    viewMode: state.viewMode
}))
export default class Feed extends PureComponent<any, any> {
    static propTypes = {
        dispatch: PropTypes.func.isRequired,
        feed: PropTypes.shape({
            entries: PropTypes.array.isRequired,
            hasMoreEntries: PropTypes.bool.isRequired,
            isLoading: PropTypes.bool.isRequired
        }),
        scrollTo: PropTypes.func.isRequired,
        viewMode: PropTypes.oneOf(['expanded', 'collapsible']).isRequired
    };

    componentWillMount() {
        const { dispatch, params } = this.props;

        dispatch(fetchFeed(params.feed_id));
    }

    componentWillUpdate(nextProps: any, nextState: any) {
        if (this.props.params.feed_id !== nextProps.params.feed_id) {
            const { dispatch } = this.props;

            dispatch(fetchFeed(nextProps.params.feed_id));
        }
    }

    componentWillUnmount() {
        const { dispatch } = this.props;

        dispatch(unselectFeed());
    }

    handleLoadMoreEntries(event: React.SyntheticEvent<any>) {
        const { dispatch, params } = this.props;

        event.preventDefault();

        dispatch(fetchFeed(params.feed_id));
    }

    renderList() {
        const { feed, scrollTo, viewMode } = this.props;

        return (
            <EntryList
                entries={feed ? feed.entries : []}
                loading={!feed}
                scrollTo={scrollTo}
                viewMode={viewMode} />
        );
    }

    renderLatest() {
        const { feed } = this.props;

        if (feed) {
            if (feed.isLoading) {
                return (
                    <div className="entry-latest">
                        <i className="icon icon-32 icon-spinner" />
                    </div>
                );
            } else if (feed.hasMoreEntries) {
                return (
                    <div className="entry-latest">
                        <a
                            className="link-default"
                            href="#"
                            onClick={this.handleLoadMoreEntries.bind(this)}>
                            Load more entries...
                        </a>
                    </div>
                );
            } else {
                return (
                    <div className="entry-latest">
                        No more entries here.
                    </div>
                );
            }
        }

        return null;
    }

    render() {
        return (
            <div>
                {this.renderList()}
                {this.renderLatest()}
            </div>
        );
    }
}
