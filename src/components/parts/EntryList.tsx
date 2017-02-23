import * as React from 'react';

import Entry from 'components/parts/Entry';
import EntryPlaceholder from 'components/parts/EntryPlaceholder';

export default class EntryList extends React.PureComponent<any, any> {
    static propTypes = {
        entries: React.PropTypes.array.isRequired,
        feed: React.PropTypes.object,
        isLoading: React.PropTypes.bool.isRequired,
        viewMode: React.PropTypes.oneOf(['full', 'compact', 'magazine']).isRequired
    };

    render() {
        const { entries, isLoading, viewMode } = this.props;

        if (isLoading) {
            return (
                <div>
                    <EntryPlaceholder viewMode={viewMode} />
                    <EntryPlaceholder viewMode={viewMode} />
                    <EntryPlaceholder viewMode={viewMode} />
                    <EntryPlaceholder viewMode={viewMode} />
                    <EntryPlaceholder viewMode={viewMode} />
                    <EntryPlaceholder viewMode={viewMode} />
                    <EntryPlaceholder viewMode={viewMode} />
                    <EntryPlaceholder viewMode={viewMode} />
                </div>
            );
        }

        return (
            <div>
                {entries.map(entry => <Entry key={entry.entryId} viewMode={viewMode} {...entry} />)}
            </div>
        );
    }
}
