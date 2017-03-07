import React, { PropTypes, PureComponent } from 'react';

import CollapsibleEntryList from 'components/parts/CollapsibleEntryList';
import ExpandedEntryList from 'components/parts/ExpandedEntryList';

export default class EntryList extends PureComponent<any, any> {
    static propTypes = {
        entries: PropTypes.array.isRequired,
        feed: PropTypes.object,
        loading: PropTypes.bool.isRequired,
        scrollTo: PropTypes.func.isRequired,
        viewType: PropTypes.oneOf(['expanded', 'collapsible']).isRequired
    };

    render() {
        const { entries, loading, scrollTo, viewType } = this.props;

        switch (viewType) {
            case 'expanded':
                return (
                    <ExpandedEntryList
                        entries={entries}
                        loading={loading} />
                );

            case 'collapsible':
                return (
                    <CollapsibleEntryList
                        entries={entries}
                        loading={loading}
                        scrollTo={scrollTo} />
                );

            default:
                return null;
        }
    }
}
