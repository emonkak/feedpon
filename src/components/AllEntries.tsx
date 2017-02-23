import * as React from 'react';

import Entries from 'components/parts/Entries';
import connect from 'utils/components/connect';
import { State } from 'messaging/types';
import { fetchAllEntries, unselectFeed } from 'messaging/actions';

@connect((state: State) => ({
    entries: state.entries,
    feed: state.feed,
}))
export default class AllEntries extends React.PureComponent<any, any> {
    static propTypes = {
        dispatch: React.PropTypes.func.isRequired,
        entries: React.PropTypes.array.isRequired,
        feed: React.PropTypes.object
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
        const { feed, entries } = this.props;

        return (
            <div className="container">
                <Entries isLoading={!feed} entries={entries} />
            </div>
        );
    }
}
