import * as React from 'react';

import EntryList from 'components/parts/EntryList';
import connect from 'utils/components/connect';
import { State } from 'messaging/types';
import { fetchSubscription, unselectFeed } from 'messaging/actions';

@connect((state: State) => ({
    entries: state.entries,
    feed: state.feed,
    viewMode: state.viewMode
}))
export default class SubscriptionEntries extends React.PureComponent<any, any> {
    static propTypes = {
        dispatch: React.PropTypes.func.isRequired,
        entries: React.PropTypes.array.isRequired,
        feed: React.PropTypes.object,
        viewMode: React.PropTypes.string.isRequired
    };

    componentWillMount() {
        const { dispatch, params } = this.props;

        dispatch(fetchSubscription(params.subscription_id | 0));
    }

    componentWillReceiveProps(nextProps: any) {
        if (this.props.params.subscription_id !== nextProps.params.subscription_id) {
            const { dispatch } = this.props;

            dispatch(unselectFeed());

            dispatch(fetchSubscription(nextProps.params.subscription_id | 0));
        }
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
