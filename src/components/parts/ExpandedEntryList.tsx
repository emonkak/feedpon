import React, { PropTypes, PureComponent, cloneElement } from 'react';

import Entry from 'components/parts/Entry';
import EntryPlaceholder from 'components/parts/EntryPlaceholder';
import ScrollSpy from 'components/parts/ScrollSpy';
import { Entry as EntryType } from 'messaging/types';

export default class ExpandedEntryList extends PureComponent<any, any> {
    static propTypes = {
        entries: PropTypes.arrayOf(PropTypes.object),
        loading: PropTypes.bool
    };

    static defaultProps = {
        loading: false
    };

    renderActiveChild(child: React.ReactElement<any>) {
        return cloneElement(child, {
            ...child.props,
            active: true
        });
    }

    renderEntry(entry: EntryType) {
        return (
            <Entry
                key={entry.entryId}
                entry={entry}
                expanded={true} />
        );
    }

    render() {
        const { entries, loading } = this.props;

        if (loading) {
            return (
                <div className="entry-list">
                    <EntryPlaceholder expanded={true} />
                    <EntryPlaceholder expanded={true} />
                    <EntryPlaceholder expanded={true} />
                    <EntryPlaceholder expanded={true} />
                </div>
            );
        }

        return (
            <ScrollSpy
                className="entry-list"
                marginTop={48}
                renderActiveChild={this.renderActiveChild.bind(this)}>
                {entries.map(this.renderEntry.bind(this))}
            </ScrollSpy>
        );
    }
}
