import React, { PropTypes, PureComponent } from 'react';

import EntryList from 'components/parts/EntryList';
import Waypoint from 'components/parts/Waypoint';
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
        isScrolling: PropTypes.bool,
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

    handleLoadMoreEntries() {
        const { dispatch, params } = this.props;

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

    renderFooter() {
        const { feed } = this.props;

        if (feed === null) {
            return null;
        }

        if (feed.isLoading) {
            return (
                <div className="entry-footer">
                    <i className="icon icon-32 icon-size-24 icon-spinner" />Loading entries...
                </div>
            );
        } else if (feed.hasMoreEntries) {
            const { isScrolling } = this.props;

            return (
                <Waypoint disabled={isScrolling} onEnter={this.handleLoadMoreEntries.bind(this)}>
                    <div className="entry-footer">
                        No more entries here.
                    </div>
                </Waypoint>
            );
        } else {
            return (
                <div className="entry-footer">
                    No more entries here.
                </div>
            );
        }
    }

    render() {
        return (
            <div>
                {this.renderList()}
                {this.renderFooter()}
            </div>
        );
    }
}
