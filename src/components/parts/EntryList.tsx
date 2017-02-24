import React, { PropTypes, PureComponent, cloneElement } from 'react';

import Entry from 'components/parts/Entry';
import EntryPlaceholder from 'components/parts/EntryPlaceholder';
import ScrollSpy from 'components/parts/ScrollSpy';

export default class EntryList extends PureComponent<any, any> {
    static propTypes = {
        entries: PropTypes.array.isRequired,
        feed: PropTypes.object,
        isLoading: PropTypes.bool.isRequired,
        viewMode: PropTypes.oneOf(['full', 'compact', 'magazine']).isRequired
    };

    renderActiveChild(child: React.ReactElement<any>) {
        return cloneElement(child, {
            ...child.props,
            isActive: true
        });
    }

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
            <ScrollSpy renderActiveChild={this.renderActiveChild.bind(this)}>
                {entries.map(entry => <Entry key={entry.entryId} viewMode={viewMode} {...entry} />)}
            </ScrollSpy>
        );
    }
}
