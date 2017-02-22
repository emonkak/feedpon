import * as React from 'react';

import Entry from 'components/parts/Entry';
import connect from 'utils/components/connect';
import { fetchCategory, unselectFeed } from 'messaging/actions';

@connect()
export default class CategoryEntries extends React.PureComponent<any, any> {
    static propTypes = {
        dispatch: React.PropTypes.func.isRequired,
        entries: React.PropTypes.array.isRequired,
    };

    componentWillMount() {
        const { dispatch, params } = this.props;

        dispatch(fetchCategory(params.category_id | 0 ));
    }

    componentWillReceiveProps(nextProps: any) {
        if (this.props.params.category_id !== nextProps.params.category_id) {
            const { dispatch } = this.props;

            dispatch(fetchCategory(nextProps.params.category_id | 0));
        }
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
