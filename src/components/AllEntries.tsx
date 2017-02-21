import * as React from 'react';

import Entry from 'components/parts/Entry';
import connect from 'utils/components/connect';
import { fetchAllEntries, unselectFeed } from 'messaging/actions';

@connect()
export default class AllEntries extends React.PureComponent<any, any> {
    static propTypes = {
        dispatch: React.PropTypes.func.isRequired,
        entries: React.PropTypes.array.isRequired,
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
        const { entries } = this.props;

        return (
            <div className="container">
                {entries.map(entry => <Entry key={entry.entryId} {...entry} />)}
            </div>
        );
    }
}
