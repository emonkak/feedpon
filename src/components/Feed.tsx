import React, { PropTypes, PureComponent } from 'react';
import Waypoint from 'react-waypoint';

import CollapsibleEntryList from 'components/parts/CollapsibleEntryList';
import ExpandedEntryList from 'components/parts/ExpandedEntryList';
import connect from 'utils/components/connect';
import { State } from 'messaging/types';
import { fetchFeed, unselectFeed } from 'messaging/actions';

@connect((state: State) => ({
    feed: state.feed,
    viewType: state.viewType
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
        viewType: PropTypes.oneOf(['expanded', 'collapsible']).isRequired
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
        const { feed, scrollTo, viewType } = this.props;

        switch (viewType) {
            case 'expanded':
                return (
                    <ExpandedEntryList
                        entries={feed ? feed.entries : []}
                        loading={!feed} />
                );

            case 'collapsible':
                return (
                    <CollapsibleEntryList
                        entries={feed ? feed.entries : []}
                        loading={!feed}
                        scrollTo={scrollTo} />
                );

            default:
                return null;
        }
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
            return (
                <Waypoint onEnter={this.handleLoadMoreEntries.bind(this)}>
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
