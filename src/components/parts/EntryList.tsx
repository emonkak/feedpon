import React, { PropTypes, PureComponent } from 'react';

import CollapsableEntryList from 'components/parts/CollapsableEntryList';
import ExpandedEntryList from 'components/parts/ExpandedEntryList';

export default class EntryList extends PureComponent<any, any> {
    static propTypes = {
        entries: PropTypes.array.isRequired,
        feed: PropTypes.object,
        loading: PropTypes.bool.isRequired,
        viewType: PropTypes.oneOf(['expanded', 'collapsable']).isRequired
    };

    render() {
        const { entries, loading, viewType } = this.props;

        switch (viewType) {
            case 'expanded':
                return (
                    <ExpandedEntryList entries={entries} loading={loading} />
                );

            case 'collapsable':
                return (
                    <CollapsableEntryList entries={entries} loading={loading} />
                );

            default:
                return null;
        }
    }
}
