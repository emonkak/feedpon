import React, { PropTypes, PureComponent } from 'react';

import EntryList from 'components/parts/EntryList';
import connect from 'utils/components/connect';
import { State } from 'messaging/types';
import { fetchAllEntries, unselectFeed } from 'messaging/actions';

@connect((state: State) => ({
    entries: state.entries,
    feed: state.feed,
    viewMode: state.viewMode
}))
export default class AllEntries extends PureComponent<any, any> {
    static propTypes = {
        dispatch: PropTypes.func.isRequired,
        entries: PropTypes.array.isRequired,
        feed: PropTypes.object,
        viewMode: PropTypes.string.isRequired
    };

    componentWillMount() {
        const { dispatch } = this.props;

        dispatch(fetchAllEntries());
    }

    componentWillUnmount() {
        const { dispatch } = this.props;

        dispatch(unselectFeed());
    }

    render() {
        const { entries, feed, viewMode } = this.props;

        return (
            <EntryList
                isLoading={!feed}
                entries={entries}
                viewMode={viewMode} />
        );
    }
}
