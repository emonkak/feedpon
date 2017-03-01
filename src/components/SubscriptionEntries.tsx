import React, { PropTypes, PureComponent } from 'react';

import EntryList from 'components/parts/EntryList';
import connect from 'utils/components/connect';
import { State } from 'messaging/types';
import { fetchSubscription, unselectFeed } from 'messaging/actions';

@connect((state: State) => ({
    entries: state.entries,
    feed: state.feed,
    viewType: state.viewType
}))
export default class SubscriptionEntries extends PureComponent<any, any> {
    static propTypes = {
        dispatch: PropTypes.func.isRequired,
        entries: PropTypes.array.isRequired,
        feed: PropTypes.object,
        viewType: PropTypes.string.isRequired
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
        const { entries, feed, viewType } = this.props;

        return (
            <EntryList
                loading={!feed}
                entries={entries}
                viewType={viewType} />
        );
    }
}
