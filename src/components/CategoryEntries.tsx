import * as React from 'react';

import Entries from 'components/parts/Entries';
import connect from 'utils/components/connect';
import { State } from 'messaging/types';
import { fetchCategory, unselectFeed } from 'messaging/actions';

@connect((state: State) => ({
    entries: state.entries,
    feed: state.feed,
}))
export default class CategoryEntries extends React.PureComponent<any, any> {
    static propTypes = {
        dispatch: React.PropTypes.func.isRequired,
        entries: React.PropTypes.array.isRequired,
        feed: React.PropTypes.object,
    };

    componentWillMount() {
        const { dispatch, params } = this.props;

        dispatch(fetchCategory(params.category_id | 0 ));
    }

    componentWillReceiveProps(nextProps: any) {
        if (this.props.params.category_id !== nextProps.params.category_id) {
            const { dispatch } = this.props;

            dispatch(unselectFeed());

            dispatch(fetchCategory(nextProps.params.category_id | 0));
        }
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
