import * as React from 'react';

import Entry from 'components/parts/Entry';
import EntryPlaceholder from 'components/parts/EntryPlaceholder';

export default class Entries extends React.Component<any, any> {
    static propTypes = {
        entries: React.PropTypes.array.isRequired,
        isLoading: React.PropTypes.bool
    };

    static defaultProps = {
        isLoading: false
    };

    render() {
        const { entries, isLoading } = this.props;

        if (isLoading) {
            return (
                <div>
                    <EntryPlaceholder />
                    <EntryPlaceholder />
                    <EntryPlaceholder />
                </div>
            );
        }

        return (
            <div>
                {entries.map(entry => <Entry key={entry.entryId} {...entry} />)}
            </div>
        );
    }
}

